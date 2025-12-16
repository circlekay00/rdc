import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCBqRCKqiSfCFwqTQn1zhl_Fwb4PSrZBy8",
  authDomain: "item-search-fd71f.firebaseapp.com",
  projectId: "item-search-fd71f",
  storageBucket: "item-search-fd71f.firebasestorage.app",
  messagingSenderId: "445263614168",
  appId: "1:445263614168:web:5082b6adb776306d4c87ad"
};

// ✅ MUST HAPPEN ON LOAD
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
