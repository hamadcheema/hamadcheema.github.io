// Firebase SDK Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, 
  signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBHQyKuiAgi831qANOkkWTNprdW1Pq6rbA",
  authDomain: "devchatbyhamad.firebaseapp.com",
  projectId: "devchatbyhamad",
  storageBucket: "devchatbyhamad.appspot.com",
  messagingSenderId: "798871184058",
  appId: "1:798871184058:web:c735bea9756f8109149883",
  measurementId: "G-QTCCWC70QH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Notification System
function showNotification(message, type) {
  const notif = document.getElementById("notification");
  if (notif) {
    notif.innerText = message;
    notif.className = type;
    notif.style.display = "block";
    setTimeout(() => { notif.style.display = "none"; }, 4000);
  } else {
    alert(message); // fallback
  }
}

// Signup
window.signup = function () {
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      sendEmailVerification(userCredential.user)
        .then(() => {
          showNotification("Verification email sent! Please check inbox.", "success");
        });
    })
    .catch((error) => {
      showNotification(error.message, "error");
    });
};

// Login
window.login = function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      if (userCredential.user.emailVerified) {
        window.location.href = "../Chat/chat.html";
      } else {
        showNotification("Please verify your email before login.", "error");
      }
    })
    .catch((error) => {
      showNotification(error.message, "error");
    });
};

// Google Signup/Login
window.googleSignup = window.googleLogin = function () {
  signInWithPopup(auth, provider)
    .then(() => {
      window.location.href = "../Chat/chat.html";
    })
    .catch((error) => {
      showNotification(error.message, "error");
    });
};

// Logout
window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = "../Login/login.html";
  });
};

// Auto Redirect if Already Logged In
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (user.emailVerified && window.location.pathname.includes("login")) {
      window.location.href = "../Chat/chat.html";
    }
  }
});
