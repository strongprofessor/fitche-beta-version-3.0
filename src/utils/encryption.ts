import * as Crypto from 'expo-crypto';

export async function generateKey(): Promise<CryptoKey> {
  return await Crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

export async function encryptMessage(message: string, key: CryptoKey): Promise<{ encryptedData: ArrayBuffer, iv: Uint8Array }> {
  const iv = Crypto.getRandomValues(new Uint8Array(12)); // Generate a random IV
  const encoder = new TextEncoder();
  const encodedMessage = encoder.encode(message);

  const encryptedData = await Crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encodedMessage
  );

  return { encryptedData, iv };
}

export async function decryptMessage(encryptedData: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<string> {
  const decryptedData = await Crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encryptedData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
} 