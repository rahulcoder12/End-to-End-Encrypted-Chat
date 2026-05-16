import { useState, useEffect, useRef } from 'react'

function App() {
  // State to hold all chat messages
  const [messages, setMessages] = useState([]);
  // State to hold whatever the user is currently typing
  const [inputText, setInputText] = useState('');
  // Ref to hold our active WebSocket connection
  const ws = useRef(null);

  // useEffect runs once when the app loads
  useEffect(() => {
    // 1. Connect to the Node.js server we built on Day 2
    ws.current = new WebSocket('ws://localhost:8080');

    // 2. Listen for a successful connection
    ws.current.onopen = () => {
      console.log("Connected to the server!");
    };

    // 3. Listen for incoming messages from the server
    ws.current.onmessage = (event) => {
      // Add the new message to our list of messages
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    // 4. Cleanup function if the user closes the tab
    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  // Function to handle sending a message
  const sendMessage = () => {
    // Don't send empty messages
    if (inputText.trim() === '') return;
    
    // Send the text to the Node.js server
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(inputText);
      setInputText(''); // Clear the input box after sending
    }
  };

  // Function to allow pressing "Enter" to send
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      
      {/* LEFT PANE: Contacts / Active Sessions */}
      <div className="w-1/4 bg-gray-800 border-r border-gray-700 p-4">
        <h2 className="text-xl font-bold mb-4 text-blue-400">Active Sessions</h2>
        <div className="p-3 bg-gray-700 rounded-lg mb-2 cursor-pointer hover:bg-gray-600">
          Global Chat Room
        </div>
      </div>

      {/* CENTER PANE: The User View (Chat) */}
      <div className="w-2/4 flex flex-col bg-gray-900">
        <div className="p-4 border-b border-gray-700 flex-1 overflow-y-auto flex flex-col gap-2">
          <h2 className="text-xl font-bold mb-4 text-green-400">Secure Chat</h2>
          
          {/* This is where we draw the messages on the screen */}
          {messages.length === 0 ? (
            <div className="text-gray-400 italic mt-auto">Waiting for messages...</div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="p-3 bg-gray-800 rounded-lg w-fit max-w-md">
                {msg}
              </div>
            ))
          )}
        </div>
        
        {/* Chat Input Area */}
        <div className="p-4 bg-gray-800 flex gap-2">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type an encrypted message..." 
            className="flex-1 p-3 rounded bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded"
          >
            Send
          </button>
        </div>
      </div>

      {/* RIGHT PANE: The Engineer View (Terminal) */}
      <div className="w-1/4 bg-black border-l border-gray-700 p-4 font-mono text-xs text-green-500 overflow-y-auto">
        <h2 className="text-sm font-bold mb-4 text-gray-400 uppercase tracking-widest">System Terminal</h2>
        <div>&gt; System initialized...</div>
        <div>&gt; WebSocket connected to ws://localhost:8080</div>
        <div>&gt; Awaiting cryptographic exchange...</div>
      </div>

    </div>
  )
}

export default App