
import { auth, db } from "./firebase.config.js";

import {
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

// LOGIN FUNCTION
const login = async (event) => {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;

    const loginBtn = document.getElementById("login-btn");
    const message = document.getElementById("login-message");

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";
    message.textContent = "";

    try {
        await signInWithEmailAndPassword(auth, email, password);

        window.location.replace("../dashboard/dashboard.html");

    } catch (error) {
        console.error("Login Error:", error);

        message.textContent = error.message;
        loginBtn.disabled = false;
        loginBtn.textContent = "Login to Account";
    }
};

// SIGNUP FUNCTION
const register = async (event) => {
    event.preventDefault();

    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;

    const registerBtn = event.submitter;
    registerBtn.disabled = true;
    registerBtn.textContent = "Creating Account...";

    if (name.length < 2) {
        alert("Please enter your full name.");
        registerBtn.disabled = false;
        registerBtn.textContent = "Create Account";
        return;
    }

    try {
        // CREATE FIREBASE ACCOUNT
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;

        // SAVE USER IN FIRESTORE
        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            fullName: name,
            username: name,
            created_at: Date.now()
        });

        alert("Account created successfully!");

        // GO TO DASHBOARD
        window.location.replace("../dashboard/dashboard.html");

    } catch (error) {
        console.error("Signup Error:", error);

        alert(error.message);

        registerBtn.disabled = false;
        registerBtn.textContent = "Create Account";
    }
};

// LOGIN EVENT
document.getElementById("login-form")
    ?.addEventListener("submit", login);

// SIGNUP EVENT
document.getElementById("register-form")
    ?.addEventListener("submit", register);

