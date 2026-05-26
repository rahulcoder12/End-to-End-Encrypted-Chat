import React, { useState } from 'react';

const LandingPage = ({ onEnter }) => {
  const [activeTab, setActiveTab] = useState('encryption');
  const [openFaq, setOpenFaq] = useState(null);

  const tabs = {
    encryption: {
      title: "AES-256-GCM Encryption",
      subtitle: "Unbreakable Mathematical Guarantees",
      content: "Every message is locked with a unique AES-256 key. We use Elliptic Curve Diffie-Hellman (ECDH P-256) to securely negotiate shared secrets. The server never sees your private keys, meaning decryption is mathematically impossible for anyone but the intended recipient.",
      color: "from-cyan-400 to-blue-500"
    },
    routing: {
      title: "Zero-Knowledge Routing",
      subtitle: "Ghost in the Machine",
      content: "Our custom WebSocket switchboard operates entirely in volatile memory. It routes scrambled ciphertexts lightning-fast but writes zero bytes to disk. The moment you disconnect, your routing tunnel collapses completely.",
      color: "from-purple-400 to-pink-500"
    },
    terminal: {
      title: "Hacker / Engineer View",
      subtitle: "Don't Trust. Verify.",
      content: "Toggle the built-in Developer Terminal to inspect real-time inbound and outbound packets. Watch the raw ciphertexts, Initialization Vectors (IVs), and cryptographic handshakes happen live on your screen.",
      color: "from-emerald-400 to-cyan-500"
    }
  };

  const faqs = [
    { q: "Can the server read my messages?", a: "No. The server only receives encrypted ciphertext. Because the AES-256 shared secret is derived locally on your device, the server lacks the mathematical keys to decrypt the payloads." },
    { q: "What happens if a hacker breaches the database?", a: "We don't use a database for chat history. All messages are stored entirely in your browser's local encrypted storage. A server breach would yield exactly zero message data." },
    { q: "How does the bot protection work?", a: "Instead of relying on invasive 3rd-party trackers like reCAPTCHA, we utilize a dynamic, stateless mathematical verification challenge natively built into the frontend to block automated scripts." }
  ];

  return (
    <div className="min-h-screen bg-[#070514] text-white font-sans selection:bg-cyan-500 selection:text-white flex flex-col overflow-x-hidden">
      
      {/* --- VIBRANT BACKGROUND GLOWS --- */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* --- NAVBAR --- */}
      <nav className="relative flex justify-between items-center p-6 max-w-7xl w-full mx-auto z-10">
        <div className="flex items-center gap-2">
          {/* Logo removed, replaced with vibrant typography */}
          <span className="font-black text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.4)]">
            Zorvyn
          </span>
        </div>
        <button 
          onClick={onEnter}
          className="relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white transition-all duration-200 bg-gray-900 border border-gray-700 rounded-full hover:bg-gray-800 hover:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 overflow-hidden group"
        >
          <span className="absolute inset-0 w-full h-full -mt-1 rounded-lg opacity-30 bg-gradient-to-b from-transparent via-transparent to-cyan-500 group-hover:opacity-100 transition-opacity"></span>
          <span className="relative">Access Terminal</span>
        </button>
      </nav>

      {/* --- HERO SECTION --- */}
      <main className="relative flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 mt-16 mb-24 z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-cyan-300 mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,1)]"></span>
          V2.0 Core Infrastructure is Live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 max-w-5xl leading-tight">
          Absolute Privacy is a <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
            Mathematical Guarantee.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
          Communicate with zero compromises. Our military-grade zero-knowledge architecture ensures that your keys never leave your device.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-5">
          <button 
            onClick={onEnter}
            className="group relative px-8 py-4 font-bold text-white rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] hover:scale-105 active:scale-95"
          >
            Start Secure Session
          </button>
          
          <a 
            href="https://github.com/rahulcoder12/End-to-End-Encrypted-Chat" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-8 py-4 font-bold text-white rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:scale-105"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            Review Source Code
          </a>
        </div>
      </main>

      {/* --- QUICK STATS / HIGHLIGHTS --- */}
      <section className="relative z-10 w-full max-w-6xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="text-center p-4">
            <h4 className="text-3xl font-black text-cyan-400 mb-1">E2EE</h4>
            <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Protocol</p>
          </div>
          <div className="text-center p-4 border-l border-white/10">
            <h4 className="text-3xl font-black text-purple-400 mb-1">0 KB</h4>
            <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Data Logged</p>
          </div>
          <div className="text-center p-4 border-l border-white/10 hidden md:block">
            <h4 className="text-3xl font-black text-pink-400 mb-1">P-256</h4>
            <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Elliptic Curve</p>
          </div>
          <div className="text-center p-4 border-l border-white/10 hidden md:block">
            <h4 className="text-3xl font-black text-emerald-400 mb-1">&lt; 50ms</h4>
            <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Latency</p>
          </div>
        </div>
      </section>

      {/* --- INTERACTIVE TABS COMPONENT --- */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 mb-32 w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Inside the Architecture</h2>
          <p className="text-gray-400">Select a component below to explore the technology stack.</p>
        </div>
        
        <div className="bg-[#0b081c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {/* Tab Headers */}
          <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar">
            {Object.keys(tabs).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 py-5 px-6 font-bold text-sm sm:text-base tracking-wide transition-all ${
                  activeTab === key 
                    ? 'bg-white/10 text-white border-b-2 border-cyan-400' 
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                {key === 'encryption' && 'Cryptography'}
                {key === 'routing' && 'Network Switchboard'}
                {key === 'terminal' && 'Developer Tools'}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div className="p-8 md:p-12 min-h-[250px] flex flex-col justify-center transition-all duration-500">
            <h3 className={`text-2xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r ${tabs[activeTab].color}`}>
              {tabs[activeTab].title}
            </h3>
            <h4 className="text-lg font-medium text-gray-300 mb-6">
              {tabs[activeTab].subtitle}
            </h4>
            <p className="text-gray-400 text-lg leading-relaxed max-w-3xl">
              {tabs[activeTab].content}
            </p>
          </div>
        </div>
      </section>

      {/* --- FAQ ACCORDION COMPONENT --- */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 mb-32 w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Security FAQs</h2>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border rounded-2xl transition-all duration-300 ${
                openFaq === index ? 'bg-white/10 border-cyan-500/50' : 'bg-transparent border-white/10 hover:border-white/20'
              }`}
            >
              <button 
                onClick={() => toggleFaq(index)}
                className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
              >
                <span className="font-semibold text-lg text-gray-200">{faq.q}</span>
                <svg 
                  className={`w-6 h-6 transform transition-transform duration-300 text-cyan-400 ${openFaq === index ? 'rotate-180' : ''}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  openFaq === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-6 pt-0 text-gray-400 leading-relaxed">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 text-center py-10 border-t border-white/10 bg-[#070514]">
        <p className="text-gray-500 font-medium">
          Architected with React, Node.js, and the Web Crypto API.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
