import CryptoJS from 'crypto-js';

// Encryption key - should be set in environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

if (process.env.ENCRYPTION_KEY === undefined && process.env.NODE_ENV === 'production') {
  throw new Error('ENCRYPTION_KEY environment variable must be set in production');
}

/**
 * Encrypts data using AES encryption
 * @param {string} text - The text to encrypt
 * @returns {string} - The encrypted text
 */
export const encrypt = (text) => {
  if (!text) return text;
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

/**
 * Decrypts data using AES decryption
 * @param {string} encryptedText - The encrypted text to decrypt
 * @returns {string} - The decrypted text
 */
export const decrypt = (encryptedText) => {
  if (!encryptedText) return encryptedText;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText; // Return encrypted text if decryption fails
  }
};