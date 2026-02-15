import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDE8zhFyTIPMCvdxzp_kZsTFkWcy65CxE8",
  authDomain: "unishop-15bb5.firebaseapp.com",
  projectId: "unishop-15bb5",
  storageBucket: "unishop-15bb5.firebasestorage.app",
  messagingSenderId: "155423477262",
  appId: "1:155423477262:web:1b8beb86749af0b549f65f",
  measurementId: "G-NG2LT57V31"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const analytics = async () => {
  if (typeof window !== "undefined" && await isSupported()) {
    return getAnalytics(app);
  }
  return null;
};
