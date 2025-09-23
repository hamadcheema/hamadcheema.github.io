// app.js - Firebase init and common helpers
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, runTransaction, push, set, get, child, query, orderByChild, startAt, endAt } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";


// YOUR firebase config (you provided this earlier)
const firebaseConfig = {
apiKey: "AIzaSyBHQyKuiAgi831qANOkkWTNprdW1Pq6rbA",
authDomain: "devchatbyhamad.firebaseapp.com",
databaseURL: "https://devchatbyhamad-default-rtdb.firebaseio.com",
projectId: "devchatbyhamad",
storageBucket: "devchatbyhamad.firebasestorage.app",
messagingSenderId: "798871184058",
appId: "1:798871184058:web:c735bea9756f8109149883",
measurementId: "G-QTCCWC70QH"
};


export const firebaseApp = initializeApp(firebaseConfig);
export const db = getDatabase(firebaseApp);
export const auth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();


//
