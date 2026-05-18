// src/cryptoUtils.js

// 1. Generate the Public and Private Key Pair using Curve P-256
export const generateKeyPair = async () => {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "ECDH",
            namedCurve: "P-256" // Standard Elliptic Curve
        },
        true, // Allows us to extract the public key to send it
        ["deriveKey", "deriveBits"]
    );
    return keyPair;
};

// 2. Export the Public Key so we can send it over the WebSocket
export const exportPublicKey = async (key) => {
    const exported = await window.crypto.subtle.exportKey("jwk", key);
    return exported;
};

// 3. Import the Peer's Public Key from JSON format back to a CryptoKey object
export const importPublicKey = async (jwk) => {
    return await window.crypto.subtle.importKey(
        "jwk",
        jwk,
        {
            name: "ECDH",
            namedCurve: "P-256"
        },
        true,
        []
    );
};

// 4. Combine My Private Key + Peer's Public Key = AES Shared Secret
export const deriveSharedSecret = async (privateKey, publicKey) => {
    return await window.crypto.subtle.deriveKey(
        {
            name: "ECDH",
            public: publicKey
        },
        privateKey,
        {
            name: "AES-GCM", // The standard for secure symmetric encryption
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );
};