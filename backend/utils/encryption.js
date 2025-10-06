// backend/utils/encryption.js (FIXED: Using SHA256 hash buffer directly as key)

import crypto from 'crypto';

// Derives a 32-byte key directly from the SHA256 hash of the JWT_SECRET.
// This guarantees the correct 256-bit key length required by AES-256-CBC.
const ENCRYPTION_KEY_BUFFER = crypto.createHash('sha256')
    .update(String(process.env.JWT_SECRET))
    .digest(); // 💡 FIX: This returns a 32-byte Buffer, perfect for AES-256-CBC
    
const ALGORITHM = 'aes-256-cbc'; 

/**
 * Encrypts a Buffer using AES-256-CBC.
 * @param {Buffer} buffer - The file data to encrypt.
 * @returns {{encryptedBuffer: Buffer, iv: string}}
 */
export function encryptFile(buffer) {
    // Generate a unique IV for each file (16 bytes for AES-256-CBC)
    const iv = crypto.randomBytes(16);
    // 💡 FIX: Using the pre-calculated 32-byte buffer key
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY_BUFFER, iv);
    
    // Encrypt the buffer
    let encrypted = cipher.update(buffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return {
        encryptedBuffer: encrypted,
        iv: iv.toString('hex') // Store IV as a hex string
    };
}

/**
 * Decrypts a Buffer using AES-256-CBC.
 * @param {Buffer} encryptedBuffer - The encrypted file data.
 * @param {string} ivHex - The IV used for encryption (hex string).
 * @returns {Buffer}
 */
export function decryptFile(encryptedBuffer, ivHex) {
    const iv = Buffer.from(ivHex, 'hex');
    // 💡 FIX: Using the pre-calculated 32-byte buffer key
    const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY_BUFFER, iv);
    
    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted;
}