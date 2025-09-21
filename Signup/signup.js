import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
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

document.getElementById("signupBtn").addEventListener("click", async ()=>{
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  try {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(res.user, { displayName: name });
    await sendEmailVerification(res.user);
    notify("Check your email for verification link!", "success");
  } catch(err){
    notify(err.message, "error");
  }
});
