// js/auth.js
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";
import { auth } from "../firebase-config.js";
import { setUserData, getUserData, updateUserData } from "./database.js";

/**
 * Registers a new user with email and password, then creates a basic profile.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @param {string} username - Desired username.
 * @returns {Promise<object>} User credential object.
 */
export async function registerUser(email, password, username) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save initial user data to Realtime Database
        await setUserData(user.uid, {
            uid: user.uid,
            email: user.email,
            username: username,
            bio: "",
            profilePictureBase64: "" // Placeholder for future Base64 profile pic
        });
        console.log("User registered and profile created:", user.uid);
        return userCredential;
    } catch (error) {
        console.error("Error registering user:", error);
        throw error;
    }
}

/**
 * Logs in an existing user with email and password.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Promise<object>} User credential object.
 */
export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User logged in:", userCredential.user.uid);
        return userCredential;
    } catch (error) {
        console.error("Error logging in user:", error);
        throw error;
    }
}

/**
 * Logs in a user using Google.
 * @returns {Promise<object>} User credential object.
 */
export async function loginWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if user already exists in DB, if not, create profile
        const existingUserData = await getUserData(user.uid);
        if (!existingUserData) {
            await setUserData(user.uid, {
                uid: user.uid,
                email: user.email,
                username: user.displayName || user.email.split('@')[0], // Default username
                bio: "",
                profilePictureBase64: user.photoURL || "" // Use Google profile pic if available
            });
            console.log("New Google user profile created:", user.uid);
        } else if (user.photoURL && !existingUserData.profilePictureBase64) {
            // Update profile picture if Google provides one and DB doesn't have it
            await updateUserData(user.uid, { profilePictureBase64: user.photoURL });
        }

        console.log("Google user logged in:", user.uid);
        return result;
    } catch (error) {
        console.error("Error with Google login:", error);
        throw error;
    }
}

/**
 * Logs out the current user.
 * @returns {Promise<void>}
 */
export async function logoutUser() {
    try {
        await signOut(auth);
        console.log("User logged out.");
    } catch (error) {
        console.error("Error logging out:", error);
        throw error;
    }
}

/**
 * Sets up a real-time listener for authentication state changes.
 * @param {function} callback - Function to call with the current user object (or null).
 * @returns {function} Unsubscribe function.
 */
export function listenForAuthChanges(callback) {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Fetch additional user data from Realtime DB
            const userData = await getUserData(user.uid);
            // Combine auth user data with DB profile data
            callback({ ...user, profile: userData });
        } else {
            callback(null);
        }
    });
}
