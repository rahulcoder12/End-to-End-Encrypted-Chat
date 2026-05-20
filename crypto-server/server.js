const WebSocket = require('ws');

// Start a WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });

// THE SWITCHBOARD: This Map links a username (String) to their active WebSocket connection (Object)
const activeUsers = new Map();

console.log("Secure Routing Server running on ws://localhost:8080");

wss.on('connection', (socket) => {
    let currentUsername = null; // Track who this specific socket belongs to

    socket.on('message', (message) => {
        const data = JSON.parse(message.toString());

        // 1. REGISTRATION: A user joins and declares their name
        if (data.type === 'JOIN') {
            currentUsername = data.username;
            
            // Add them to the switchboard
            activeUsers.set(currentUsername, socket);
            console.log(`[LOGIN] ${currentUsername} joined the network.`);

            // Broadcast the updated online roster to EVERYONE
            broadcastUserList();
        }
        
        // 2. TARGETED ROUTING: Handshakes or Chats meant for a specific person
        else if (data.target) {
            // Check if the person they are trying to message is actually online
            if (activeUsers.has(data.target)) {
                const targetSocket = activeUsers.get(data.target);
                
                if (targetSocket.readyState === WebSocket.OPEN) {
                    // Tag the message with the sender's name so the receiver knows who it's from
                    data.sender = currentUsername;
                    targetSocket.send(JSON.stringify(data));
                }
            } else {
                console.log(`[ERROR] Attempted to route message to offline user: ${data.target}`);
            }
        }
    });

    // 3. DISCONNECT: A user closes their tab
    socket.on('close', () => {
        if (currentUsername) {
            // Remove them from the switchboard
            activeUsers.delete(currentUsername);
            console.log(`[LOGOUT] ${currentUsername} left the network.`);
            
            // Broadcast the updated roster so they disappear from everyone's sidebar
            broadcastUserList();
        }
    });
});

// Helper function to send the list of online users to everyone
function broadcastUserList() {
    const userList = Array.from(activeUsers.keys()); // Extract just the names
    const rosterMessage = JSON.stringify({ 
        type: 'USER_LIST', 
        users: userList 
    });
    
    activeUsers.forEach((clientSocket) => {
        if (clientSocket.readyState === WebSocket.OPEN) {
            clientSocket.send(rosterMessage);
        }
    });
}