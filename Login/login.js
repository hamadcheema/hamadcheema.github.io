import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

const loginForm = document.getElementById('loginForm');
const googleBtn = document.getElementById('googleSignIn');
const forgotBtn = document.getElementById('forgotPass');
const banner = document.getElementById('banner');

function showBanner(msg,type='success'){
  banner.textContent=msg; banner.className=`banner ${type} show`;
  setTimeout(()=> banner.className='banner',3000);
}

loginForm.addEventListener('submit', async e=>{
  e.preventDefault();
  const email=document.getElementById('email').value;
  const password=document.getElementById('password').value;
  try{
    const user=await signInWithEmailAndPassword(auth,email,password);
    if(!user.user.emailVerified){
      showBanner('Please verify your email first','error'); return;
    }
    window.location.href="../Chat/";
  }catch(err){ showBanner(err.message,'error'); }
});

googleBtn.addEventListener('click', async ()=>{
  try{
    const provider=new GoogleAuthProvider();
    await signInWithPopup(auth,provider);
    window.location.href="../Chat/";
  }catch(err){ showBanner(err.message,'error'); }
});

forgotBtn.addEventListener('click', async ()=>{
  const email=prompt("Enter your email for password reset:");
  if(!email) return;
  try{
    await sendPasswordResetEmail(auth,email);
    showBanner("Password reset email sent!");
  }catch(err){ showBanner(err.message,'error'); }
});
