import CryptoJS from 'crypto-js'

const key = CryptoJS.enc.Utf8.parse('1234123412ABCDEF');  // key: hex * 16
const iv = CryptoJS.enc.Utf8.parse('ABCDEF1234123412');   // offset: hex * 16

export const AES = {}

AES.decrypt = function(word) {
    let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
    let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    let decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
    return decryptedStr.toString();
}

AES.encrypt = function(word) {
    let srcs = CryptoJS.enc.Utf8.parse(word);
    let encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.ciphertext.toString().toUpperCase();
}

// RSA
function selector(query) {
    return document.querySelector(`meta[name="${query}"]`).content
}
const rsaPublicKey = selector('rsaPublicKey')
const cipher = new JSEncrypt()
cipher.setPublicKey(rsaPublicKey)
export default cipher