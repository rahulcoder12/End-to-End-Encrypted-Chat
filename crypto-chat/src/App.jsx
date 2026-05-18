import { useState, useEffect, useRef } from 'react';
import { generateKeyPair, exportPublicKey, importPublicKey, deriveSharedSecret } from './cryptoUtils';

function App() {
  // --- States from Day 3 (The Pipeline) ---
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const ws = useRef(null);
  const [aesKey, setAesKey] = useState(null);

  // --- States from Day 4 (The Cryptography) ---
  const [myKeyPair, setMyKeyPair] = useState(null);
  const [terminalLogs, setTerminalLogs] = useState([
    "> System initialized...",
    "> Awaiting cryptographic exchange..."
  ]);

  // useEffect runs once when the app loads
  useEffect(() => {
    const setupSecurity = async () => {
      try {
        // 1. Generate the cryptographic keys
        setTerminalLogs(prev => [...prev, "> Generating ECDH Key Pair..."]);
        const keys = await generateKeyPair();
        setMyKeyPair(keys);
        
        // Export public key to show in terminal
        const exportedPublic = await exportPublicKey(keys.publicKey);
        setTerminalLogs(prev => [...prev, `> Public Key generated: ${exportedPublic.x.substring(0, 15)}...`]);

        // 2. Connect to the WebSocket
        ws.current = new WebSocket('ws://localhost:8080');

                ws.current.onopen = () => {
          setTerminalLogs(prev => [...prev, "> WebSocket connected. Broadcasting public key..."]);
          
          // Package the public key as a JSON object and send it
          const handshakePayload = JSON.stringify({
            type: 'HANDSHAKE',
            publicKey: exportedPublic
          });
          ws.current.send(handshakePayload);
        };

                ws.current.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'HANDSHAKE') {
              setTerminalLogs(prev => [...prev, `> Received Peer's Public Key: ${data.publicKey.x.substring(0, 15)}...`]);
              
              // 1. Convert the JSON key back into a Web Crypto Key
              const peerPublicKey = await importPublicKey(data.publicKey);
              
              // 2. Derive the AES-256 Shared Secret!
              // Note: We use the 'keys' variable generated earlier in the useEffect
              const sharedSecret = await deriveSharedSecret(keys.privateKey, peerPublicKey);
              
              // 3. Save it to React state so we can use it to encrypt messages later
              setAesKey(sharedSecret);
              
              setTerminalLogs(prev => [...prev, "> CRITICAL: AES-256 Shared Secret Derived Successfully!"]);
              setTerminalLogs(prev => [...prev, "> Chat is now secured. Ready to encrypt."]);
            } 
            else if (data.type === 'CHAT') {
              setMessages((prevMessages) => [...prevMessages, data.text]);
            }
          } catch (e) {
            setMessages((prevMessages) => [...prevMessages, event.data]);
          }
        };
      } catch (error) {
        console.error("Cryptography setup failed:", error);
        setTerminalLogs(prev => [...prev, "> ERROR: Cryptography setup failed. Check console."]);
      }
    };

    setupSecurity();

    // Cleanup function
    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  // Function to handle sending a message
    const sendMessage = () => {
    if (inputText.trim() === '') return;
    
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      // Package the chat message as a JSON object
      const chatPayload = JSON.stringify({
        type: 'CHAT',
        text: inputText
      });
      
      ws.current.send(chatPayload);
      setInputText(''); 
    }
  };

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
        
        {/* Dynamically render the logs */}
        {terminalLogs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>

    </div>
  )
}

export default App;