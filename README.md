# 🔒 SecureNet: Zero-Knowledge E2EE Communication

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![WebSockets](https://img.shields.io/badge/WebSockets-000000?style=for-the-badge&logo=socketdotio&logoColor=white)
![Web Crypto API](https://img.shields.io/badge/Web_Crypto_API-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

A production-grade, real-time communication platform featuring true End-to-End Encryption (E2EE). Designed with a zero-knowledge architecture, the Node.js WebSocket routing server facilitates connections but has mathematically zero ability to read the messages passing through it.

**Live Production Environment:** [https://e2ee-network.vercel.app/](https://e2ee-network.vercel.app/)

---

## 🚀 Why This Project is Unique

Most modern chat applications claim to be "secure," but they rely on server-side encryption—meaning the company holds the keys to your data. SecureNet flips this paradigm by shifting the cryptographic burden entirely to the client's browser. 

* **True Zero-Knowledge Server:** The Node.js backend does not use a database. It operates entirely in volatile memory. It acts strictly as a blind switchboard, routing AES-256 ciphertexts without ever possessing the keys to decrypt them.
* **Ephemeral Cryptography:** When a user disconnects or refreshes the page, their session keys are instantly destroyed. Even if a bad actor intercepted the traffic, the keys required to decode the ciphertexts no longer exist.
* **Stateless Bot Protection:** Instead of relying on invasive third-party trackers like Google reCAPTCHA, SecureNet utilizes a dynamic, natively built mathematical verification challenge to defend against automated script attacks.
* **Radical Transparency (Hacker View):** SecureNet includes a built-in Developer Terminal. Users can toggle this view to inspect the live initialization vectors (IVs) and raw ciphertexts being transmitted, proving the encryption is mathematically sound in real-time.

---

## 🧠 The Cryptographic Pipeline

This application utilizes the native browser **Web Crypto API** to ensure private keys never leave the physical device.

1. **Key Generation:** Upon authentication, the client generates an ephemeral **Elliptic Curve (ECDH P-256)** Public/Private Key Pair.
2. **The Handshake:** When User A initiates a chat with User B, their public keys are exchanged through the WebSocket server.
3. **Shared Secret Derivation:** Both clients independently derive an identical **AES-256-GCM** shared secret using their own private key and the peer's public key.
4. **Encrypted Transit:** Messages are encrypted locally. The server routes the scrambled payload.
5. **Local Decryption:** The receiving client uses their derived AES-256 key to decrypt the payload natively in the browser.

---

## 🛠️ Local Development & Execution

To run this project locally, you will need Node.js installed on your machine. You must start the backend server and the frontend client in two separate terminal windows.

### Step 1: Start the Backend (Switchboard)
Open your first terminal and navigate to the server directory to install dependencies and start the Node.js instance.

```bash
cd crypto-server
npm install
npm start
```

### Step 2: Start the Frontend (React UI)
Open a second, separate terminal window and navigate to the frontend directory to run the Vite development server.

```bash
cd crypto-chat
npm install
npm run dev
```


### Step 3: Configure Local Environment
By default, the codebase is wired for the live production environment. To test locally, you must temporarily point the frontend to your local server.

Open src/App.jsx and locate the WebSocket connection string inside the handleAuth function.
Change the production URL:
```bash
ws.current = new WebSocket('wss://secure-chat-server-mu2g.onrender.com');
```
To your local environment:
```bash
ws.current = new WebSocket('ws://localhost:8080');
```

Note: Remember to revert this string back to the wss:// production URL before deploying any changes to Vercel.