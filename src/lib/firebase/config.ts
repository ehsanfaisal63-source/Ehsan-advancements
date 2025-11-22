import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_EM7ZBO_xkl6w0s54UOZmk9Cqv0bgqEg",
  authDomain: "ehsan-website.firebaseapp.com",
  projectId: "ehsan-website",
  storageBucket: "ehsan-website.firebasestorage.app",
  messagingSenderId: "1081384329293",
  appId: "1:1081384329293:web:403e9921586e05f4e8bc04",
  measurementId: "G-0G9HQBRTVV"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
