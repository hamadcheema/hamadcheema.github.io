// auth.js - handles signup/login flows and google sign-in
import { auth, db, reserveUsername, sanitizeUsername, googleProvider, toast, set, ref } from './app.js';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signInWithPopup } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { onValue, push as dbPush } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

// Signup form
const signupForm = document.getElementById('signupForm');
if(signupForm){
  signupForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const usernameRaw = document.getElementById('username').value.trim();
    const username = sanitizeUsername(usernameRaw);
    const fullname = document.getElementById('fullname').value.trim();
    const privateAccount = document.getElementById('privateAccount').checked;
    const profileFile = document.getElementById('profileImage').files[0];

    if(!username){ toast('Invalid username — use letters and numbers only'); return; }

    try{
      // Reserve username first using transaction
      const reserved = await reserveUsername(username, 'PENDING');
      if(!reserved){ toast('Username is already taken'); return; }

      // Now create the auth user
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCred.user);

      // replace the PENDING marker with actual uid by running transaction again
      const reservedFinal = await reserveUsername(username, userCred.user.uid);
      if(!reservedFinal){
        // rollback - this case is rare; write cleanup
        toast('Username reservation failed — try another username');
        return;
      }

      // Build profile object
      const profile = {
        username: username,
        fullname: fullname || '',
        email: email,
        bio: '',
        private: !!privateAccount,
        profileImage: '',
        createdAt: Date.now()
      };

      // If profile file exists, compress and store as base64 (small size recommended)
      if(profileFile){
        const base64 = await fileToCompressedDataURL(profileFile);
        profile.profileImage = base64;
      }

      await set(ref(db, `users/${userCred.user.uid}`), profile);

      toast('Signed up. Verification email sent. Check your inbox.');
      setTimeout(()=> location.replace('/login.html'), 2000);
    }catch(err){
      console.error(err);
      toast(err.message || 'Signup failed');
    }
  });
}

// Login form
const loginForm = document.getElementById('loginForm');
if(loginForm){
  loginForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    try{
      await signInWithEmailAndPassword(auth, email, password);
      // After sign in, check email verified
      if(auth.currentUser && !auth.currentUser.emailVerified){
        toast('Please verify your email first.');
        await auth.signOut();
        return;
      }
      toast('Logged in');
      location.replace('/index.html');
    }catch(err){
      console.error(err); toast(err.message || 'Login failed');
    }
  });
}

// Google sign-in button
const googleBtn = document.getElementById('googleBtn');
if(googleBtn){
  googleBtn.addEventListener('click', async ()=>{
    try{
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      // On first sign-in by Google, create users/uid entry if missing
      const userRef = ref(db, `users/${user.uid}`);
      const snap = await (await import('https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js')).get(userRef);
      if(!snap.exists()){
        // ask user for username — quick fallback use email prefix
        let candidate = (user.email || 'user').split('@')[0].replace(/[^a-z0-9]/gi,'').toLowerCase();
        if(!candidate) candidate = 'user'+Math.floor(Math.random()*10000);
        // try to reserve; if taken, append numbers until reserved
        let reserved = await reserveUsername(candidate, user.uid);
        let tries = 0;
        while(!reserved && tries < 10){
          candidate = candidate + Math.floor(Math.random()*900);
          reserved = await reserveUsername(candidate, user.uid);
          tries++;
        }
        const profile = {
          username: candidate,
          fullname: user.displayName || '',
          email: user.email || '',
          bio: '',
          private: false,
          profileImage: user.photoURL || '',
          createdAt: Date.now()
        };
        await set(userRef, profile);
      }
      location.replace('/index.html');
    }catch(err){ console.error(err); toast(err.message || 'Google login failed'); }
  });
}

// Helper: convert file -> compressed base64 (uses canvas)
export async function fileToCompressedDataURL(file, maxWidth=800, quality=0.65){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = async (ev)=>{
      const img = new Image();
      img.onload = ()=>{
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img,0,0,canvas.width,canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = ev.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
