// js/auth.js
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { auth, database } from '../firebase-config.js';
import { ref, set } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';

// --- Email/Password Authentication ---
export async function registerUser(email, password, username) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        // Store initial profile data in Realtime DB
        await set(ref(database, 'users/' + user.uid), {
            email: user.email,
            username: username,
            bio: '',
            profilePicture: '' // Placeholder for base64 image
        });
        console.log("User registered and profile created:", user);
        return user;
    } catch (error) {
        console.error("Error registering user:", error.message);
        throw error;
    }
}

export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User logged in:", userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error("Error logging in:", error.message);
        throw error;
    }
}

// --- Google Sign-In ---
export async function signInWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user profile already exists, if not, create it
        const userRef = ref(database, 'users/' + user.uid);
        // You'd typically use `get` here to check existence, but for simplicity
        // and to ensure profile is always there, we can set it.
        // A more robust solution would involve fetching and then updating.
        await set(userRef, {
            email: user.email,
            username: user.displayName || user.email.split('@')[0], // Default username
            bio: '',
            profilePicture: user.photoURL || '' // Google profile picture URL or base64 if converted
        });
        console.log("User signed in with Google:", user);
        return user;
    } catch (error) {
        console.error("Error with Google sign-in:", error.message);
        throw error;
    }
}


// --- Logout ---
export async function logoutUser() {
    try {
        await signOut(auth);
        console.log("User logged out.");
    } catch (error) {
        console.error("Error logging out:", error.message);
        throw error;
    }
}

// --- Auth State Observer ---
export function setupAuthObserver(callback) {
    onAuthStateChanged(auth, user => {
        callback(user);
    });
}

export function getCurrentUser() {
    return auth.currentUser;
}
