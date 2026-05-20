const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

// --- THE IN-MEMORY DATABASE ---
// Stores { username: password }
const registeredAccounts = new Map(); 
// Stores { username: socket_connection }
const activeUsers = new Map(); 

console.log("Secure Routing Server running on ws://localhost:8080");

wss.on('connection', (socket) => {
    let currentUsername = null; 

    socket.on('message', (message) => {
        const data = JSON.parse(message.toString());

        // 1. REGISTER A NEW ACCOUNT
        if (data.type === 'REGISTER') {
            if (registeredAccounts.has(data.username)) {
                socket.send(JSON.stringify({ type: 'AUTH_ERROR', message: 'Username is already taken.' }));
            } else {
                // Save their password and log them in
                registeredAccounts.set(data.username, data.password);
                currentUsername = data.username;
                activeUsers.set(currentUsername, socket);
                
                socket.send(JSON.stringify({ type: 'AUTH_SUCCESS' }));
                console.log(`[REGISTER] ${currentUsername} created an account.`);
                broadcastUserList();
            }
        }
        
        // 2. LOG INTO AN EXISTING ACCOUNT
        else if (data.type === 'LOGIN') {
            if (!registeredAccounts.has(data.username)) {
                socket.send(JSON.stringify({ type: 'AUTH_ERROR', message: 'Account not found. Please register.' }));
            } else if (registeredAccounts.get(data.username) !== data.password) {
                socket.send(JSON.stringify({ type: 'AUTH_ERROR', message: 'Incorrect password.' }));
            } else if (activeUsers.has(data.username)) {
                socket.send(JSON.stringify({ type: 'AUTH_ERROR', message: 'User is already logged in elsewhere.' }));
            } else {
                currentUsername = data.username;
                activeUsers.set(currentUsername, socket);
                
                socket.send(JSON.stringify({ type: 'AUTH_SUCCESS' }));
                console.log(`[LOGIN] ${currentUsername} logged in.`);
                broadcastUserList();
            }
        }
        // NEW: Send the roster only to the person who asked for it
        else if (data.type === 'REQUEST_USER_LIST') {
            const userList = Array.from(activeUsers.keys());
            socket.send(JSON.stringify({ type: 'USER_LIST', users: userList }));
        }

        // 3. TARGETED ROUTING (Handshakes & Chat)

        // 3. TARGETED ROUTING (Handshakes & Chat)
        else if (data.target) {
            if (activeUsers.has(data.target)) {
                const targetSocket = activeUsers.get(data.target);
                if (targetSocket.readyState === WebSocket.OPEN) {
                    data.sender = currentUsername;
                    targetSocket.send(JSON.stringify(data));
                }
            } else {
                console.log(`[ERROR] Attempted to route message to offline user: ${data.target}`);
            }
        }
    });

    // 4. DISCONNECT
    socket.on('close', () => {
        if (currentUsername) {
            activeUsers.delete(currentUsername);
            console.log(`[LOGOUT] ${currentUsername} left the network.`);
            broadcastUserList();
        }
    });
});

function broadcastUserList() {
    const userList = Array.from(activeUsers.keys()); 
    const rosterMessage = JSON.stringify({ type: 'USER_LIST', users: userList });
    
    activeUsers.forEach((clientSocket) => {
        if (clientSocket.readyState === WebSocket.OPEN) {
            clientSocket.send(rosterMessage);
        }
    });
}