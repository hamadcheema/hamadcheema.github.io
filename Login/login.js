import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

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

const emailInput = document.getElementById('emailInput');
const passInput = document.getElementById('passInput');
const loginBtn = document.getElementById('loginBtn');
const googleBtn = document.getElementById('googleBtn');
const banner = document.getElementById('banner');

function showBanner(msg,type='success'){ banner.innerText=msg; banner.className='banner show '+type; setTimeout(()=>{banner.className='banner'},3000); }

loginBtn.addEventListener('click', async ()=>{
  const email=emailInput.value.trim(),pass=passInput.value.trim();
  if(!email||!pass) return showBanner("Fill all fields","error");
  try{
    const userCred = await signInWithEmailAndPassword(auth,email,pass);
    if(!userCred.user.emailVerified) return showBanner("❌ Verify email first","error");
    showBanner("✅ Login success");
    window.location.href="../Chat/index.html";
  }catch(err){ showBanner(err.message,"error"); }
});

googleBtn.addEventListener('click', async ()=>{
  const provider = new GoogleAuthProvider();
  try{
    const result = await signInWithPopup(auth,provider);
    showBanner("✅ Logged in with Google");
    window.location.href="../Chat/index.html";
  }catch(err){ showBanner(err.message,"error"); }
});
