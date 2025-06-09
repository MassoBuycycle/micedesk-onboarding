import crypto from 'crypto';

// AES-256-GCM parameters
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits

// Ensure ENCRYPTION_KEY is 32 bytes (64 hex chars)
const getKey = () => {
  if (!process.env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  const keyBuffer = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  if (keyBuffer.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }
  return keyBuffer;
};

/**
 * Encrypt plain text using AES-256-GCM.
 * The resulting string format is: iv:tag:ciphertext (all hex encoded)
 */
export const encrypt = (plainText) => {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
};

/**
 * Decrypt payload string (iv:tag:ciphertext) back to plain text
 */
export const decrypt = (payload) => {
  const [ivHex, tagHex, dataHex] = payload.split(':');
  if (!ivHex || !tagHex || !dataHex) {
    throw new Error('Invalid encrypted payload format');
  }
  const key = getKey();
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encryptedText = Buffer.from(dataHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString('utf8');
}; 