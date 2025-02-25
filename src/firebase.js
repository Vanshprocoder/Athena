// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBSjf7-abkBmUm9IyF5rOU9MqAmNqG5Kwk",
    authDomain: "athena-colz.firebaseapp.com",
    projectId: "athena-colz",
    storageBucket: "athena-colz.firebasestorage.app",
    messagingSenderId: "105689041903",
    appId: "1:105689041903:web:7666d4407759b9cc1fc41a",
    measurementId: "G-PBYXR845PL"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const database = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

export { collection, getDocs, getFirestore };