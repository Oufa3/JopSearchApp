import CryptoJS from "crypto-js";


export const generateEncryptPhone = ({ phone = "", secKey = process.env.PASSKEYPHONE }) => {
    const encrption = CryptoJS.AES.encrypt(phone, secKey)
    return encrption.toString()
}

export const compareEncryptPhone = ({ phone = "", secKey = process.env.PASSKEYPHONE }) => {
    const dec = CryptoJS.AES.decrypt(phone, secKey)
    const decryptedPhone  = dec.toString(CryptoJS.enc.Utf8)
    return decryptedPhone 
}