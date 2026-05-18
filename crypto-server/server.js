const WebSocket = require('ws');

// Start a WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });

console.log("Secure Signaling Server running on ws://localhost:8080");

// This runs every time a new user connects
wss.on('connection', (socket) => {
    console.log("New client connected!");

    // This runs every time the server receives a message from a user
    socket.on('message', (message) => {
        // Convert the raw buffer to a readable string
        const incomingMessage = message.toString();
        console.log(`Received payload: ${incomingMessage}`);

        // Broadcast: Send this message to everyone EXCEPT the sender
        wss.clients.forEach((client) => {
            // Check if the client's connection is open AND the client is not the sender
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(incomingMessage);
            }
        });
    });

    // This runs when a user closes their browser tab
    socket.on('close', () => {
        console.log("Client disconnected.");
    });
});