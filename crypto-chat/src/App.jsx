import { useState, useEffect, useRef } from 'react';
import { generateKeyPair, exportPublicKey, importPublicKey, deriveSharedSecret, encryptMessage, decryptMessage } from './cryptoUtils';
import Sidebar from './components/Sidebar';
import Terminal from './components/Terminal';

function App() {
  // --- AUTHENTICATION STATES ---
  const [authMode, setAuthMode] = useState('LOGIN'); // 'LOGIN' or 'REGISTER'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const ws = useRef(null);
  const [aesKey, setAesKey] = useState(null);
  
  const [showCiphertext, setShowCiphertext] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false); // DEFAULT CLOSED!

  const [myKeyPair, setMyKeyPair] = useState(null);
  const [terminalLogs, setTerminalLogs] = useState([
    "> System initialized...",
    "> Waiting for user authentication..."
  ]);

  // Save chat history locally
  useEffect(() => {
    if (username && selectedTarget && messages.length > 0) {
        const storageKey = `chat_${username}_${selectedTarget}`;
        localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, selectedTarget, username]);

  // Handle Login/Register Request
  const handleAuth = () => {
      if (!username.trim() || !password.trim()) return;
      setAuthError('');
      
      // Connect to server just for authentication
      ws.current = new WebSocket('ws://localhost:8080');
      
      ws.current.onopen = () => {
          ws.current.send(JSON.stringify({ type: authMode, username, password }));
      };
      
      ws.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === 'AUTH_ERROR') {
              setAuthError(data.message);
              ws.current.close();
          } else if (data.type === 'AUTH_SUCCESS') {
              setIsLoggedIn(true);
          }
      };
  };

  // Run Crypto Setup ONLY after successful login
  useEffect(() => {
    if (!isLoggedIn) return;

    const setupSecurity = async () => {
      try {
        setTerminalLogs(prev => [...prev, "> Authenticated. Generating ECDH Key Pair..."]);
        const keys = await generateKeyPair();
        setMyKeyPair(keys);
        
        const exportedPublic = await exportPublicKey(keys.publicKey);
        setTerminalLogs(prev => [...prev, `> Public Key generated.`]);

        // Switch the WebSocket to listen for Chat and Handshakes instead of Auth
        ws.current.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === 'USER_LIST') {
                const peers = data.users.filter(name => name !== username);
                setOnlineUsers(peers);
            }
            else if (data.type === 'HANDSHAKE') {
              setTerminalLogs(prev => [...prev, `> Handshake received from ${data.sender}`]);
              
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
  }, [isLoggedIn, username]); // Only runs once when logged in

  const startChat = async (peerName) => {
    setSelectedTarget(peerName);
    setAesKey(null); 
    
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
          <div className="flex h-screen bg-[#0b141a] justify-center items-center font-sans">
              <div className="bg-[#111b21] p-8 rounded-lg shadow-2xl w-96 flex flex-col gap-4 border border-[#202c33]">
                  <h1 className="text-2xl font-bold text-[#00a884] text-center mb-2">Secure Network</h1>
                  
                  {/* Toggle Login/Register */}
                  <div className="flex bg-[#202c33] rounded-lg p-1 mb-2">
                      <button 
                          className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${authMode === 'LOGIN' ? 'bg-[#00a884] text-white' : 'text-gray-400 hover:text-gray-200'}`}
                          onClick={() => { setAuthMode('LOGIN'); setAuthError(''); }}
                      >Login</button>
                      <button 
                          className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${authMode === 'REGISTER' ? 'bg-[#00a884] text-white' : 'text-gray-400 hover:text-gray-200'}`}
                          onClick={() => { setAuthMode('REGISTER'); setAuthError(''); }}
                      >Register</button>
                  </div>

                  {authError && <div className="text-red-500 text-sm text-center font-semibold bg-red-900/30 py-2 rounded">{authError}</div>}

                  <input 
                      type="text" 
                      placeholder="Display Name" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="p-3 rounded bg-[#202c33] text-[#e9edef] outline-none focus:ring-2 focus:ring-[#00a884]"
                  />
                  <input 
                      type="password" 
                      placeholder="Password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
                      className="p-3 rounded bg-[#202c33] text-[#e9edef] outline-none focus:ring-2 focus:ring-[#00a884]"
                  />
                  <button 
                      onClick={handleAuth}
                      disabled={!username.trim() || !password.trim()}
                      className="bg-[#00a884] hover:bg-[#008f6f] disabled:bg-[#202c33] disabled:text-gray-500 text-white font-bold py-3 px-4 rounded transition-colors mt-2"
                  >
                      {authMode === 'LOGIN' ? 'Access Terminal' : 'Create Account'}
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-[#0b141a] text-[#e9edef] font-sans overflow-hidden">
      
      <Sidebar 
        username={username}
        onlineUsers={onlineUsers}
        selectedTarget={selectedTarget}
        startChat={startChat}
      />

      {/* CENTER PANE: The User View (Chat) */}
      <div 
        className={`flex flex-col relative transition-all duration-300 ${showTerminal ? 'w-2/4' : 'flex-1'}`} 
        style={{ 
          backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', 
          backgroundSize: 'contain',
          backgroundColor: '#0b141a'
        }}
      >
        <div className="p-3 bg-[#202c33] flex justify-between items-center z-10 shadow-sm">
          <div className="flex items-center gap-3">
            {selectedTarget ? (
              <>
                <div className="w-10 h-10 bg-[#6b7c85] rounded-full flex items-center justify-center font-bold text-white">
                  {selectedTarget.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-semibold text-[#e9edef]">{selectedTarget}</h2>
                  {aesKey && <p className="text-xs text-[#00a884] flex items-center gap-1">🔒 E2EE Active</p>}
                </div>
              </>
            ) : (
              <h2 className="font-bold text-gray-400">Select a contact</h2>
            )}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setShowTerminal(!showTerminal)}
              className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors shadow ${showTerminal ? 'bg-[#2a3942] text-gray-300 hover:bg-[#3d4b53]' : 'bg-[#00a884] text-white hover:bg-[#008f6f]'}`}
            >
              {showTerminal ? 'HIDE TERMINAL' : 'SHOW TERMINAL'}
            </button>
            <button 
              onClick={() => setShowCiphertext(!showCiphertext)}
              className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors shadow ${showCiphertext ? 'bg-red-900 text-red-200 hover:bg-red-800' : 'bg-[#2a3942] text-gray-300 hover:bg-[#3d4b53]'}`}
            >
              {showCiphertext ? '⚠️ HACKER VIEW' : '👁️ USER VIEW'}
            </button>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-2 z-10">
          {!selectedTarget ? (
              <div className="bg-[#202c33] text-gray-300 text-sm py-2 px-4 rounded-full m-auto shadow">
                  Click a user on the left to initiate a secure handshake.
              </div>
          ) : messages.length === 0 ? (
            <div className="bg-[#182229] text-[#ffd02c] text-xs py-2 px-4 rounded-lg mx-auto shadow-md text-center max-w-sm mb-4 border border-[#202c33]">
              🔒 Messages are end-to-end encrypted. No one outside of this chat, not even the server, can read them.
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`flex flex-col w-fit max-w-[85%] ${msg.sender === 'Me' ? 'self-end' : 'self-start'}`}>
                <div className={`p-2 px-3 relative shadow-sm ${msg.sender === 'Me' ? 'bg-[#005c4b] rounded-lg rounded-tr-none' : 'bg-[#202c33] rounded-lg rounded-tl-none'} ${showCiphertext ? 'font-mono text-xs break-all border border-red-700 bg-[#3f1d1d] text-red-200' : ''}`}>
                  <div className="text-[15px] leading-relaxed text-[#e9edef]">
                      {showCiphertext ? (msg.cipher || 'Unencrypted system message') : msg.text}
                  </div>
                  <div className="text-[10px] text-gray-400 text-right mt-1 flex justify-end items-center gap-1">
                      {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      {msg.sender === 'Me' && <span className="text-[#53bdeb] text-sm leading-none">✓✓</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-3 bg-[#202c33] flex gap-2 items-center z-10">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!selectedTarget || !aesKey}
            placeholder={!selectedTarget ? "Select a user first..." : "Type a message"} 
            className="flex-1 py-3 px-4 rounded-lg bg-[#2a3942] text-white outline-none focus:bg-[#3d4b53] disabled:opacity-50 transition-colors placeholder-gray-400"
          />
          <button 
            onClick={sendMessage}
            disabled={!selectedTarget || !aesKey}
            className="bg-[#00a884] hover:bg-[#008f6f] disabled:bg-[#2a3942] disabled:text-gray-500 text-white p-3 rounded-full transition-colors flex items-center justify-center w-12 h-12"
          >
            <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" fill="currentColor">
                <path d="M1.101 21.757 23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path>
            </svg>
          </button>
        </div>
      </div>

      {showTerminal && <Terminal logs={terminalLogs} />}

    </div>
  )
}

export default App;