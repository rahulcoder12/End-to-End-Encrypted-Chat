const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const registeredAccounts = new Map(); 
const activeUsers = new Map(); 

console.log("Secure Routing Server running on ws://localhost:8080");

wss.on('connection', (socket) => {
    let currentUsername = null; 

    socket.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());

            if (data.type === 'REGISTER') {
                if (registeredAccounts.has(data.username)) {
                    socket.send(JSON.stringify({ type: 'AUTH_ERROR', message: 'Username is already taken.' }));
                } else {
                    registeredAccounts.set(data.username, data.password);
                    currentUsername = data.username;
                    activeUsers.set(currentUsername, socket);
                    
                    socket.send(JSON.stringify({ type: 'AUTH_SUCCESS' }));
                    console.log(`[REGISTER] ${currentUsername} created an account.`);
                    broadcastUserList();
                }
            }
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
            // THE FIX: Explicitly send the roster if a client requests it
            else if (data.type === 'REQUEST_USER_LIST') {
                const userList = Array.from(activeUsers.keys());
                socket.send(JSON.stringify({ type: 'USER_LIST', users: userList }));
            }
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
        } catch (err) {
            console.error("Non-JSON message dropped.");
        }
    });

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