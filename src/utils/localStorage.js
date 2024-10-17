import CryptoJS from "crypto-js";
import { googleLogout } from "@react-oauth/google";
import { isValidOpenAIKey } from "../services/openai.services";

const SECRET_KEY = "your-secret-key";
export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

export const decryptData = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error("Decryption error:", error);
    return null; // Return null to indicate an error
  }
};


export const setOpenAiApiKey = async (key) => {
  if (await isValidOpenAIKey(key)) {
    localStorage.setItem("API_KEY", key);
  } else {
    throw new Error("INVALID_KEY");
  }
};

export const getOpenAiApiKey = () => {
  const limitReached = localStorage.getItem("API_KEY");
  return limitReached;
};

export const isSKAdded = () => {
  const apiKey = localStorage.getItem("API_KEY");
  return apiKey !== null && apiKey !== undefined && apiKey !== "";
};
