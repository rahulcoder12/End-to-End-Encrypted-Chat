import { useState, useEffect, useRef } from 'react';
import { generateKeyPair, exportPublicKey, importPublicKey, deriveSharedSecret, encryptMessage, decryptMessage } from './cryptoUtils';

function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const ws = useRef(null);
  const [aesKey, setAesKey] = useState(null);
  const [showCiphertext, setShowCiphertext] = useState(false);

  const [myKeyPair, setMyKeyPair] = useState(null);
  const [terminalLogs, setTerminalLogs] = useState([
    "> System initialized...",
    "> Waiting for user login..."
  ]);

  // --- NEW: Save chat history locally whenever messages change ---
  useEffect(() => {
    if (username && selectedTarget && messages.length > 0) {
        // We use a unique storage key for each 1-on-1 relationship
        const storageKey = `chat_${username}_${selectedTarget}`;
        localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, selectedTarget, username]);

  useEffect(() => {
    if (!isLoggedIn) return;

    const setupSecurity = async () => {
      try {
        setTerminalLogs(prev => [...prev, "> Generating ECDH Key Pair..."]);
        const keys = await generateKeyPair();
        setMyKeyPair(keys);
        
        const exportedPublic = await exportPublicKey(keys.publicKey);
        setTerminalLogs(prev => [...prev, `> Public Key generated.`]);

        ws.current = new WebSocket('ws://localhost:8080');

        ws.current.onopen = () => {
          setTerminalLogs(prev => [...prev, "> WebSocket connected. Registering identity..."]);
          ws.current.send(JSON.stringify({ type: 'JOIN', username: username }));
        };

        ws.current.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'USER_LIST') {
                const peers = data.users.filter(name => name !== username);
                setOnlineUsers(peers);
            }

            else if (data.type === 'HANDSHAKE') {
              setTerminalLogs(prev => [...prev, `> Handshake received from ${data.sender}`]);
              
              // Automatically switch to the person calling us and load history
              setSelectedTarget(data.sender);
              const savedHistory = localStorage.getItem(`chat_${username}_${data.sender}`);
              setMessages(savedHistory ? JSON.parse(savedHistory) : []);

              const peerPublicKey = await importPublicKey(data.publicKey);
              const sharedSecret = await deriveSharedSecret(keys.privateKey, peerPublicKey);
              setAesKey(sharedSecret);
              
              setTerminalLogs(prev => [...prev, "> CRITICAL: AES-256 Shared Secret Derived!"]);
              
              ws.current.send(JSON.stringify({
                type: 'HANDSHAKE_REPLY',
                target: data.sender,
                publicKey: exportedPublic
              }));
            } 
            
            else if (data.type === 'HANDSHAKE_REPLY') {
              setTerminalLogs(prev => [...prev, `> Handshake Reply from ${data.sender}`]);
              
              const peerPublicKey = await importPublicKey(data.publicKey);
              const sharedSecret = await deriveSharedSecret(keys.privateKey, peerPublicKey);
              setAesKey(sharedSecret);
              
              setTerminalLogs(prev => [...prev, "> CRITICAL: AES-256 Shared Secret Derived!"]);
            }
            
            else if (data.type === 'CHAT') {
              if (data.ciphertext && data.iv) {
                setTerminalLogs(prev => [...prev, `> Inbound Encrypted from ${data.sender}`]);
                
                setAesKey(currentAesKey => {
                  if (currentAesKey) {
                    decryptMessage(data.ciphertext, data.iv, currentAesKey)
                      .then(decryptedText => {
                      setMessages(prev => [...prev, { 
                          sender: data.sender, 
                          text: decryptedText, 
                          cipher: data.ciphertext 
                      }]);                       
                      })
                      .catch(err => console.error("Decryption failed", err));
                  }
                  return currentAesKey; 
                });
              }
            }
          } catch (e) {
            console.log("Ignored non-JSON message");
          }
        };
      } catch (error) {
        console.error("Cryptography setup failed:", error);
      }
    };

    setupSecurity();

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [isLoggedIn, username]);

  const startChat = async (peerName) => {
    setSelectedTarget(peerName);
    setAesKey(null); // Clear old lock
    
    // --- NEW: Load history from local storage when clicking a name ---
    const savedHistory = localStorage.getItem(`chat_${username}_${peerName}`);
    if (savedHistory) {
        setMessages(JSON.parse(savedHistory));
    } else {
        setMessages([]); 
    }
    
    setTerminalLogs(prev => [...prev, `> Initiating secure handshake with ${peerName}...`]);
    
    const exportedPublic = await exportPublicKey(myKeyPair.publicKey);
    
    ws.current.send(JSON.stringify({
        type: 'HANDSHAKE',
        target: peerName, 
        publicKey: exportedPublic
    }));
  };

  const sendMessage = async () => {
    if (inputText.trim() === '' || !selectedTarget) return;

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      if (aesKey) {
        const { ciphertext, iv } = await encryptMessage(inputText, aesKey);

        ws.current.send(JSON.stringify({
          type: 'CHAT',
          target: selectedTarget,
          ciphertext: ciphertext,
          iv: iv
        }));

        setTerminalLogs(prev => [...prev, `> Outbound Encrypted to ${selectedTarget}`]);

        setMessages(prev => [...prev, { 
            sender: 'Me', 
            text: inputText, 
            cipher: ciphertext 
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

  if (!isLoggedIn) {
      return (
          <div className="flex h-screen bg-gray-900 justify-center items-center font-sans">
              <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-96 flex flex-col gap-4">
                  <h1 className="text-2xl font-bold text-green-400 text-center mb-4">Secure Terminal Login</h1>
                  <input 
                      type="text" 
                      placeholder="Enter your Display Name" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && setIsLoggedIn(true)}
                      className="p-3 rounded bg-gray-700 text-white outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button 
                      onClick={() => setIsLoggedIn(true)}
                      disabled={!username.trim()}
                      className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded transition-colors"
                  >
                      Connect to Network
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white font-sans">
      
      {/* LEFT PANE: Active Sessions */}
      <div className="w-1/4 bg-gray-800 border-r border-gray-700 p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-blue-400">Online Users</h2>
        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
            {onlineUsers.length === 0 ? (
                <div className="text-gray-500 italic text-sm">No one else is online...</div>
            ) : (
                onlineUsers.map(user => (
                    <div 
                        key={user}
                        onClick={() => startChat(user)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-2 ${selectedTarget === user ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        {user}
                    </div>
                ))
            )}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700 text-sm text-gray-400">
            Logged in as: <span className="font-bold text-white">{username}</span>
        </div>
      </div>

      {/* CENTER PANE: The User View (Chat) */}
      <div className="w-2/4 flex flex-col bg-gray-900">
        
        {/* Chat Header with Toggle */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
          <div>
            <h2 className="text-xl font-bold text-green-400 flex items-center gap-2">
              {selectedTarget ? `Chatting with ${selectedTarget}` : 'Select a user to chat'}
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
          {!selectedTarget ? (
              <div className="text-gray-500 italic m-auto">Click a user on the left to initiate a secure handshake.</div>
          ) : messages.length === 0 ? (
            <div className="text-gray-400 italic mt-auto">Secure connection established. Say hi!</div>
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
        
        {/* Chat Input Area */}
        <div className="p-4 bg-gray-800 flex gap-2">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!selectedTarget || !aesKey}
            placeholder={!selectedTarget ? "Select a user first..." : "Type an encrypted message..."} 
            className="flex-1 p-3 rounded bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button 
            onClick={sendMessage}
            disabled={!selectedTarget || !aesKey}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
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