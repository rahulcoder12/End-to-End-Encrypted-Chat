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

// --- HELPER FUNCTIONS ---
// Web Crypto outputs raw binary buffers. We must convert them to Base64 strings to send via JSON.
const bufferToBase64 = (buffer) => btoa(String.fromCharCode(...new Uint8Array(buffer)));
const base64ToBuffer = (base64) => Uint8Array.from(atob(base64), c => c.charCodeAt(0));

// 5. Encrypt the plaintext using the AES Shared Secret
export const encryptMessage = async (text, aesKey) => {
    // Convert the text string into an array of bytes
    const encodedText = new TextEncoder().encode(text);
    
    // Generate a cryptographically secure random Initialization Vector (12 bytes for AES-GCM)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    // Perform the actual encryption
    const ciphertextBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        aesKey,
        encodedText
    );

    // Return the ciphertext and the IV (the receiver needs the exact IV to decrypt it!)
    return {
        ciphertext: bufferToBase64(ciphertextBuffer),
        iv: bufferToBase64(iv)
    };
};

// 6. Decrypt the ciphertext back to plaintext
export const decryptMessage = async (ciphertextBase64, ivBase64, aesKey) => {
    // Convert the Base64 strings back into raw binary buffers
    const ciphertextBuffer = base64ToBuffer(ciphertextBase64);
    const ivBuffer = base64ToBuffer(ivBase64);

    // Perform the decryption
    const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivBuffer },
        aesKey,
        ciphertextBuffer
    );

    // Convert the decrypted bytes back into a readable text string
    return new TextDecoder().decode(decryptedBuffer);
};