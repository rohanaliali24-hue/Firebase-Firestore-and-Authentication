
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";

import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

const firebaseConfig = {

  apiKey: "AIzaSyDhlkzMa2UANvF1ZyEb1bnmuwsz8ixE7Ys",
  authDomain: "fir-main-6acaf.firebaseapp.com",
  projectId: "fir-main-6acaf",
  storageBucket: "fir-main-6acaf.firebasestorage.app",
  messagingSenderId: "962509102953",
  appId: "1:962509102953:web:a37f8bae7d5feae5f7e7f8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);


