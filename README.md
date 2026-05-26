# 🔒 SecureNet: Zero-Knowledge E2EE Communication

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![WebSockets](https://img.shields.io/badge/WebSockets-000000?style=for-the-badge&logo=socketdotio&logoColor=white)
![Web Crypto API](https://img.shields.io/badge/Web_Crypto_API-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

A production-grade, real-time communication platform featuring true End-to-End Encryption (E2EE) and a dynamic, interactive landing page. Designed with a zero-knowledge architecture, the Node.js WebSocket routing server facilitates connections but has mathematically zero ability to read the messages passing through it.

**Live Production Environment:** [https://e2ee-network.vercel.app/](https://e2ee-network.vercel.app/)

---

## 🧠 System Architecture & Cryptography

This application utilizes the native browser **Web Crypto API** to ensure that private keys never leave the client's device. 

1. **Key Generation:** Upon authentication, the client generates an ephemeral **Elliptic Curve (ECDH) P-256** Key Pair.
2. **The Handshake:** When User A initiates a chat with User B, public keys are exchanged through the WebSocket switchboard.
3. **Shared Secret Derivation:** Both clients independently derive an identical, mathematically secure **AES-256-GCM** shared secret using their private key and the peer's public key.
4. **Encrypted Transit:** Messages are encrypted locally on the device using the AES-256 key and a cryptographically secure random Initialization Vector (IV). The server only routes the resulting ciphertext.

---

## ✨ Core Features

* **Zero-Knowledge WebSocket Routing:** Custom Node.js server that tracks active connections in an in-memory map and routes payloads directly to target sockets without persisting data to any database.
* **Math-Based Bot Protection:** Custom, stateless arithmetic verification challenge implemented entirely on the frontend to defend against automated account creation without relying on third-party APIs.
* **Graceful Disconnects & Lock Destruction:** The UI actively monitors the WebSocket roster. If a peer drops offline, the client instantly destroys the AES session key to prevent ciphertext transmission into the void.
* **Engineer Terminal (Hacker View):** An interactive developer toggle that allows users to visualize the actual AES-256 ciphertexts, Initialization Vectors (IVs), and cryptographic handshakes being transmitted in real-time.
* **Encrypted Local Storage:** Chat history is retained purely on the client-side via browser `localStorage`, persisting the ciphertexts mapped to specific peer connections.

---

## 🛠️ Local Development Setup

To run this project locally, you will need two terminal windows.

**1. Start the WebSocket Server:**
```bash
cd crypto-server
npm install
npm start