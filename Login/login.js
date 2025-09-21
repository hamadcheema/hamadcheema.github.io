import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { notify } from "../App/notify.js";

const firebaseConfig = { /* same config */ 
  apiKey:"AIzaSyBHQyKuiAgi831qANOkkWTNprdW1Pq6rbA",
  authDomain:"devchatbyhamad.firebaseapp.com",
  databaseURL:"https://devchatbyhamad-default-rtdb.firebaseio.com",
  projectId:"devchatbyhamad",
  storageBucket:"devchatbyhamad.appspot.com",
  messagingSenderId:"798871184058",
  appId:"1:798871184058:web:c735bea9756f8109149883"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("loginBtn").addEventListener("click", async ()=>{
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  try {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    if(!res.user.emailVerified){
      notify("Please verify your email first!", "error");
      return;
    }
    notify("Welcome back!", "success");
    setTimeout(()=> window.location.href="../Chat", 1000);
  } catch(err){
    notify(err.message, "error");
  }
});

document.getElementById("forgotBtn").addEventListener("click", async ()=>{
  const email = document.getElementById("email").value;
  if(!email) return notify("Enter email first!", "error");
  try {
    await sendPasswordResetEmail(auth, email);
    notify("Reset email sent!", "success");
  } catch(err){
    notify(err.message, "error");
  }
});
