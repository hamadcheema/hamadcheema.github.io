// Chat/chat.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, onChildChanged, set, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut, updateEmail, updatePassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

// ✅ Firebase Config
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
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

// DOM Elements
const messagesEl = document.getElementById('messages');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const emojiToggle = document.getElementById('emojiToggle');
const emojiPicker = document.getElementById('emojiPicker');
const fileInput = document.getElementById('fileInput');
const imgBtn = document.getElementById('imgBtn');
const imgPreview = document.getElementById('imgPreview');
const logoutBtn = document.getElementById("logoutBtn");
const changeEmailBtn = document.getElementById("changeEmailBtn");
const changePasswordBtn = document.getElementById("changePasswordBtn");

// Notification helper
function showNotification(msg, type='info') {
  let notif = document.createElement('div');
  notif.innerText = msg;
  notif.style.position = 'fixed';
  notif.style.top = '20px';
  notif.style.left = '50%';
  notif.style.transform = 'translateX(-50%)';
  notif.style.background = type==='error' ? '#f44336' : (type==='success' ? '#4caf50' : '#2196f3');
  notif.style.color = '#fff';
  notif.style.padding = '12px 20px';
  notif.style.borderRadius = '8px';
  notif.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
  notif.style.zIndex = '9999';
  notif.style.opacity = '0';
  notif.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  document.body.appendChild(notif);
  setTimeout(()=>{ notif.style.opacity='1'; notif.style.transform='translateX(-50%) translateY(0)'; }, 50);
  setTimeout(()=>{ notif.style.opacity='0'; notif.style.transform='translateX(-50%) translateY(-20px)'; setTimeout(()=>notif.remove(),300); }, 3500);
}

// Current User
let currentUser = null;
let pendingImage = null;
let pendingProfileImage = null;

// Auth check
onAuthStateChanged(auth, (user) => {
  if (!user) window.location.href = "../Login";
  else {
    currentUser = user;
    document.getElementById("welcome").innerText = "Welcome, " + (user.displayName || user.email);
    loadMessages();
  }
});

// Logout
logoutBtn.addEventListener("click", async ()=>{
  await signOut(auth);
  window.location.href = "../Login";
});

// Change Email
changeEmailBtn.addEventListener("click", async ()=>{
  const newEmail = prompt("Enter new email:");
  if(newEmail){
    try{ await updateEmail(auth.currentUser,newEmail); showNotification("Email updated","success"); }
    catch(err){ showNotification(err.message,"error"); }
  }
});

// Change Password
changePasswordBtn.addEventListener("click", async ()=>{
  const newPass = prompt("Enter new password:");
  if(newPass){
    try{ await updatePassword(auth.currentUser,newPass); showNotification("Password updated","success"); }
    catch(err){ showNotification(err.message,"error"); }
  }
});

// Change Profile Pic
const profileInput = document.createElement('input');
profileInput.type = 'file';
profileInput.accept = 'image/*';
profileInput.style.display = 'none';
document.body.appendChild(profileInput);

const profileBtn = document.createElement('button');
profileBtn.innerText = "Change Profile Pic";
document.body.appendChild(profileBtn);

profileBtn.addEventListener('click', ()=> profileInput.click());
profileInput.addEventListener('change', async e=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => { pendingProfileImage = ev.target.result; showNotification("Preview ready for upload","info"); };
  reader.readAsDataURL(file);
  const storageRef = sRef(storage, `profiles/${currentUser.uid}/${file.name}`);
  try{
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    await updateProfile(auth.currentUser,{photoURL: url});
    currentUser.photoURL = url;
    showNotification("Profile picture updated","success");
  } catch(err){ showNotification(err.message,"error"); }
});

// Emoji picker
const emojis = ["😀","😁","😂","😍","😎","😢","😡","👍","🙏","🔥","❤️","🎉"];
emojis.forEach(e=>{
  const s = document.createElement('span');
  s.textContent = e;
  s.onclick = ()=>{ msgInput.value += e; emojiPicker.style.display='none'; };
  emojiPicker.appendChild(s);
});
emojiToggle.addEventListener('click', ()=> {
  emojiPicker.style.display = emojiPicker.style.display==='flex'?'none':'flex';
  emojiPicker.style.flexWrap='wrap';
  emojiPicker.style.gap='4px';
});

// Send message (text + optional image)
async function sendMessage(){
  const text = msgInput.value.trim();
  if(!text && !pendingImage) return;
  const payload = {
    uid: currentUser.uid,
    username: currentUser.displayName || currentUser.email,
    photoURL: currentUser.photoURL || `https://avatars.dicebear.com/api/identicon/${encodeURIComponent(currentUser.email)}.svg`,
    ts: Date.now(),
    text: text,
    type: pendingImage ? 'image+text' : 'text',
    image: pendingImage || null
  };
  await push(ref(db,'messages'), payload);
  msgInput.value=''; pendingImage=null; imgPreview.style.display='none';
}

// Send button & Enter
sendBtn.addEventListener('click', sendMessage);
msgInput.addEventListener('keydown', (e)=>{
  if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); }
});

// Image upload preview for chat
imgBtn.addEventListener('click', ()=> fileInput.click());
fileInput.addEventListener('change', e=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ev=>{
    pendingImage = ev.target.result;
    imgPreview.innerHTML=`<img src="${pendingImage}" style="max-width:120px;border-radius:8px;">`;
    imgPreview.style.display='block';
  };
  reader.readAsDataURL(file);
});

// Load Messages
function loadMessages(){
  const msgRef = ref(db,'messages');
  onChildAdded(msgRef, snap=> renderMessage(snap.key, snap.val()));
  onChildChanged(msgRef, snap=> updateMessage(snap.key, snap.val()));
}

// Render message
function renderMessage(id,msg){
  const row = document.createElement('div'); row.className='msg-row'; row.id='msg-'+id;
  row.style.animation = "slideIn 0.3s ease";

  const avatar = document.createElement('img'); avatar.className='avatar';
  avatar.src = msg.photoURL || `https://avatars.dicebear.com/api/identicon/${encodeURIComponent(msg.username)}.svg`;
  row.appendChild(avatar);

  const bubble = document.createElement('div'); bubble.className='bubble';
  bubble.innerHTML = `<div class="meta">${msg.username} <span class="time">${new Date(msg.ts).toLocaleTimeString()}</span></div>`;
  if(msg.image){ bubble.innerHTML+=`<img src="${msg.image}" class="chat-img"/><div>${msg.text}</div>`; }
  else bubble.innerHTML+=`<div>${msg.text}</div>`;

  const reactionsDiv = document.createElement('div'); reactionsDiv.className='reactions'; bubble.appendChild(reactionsDiv);

  row.appendChild(bubble);
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  renderReactions(id,msg);

  // Image full-screen view
  if(msg.image){
    bubble.querySelector('img').addEventListener('click', ()=>{
      const overlay = document.createElement('div');
      overlay.style.position='fixed'; overlay.style.top='0'; overlay.style.left='0';
      overlay.style.width='100%'; overlay.style.height='100%';
      overlay.style.background='rgba(0,0,0,0.8)'; overlay.style.display='flex';
      overlay.style.alignItems='center'; overlay.style.justifyContent='center';
      overlay.style.zIndex='9999';
      const img = document.createElement('img'); img.src=msg.image;
      img.style.maxWidth='90%'; img.style.maxHeight='90%'; img.style.borderRadius='8px';
      const closeBtn = document.createElement('button'); closeBtn.innerText='Close';
      closeBtn.style.position='absolute'; closeBtn.style.top='20px'; closeBtn.style.right='20px';
      closeBtn.style.padding='8px 12px'; closeBtn.style.fontSize='16px';
      closeBtn.addEventListener('click', ()=> overlay.remove());
      overlay.appendChild(img); overlay.appendChild(closeBtn);
      document.body.appendChild(overlay);
    });
  }
}

// Update message reactions
function updateMessage(id,msg){ renderReactions(id,msg); }
async function toggleReaction(msgId, emoji, prev){
  const reactRef = ref(db,`messages/${msgId}/reactions/${currentUser.uid}`);
  if(prev===emoji) await set(reactRef,null); else await set(reactRef,emoji);
}

function renderReactions(id,msg){
  const row=document.getElementById('msg-'+id); if(!row) return;
  const reactionsDiv=row.querySelector('.reactions'); reactionsDiv.innerHTML='';
  const reactions=msg.reactions||{}; let myReaction=null; const counts={};
  for(const uid in reactions){ const em=reactions[uid]; if(!em) continue; counts[em]=(counts[em]||0)+1; if(uid===currentUser.uid) myReaction=em; }
  ["👍","😂","❤️","🔥","😢","😡"].forEach(em=>{
    const btn=document.createElement('span'); btn.className='reaction-btn'; if(myReaction===em) btn.classList.add('you');
    btn.textContent=counts[em]?`${em} ${counts[em]}`:em;
    btn.onclick=()=>toggleReaction(id,em,myReaction);
    reactionsDiv.appendChild(btn);
  });
}

// CSS Animations
const style = document.createElement('style');
style.innerHTML = `
@keyframes slideIn { from {opacity:0; transform: translateY(20px);} to {opacity:1; transform: translateY(0);} }
`;
document.head.appendChild(style);
