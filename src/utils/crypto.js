import CryptoJS from 'crypto-js';

// No futuro, essa chave será derivada da senha real do usuário no Firebase Auth.
// Por enquanto, usaremos uma chave estática segura para construir a lógica.
const SECRET_KEY = 'brio_local_secret_key_change_later';

export const encryptData = (text) => {
  if (!text) return '';
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decryptData = (ciphertext) => {
  if (!ciphertext) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Erro ao descriptografar dado:", error);
    return 'Conteúdo irrecuperável';
  }
};