import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHQyKuiAgi831qANOkkWTNprdW1Pq6rbA",
  authDomain: "devchatbyhamad.firebaseapp.com",
  databaseURL: "https://devchatbyhamad-default-rtdb.firebaseio.com",
  projectId: "devchatbyhamad",
  storageBucket: "devchatbyhamad.appspot.com",
  messagingSenderId: "798871184058",
  appId: "1:798871184058:web:c735bea9756f8109149883",
  measurementId: "G-QTCCWC70QH"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const notify = (msg, type = "error") => {
  const box = document.getElementById("notification");
  box.innerText = msg;
  box.style.color = type === "success" ? "green" : "red";
  setTimeout(() => (box.innerText = ""), 3000);
};

// Email/Password Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    notify("Login successful!", "success");
    setTimeout(() => window.location.href = "../Chat/index.html", 1500);
  } catch (error) {
    notify(error.message);
  }
});

// Google Login
const googleProvider = new GoogleAuthProvider();
document.getElementById("googleLoginBtn").addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, googleProvider);
    notify("Google login successful!", "success");
    setTimeout(() => window.location.href = "../Chat/index.html", 1500);
  } catch (error) {
    notify(error.message);
  }
});
