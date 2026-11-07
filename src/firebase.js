import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; 
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBm1OzJdbmJXqUzrByHIXMdCwRH0EYWfsw",
  authDomain: "dormly-chat.firebaseapp.com",
  projectId: "dormly-chat",
  storageBucket: "dormly-chat.firebasestorage.app",
  messagingSenderId: "258153381078",
  appId: "1:258153381078:web:b71db3483628a789469d77"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
