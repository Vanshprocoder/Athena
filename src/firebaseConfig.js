// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBSjf7-abkBmUm9IyF5rOU9MqAmNqG5Kwk",
    authDomain: "athena-colz.firebaseapp.com",
    projectId: "athena-colz",
    storageBucket: "athena-colz.appspot.com",
    messagingSenderId: "105689041903",
    appId: "1:105689041903:web:7666d4407759b9cc1fc41a",
    measurementId: "G-PBYXR845PL"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);
const storage = getStorage(app);
const db = getFirestore(app);

// Export everything needed
export { 
    app, 
    analytics, 
    database, 
    storage, 
    db, 
    collection, 
    getDocs 
};