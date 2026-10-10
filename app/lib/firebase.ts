import { getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCaLwqcQXKpI_6f8UblmVma3oyaAGf6xXA",
  authDomain: "veddvagybereld0.firebaseapp.com",
  projectId: "veddvagybereld0",
  storageBucket: "veddvagybereld0.firebasestorage.app",
  messagingSenderId: "514378126650",
  appId: "1:514378126650:web:a8d34b8c1ab99ff6de2c03",
  measurementId: "G-KZL4ZNZS8L",
};

// Firebase Client kapcsolat.
const app =
  getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;