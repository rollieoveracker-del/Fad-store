// Firebase setup — imported by products.js, admin.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC8b_8Ea5Oxqqpa7T3QVOzN8lds0xL8mEE",
  authDomain: "fad-store-83b82.firebaseapp.com",
  projectId: "fad-store-83b82",
  storageBucket: "fad-store-83b82.firebasestorage.app",
  messagingSenderId: "125960851772",
  appId: "1:125960851772:web:2b7ed7e8f747c313f14e39"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
