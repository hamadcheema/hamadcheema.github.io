import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

const signupForm = document.getElementById('signupForm');
const googleBtn = document.getElementById('googleSignUp');
const banner = document.getElementById('banner');

function showBanner(msg,type='success'){
  banner.textContent=msg; banner.className=`banner ${type} show`;
  setTimeout(()=> banner.className='banner',3000);
}

signupForm.addEventListener('submit', async e=>{
  e.preventDefault();
  const email=document.getElementById('email').value;
  const password=document.getElementById('password').value;
  const displayName=document.getElementById('displayName').value;
  try{
    const userCred = await createUserWithEmailAndPassword(auth,email,password);
    await updateProfile(userCred.user,{displayName});
    await sendEmailVerification(userCred.user);
    showBanner("Verification email sent! Check your inbox.",'success');
    signupForm.reset();
  }catch(err){ showBanner(err.message,'error'); }
});

googleBtn.addEventListener('click', async ()=>{
  try{
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth,provider);
    if(!result.user.emailVerified){
      await sendEmailVerification(result.user);
      showBanner("Verification email sent! Check your inbox.",'success');
    } else {
      window.location.href="../Chat/";
    }
  }catch(err){ showBanner(err.message,'error'); }
});
