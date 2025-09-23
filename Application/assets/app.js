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

// Simple UI helpers
export function toast(msg, timeout = 3000){
  const t = document.getElementById('toast');
  if(!t) return alert(msg);
  t.textContent = msg; t.classList.remove('hidden');
  setTimeout(()=> t.classList.add('hidden'), timeout);
}

// Utility: safe username (lowercase, alphanum only)
export function sanitizeUsername(v){
  return String(v||'').toLowerCase().replace(/[^a-z0-9]/g,'');
}

// Reserve username atomically using runTransaction
export async function reserveUsername(username, uid){
  username = sanitizeUsername(username);
  if(!username) return false;
  const unameRef = ref(db, `usernames/${username}`);
  try{
    const res = await runTransaction(unameRef, (current) => {
      if (current === null) return uid; // reserve
      return; // abort
    });
    return res.committed === true;
  }catch(e){
    console.error('reserveUsername err', e);
    return false;
  }
}

// Deterministic private chat id between two uids
export function chatIdFor(u1,u2){
  if(!u1 || !u2) return null;
  return (u1 < u2) ? `PRIVATE_${u1}_${u2}` : `PRIVATE_${u2}_${u1}`;
}

// Logout binding
const logoutBtn = document.getElementById('logoutBtn');
if(logoutBtn){
  logoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await signOut(auth);
    location.href = '/login.html';
  });
}

// Auth state handling helper you can import; this sets a global currentUser
export let currentUser = null;
onAuthStateChanged(auth, (user)=>{
  currentUser = user;
  // Basic redirect guard
  const path = location.pathname.split('/').pop();
  if(user){
    // If on login or signup, go to index
    if(path === 'login.html' || path === 'signup.html' || path === '') location.replace('/index.html');
  } else {
    // If user not logged in and on protected pages, send to login
    const publicPages = ['login.html','signup.html'];
    if(!publicPages.includes(path)){
      if(path !== 'login.html' && path !== 'signup.html') location.replace('/login.html');
    }
  }
});

// Simple helper: get user profile by uid
export async function getUserByUid(uid){
  const snap = await get(ref(db, `users/${uid}`));
  return snap.exists() ? snap.val() : null;
}

// Prefix search helper - search usernames (uses searchIndex or usernames mapping if exact)
export async function searchByUsernamePrefix(prefix){
  prefix = prefix.toLowerCase();
  // This will return username keys starting with prefix
  const q = query(ref(db, 'usernames'), orderByChild(null));
  // Realtime DB doesn't support orderByKey with startAt in web modular easily; fallback: fetch all and filter client-side (small apps okay)
  const snap = await get(ref(db, 'usernames'));
  const results = [];
  if(snap.exists()){
    snap.forEach(childSnap=>{
      const key = childSnap.key;
      if(key.startsWith(prefix)) results.push({username:key, uid:childSnap.val()});
    });
  }
  return results;
}

// Export other useful functions from db module if needed
export { ref, set, push, child, get, query, orderByChild, startAt, endAt };
