import React from 'react';

const LandingPage = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-[#0b141a] text-[#e9edef] font-sans selection:bg-[#00a884] selection:text-white flex flex-col">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <svg className="w-8 h-8 text-[#00a884]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <span className="font-bold text-xl tracking-wide">Zorvyn Network</span>
        </div>
        <button 
          onClick={onEnter}
          className="text-sm font-bold text-[#00a884] border border-[#00a884] px-6 py-2 rounded-full hover:bg-[#00a884] hover:text-[#0b141a] transition-all duration-300"
        >
          Access Terminal
        </button>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 mt-12 mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111b21] border border-[#202c33] text-sm text-gray-400 mb-8">
          <span className="w-2 h-2 rounded-full bg-[#00a884] animate-pulse"></span>
          Military-Grade Encryption is now live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl">
          Privacy is not a privilege. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00a884] to-[#53bdeb]">It's a mathematical guarantee.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
          Communicate with absolute freedom. Our zero-knowledge architecture ensures that your keys never leave your device. Not even our servers can read your messages.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onEnter}
            className="bg-[#00a884] hover:bg-[#008f6f] text-white font-bold text-lg px-8 py-4 rounded-lg shadow-[0_0_20px_rgba(0,168,132,0.3)] transition-all hover:scale-105 active:scale-95"
          >
            Start Secure Session
          </button>
          <a 
            href="https://github.com/rahulcoder12/End-to-End-Encrypted-Chat" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-[#111b21] hover:bg-[#202c33] border border-[#202c33] text-[#e9edef] font-bold text-lg px-8 py-4 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            View Source Code
          </a>
        </div>
      </main>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#202c33] w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-[#111b21] p-8 rounded-2xl border border-[#202c33] hover:border-[#00a884] transition-colors">
            <div className="w-12 h-12 bg-[#005c4b] rounded-lg flex items-center justify-center mb-6 text-[#00a884]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Elliptic Curve E2EE</h3>
            <p className="text-gray-400 leading-relaxed">Messages are encrypted locally using AES-256-GCM. We derive shared secrets using ECDH P-256 cryptography, meaning only the recipient can decrypt the payload.</p>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#111b21] p-8 rounded-2xl border border-[#202c33] hover:border-[#00a884] transition-colors">
            <div className="w-12 h-12 bg-[#005c4b] rounded-lg flex items-center justify-center mb-6 text-[#00a884]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Zero-Knowledge Routing</h3>
            <p className="text-gray-400 leading-relaxed">Our custom Node.js WebSockets switchboard operates entirely in-memory. It routes ciphertexts efficiently but persists zero data to disk. When you disconnect, the tunnel collapses.</p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#111b21] p-8 rounded-2xl border border-[#202c33] hover:border-[#00a884] transition-colors">
            <div className="w-12 h-12 bg-[#005c4b] rounded-lg flex items-center justify-center mb-6 text-[#00a884]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">Engineer Terminal</h3>
            <p className="text-gray-400 leading-relaxed">Don't just trust us, verify it yourself. Toggle the Hacker View to inspect live AES-256 ciphertexts, Initialization Vectors (IVs), and real-time handshake logs.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-500 border-t border-[#202c33]">
        <p>Built with React, Vite, Node.js & Web Crypto API. Designed for the privacy-conscious.</p>
      </footer>
    </div>
  );
};

export default LandingPage;