import { useState, useEffect, useRef } from 'react';
import { generateKeyPair, exportPublicKey, importPublicKey, deriveSharedSecret, encryptMessage, decryptMessage } from './cryptoUtils';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const ws = useRef(null);
  const [aesKey, setAesKey] = useState(null);
  const [showCiphertext, setShowCiphertext] = useState(false);

  const [myKeyPair, setMyKeyPair] = useState(null);
  const [terminalLogs, setTerminalLogs] = useState([
    "> System initialized...",
    "> Awaiting cryptographic exchange..."
  ]);

  useEffect(() => {
    const setupSecurity = async () => {
      try {
        setTerminalLogs(prev => [...prev, "> Generating ECDH Key Pair..."]);
        const keys = await generateKeyPair();
        setMyKeyPair(keys);
        
        const exportedPublic = await exportPublicKey(keys.publicKey);
        setTerminalLogs(prev => [...prev, `> Public Key generated: ${exportedPublic.x.substring(0, 15)}...`]);

        ws.current = new WebSocket('ws://localhost:8080');

        ws.current.onopen = () => {
          setTerminalLogs(prev => [...prev, "> WebSocket connected. Broadcasting public key..."]);
          
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
              
              const peerPublicKey = await importPublicKey(data.publicKey);
              const sharedSecret = await deriveSharedSecret(keys.privateKey, peerPublicKey);
              setAesKey(sharedSecret);
              
              setTerminalLogs(prev => [...prev, "> CRITICAL: AES-256 Shared Secret Derived Successfully!"]);
              
              const replyPayload = JSON.stringify({
                type: 'HANDSHAKE_REPLY',
                publicKey: exportedPublic
              });
              ws.current.send(replyPayload);
            } 
            
            else if (data.type === 'HANDSHAKE_REPLY') {
              setTerminalLogs(prev => [...prev, `> Received Handshake Reply: ${data.publicKey.x.substring(0, 15)}...`]);
              
              const peerPublicKey = await importPublicKey(data.publicKey);
              const sharedSecret = await deriveSharedSecret(keys.privateKey, peerPublicKey);
              setAesKey(sharedSecret);
              
              setTerminalLogs(prev => [...prev, "> CRITICAL: AES-256 Shared Secret Derived Successfully!"]);
            }
            
            else if (data.type === 'CHAT') {
              if (data.ciphertext && data.iv) {
                setTerminalLogs(prev => [...prev, `> Inbound Encrypted: ${data.ciphertext.substring(0, 20)}...`]);
                
                setAesKey(currentAesKey => {
                  if (currentAesKey) {
                    decryptMessage(data.ciphertext, data.iv, currentAesKey)
                      .then(decryptedText => {
                      setMessages(prev => [...prev, { 
                          sender: 'Peer', 
                          text: decryptedText, 
                          cipher: data.ciphertext 
                      }]);                       
                      setTerminalLogs(prev => [...prev, `> Successfully decrypted payload.`]);
                      })
                      .catch(err => console.error("Decryption failed", err));
                  } else {
                     setTerminalLogs(prev => [...prev, `> ERROR: No AES key to decrypt message!`]);
                  }
                  return currentAesKey; 
                });
              }
            }
          } catch (e) {
            console.log("Ignored non-JSON message", e);
          }
        };
      } catch (error) {
        console.error("Cryptography setup failed:", error);
        setTerminalLogs(prev => [...prev, "> ERROR: Cryptography setup failed. Check console."]);
      }
    };

    setupSecurity();

    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {

      if (aesKey) {
        // --- ENCRYPTED MODE ---
        const { ciphertext, iv } = await encryptMessage(inputText, aesKey);

        const payload = JSON.stringify({
          type: 'CHAT',
          ciphertext: ciphertext,
          iv: iv
        });

        ws.current.send(payload);

        setTerminalLogs(prev => [...prev, `> Outbound Encrypted: ${ciphertext.substring(0, 20)}...`]);

        setMessages(prev => [...prev, { 
            sender: 'Me', 
            text: inputText, 
            cipher: ciphertext 
        }]);
      } else {
        // --- UNSECURED FALLBACK ---
        const payload = JSON.stringify({ type: 'CHAT', text: inputText });
        ws.current.send(payload);
        
        // FIX: Provide a fallback string instead of the undefined 'ciphertext' variable
        setMessages(prev => [...prev, { 
            sender: 'Me', 
            text: inputText, 
            cipher: "[Unencrypted System Message]" 
        }]);    
      }

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
        
        {/* Chat Header with Toggle */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
          <div>
            <h2 className="text-xl font-bold text-green-400 flex items-center gap-2">
              Secure Chat 
              {aesKey && <span title="AES-256 Secured" className="text-sm px-2 py-1 bg-green-900 text-green-300 rounded-full">🔒 E2EE Active</span>}
            </h2>
          </div>
          
          <button 
            onClick={() => setShowCiphertext(!showCiphertext)}
            className={`text-xs font-bold px-3 py-1 rounded transition-colors ${showCiphertext ? 'bg-red-600 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`}
          >
            {showCiphertext ? '⚠️ HACKER VIEW (CIPHERTEXT)' : 'USER VIEW (PLAINTEXT)'}
          </button>
        </div>

        {/* Chat Messages Area */}
        <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3">
          {messages.length === 0 ? (
            <div className="text-gray-400 italic mt-auto">Waiting for messages...</div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex flex-col w-fit max-w-[80%] ${msg.sender === 'Me' ? 'self-end' : 'self-start'}`}>
                <span className="text-xs text-gray-500 mb-1">{msg.sender}</span>
                <div className={`p-3 rounded-lg ${msg.sender === 'Me' ? 'bg-blue-600' : 'bg-gray-700'} ${showCiphertext ? 'font-mono text-xs break-all bg-red-900 text-red-200 border border-red-700' : ''}`}>
                  {showCiphertext ? (msg.cipher || 'Unencrypted system message') : msg.text}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* FIX: Removed the duplicated Chat Input Area from here */}
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
        
        {terminalLogs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>

    </div>
  )
}

export default App;