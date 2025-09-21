import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, onChildChanged, set, update } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut, updateEmail, updatePassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Firebase Config
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

const messagesEl = document.getElementById('messages');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const emojiToggle = document.getElementById('emojiToggle');
const emojiPicker = document.getElementById('emojiPicker');
const fileInput = document.getElementById('fileInput');
const imgBtn = document.getElementById('imgBtn');
const imgPreview = document.getElementById('imgPreview');
const notifyEl = document.getElementById('notify');

const optionsBtn = document.getElementById('optionsBtn');
const optionsMenu = document.getElementById('optionsMenu');
const logoutBtn = document.getElementById('logoutBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettings = document.getElementById('closeSettings');

const profilePicInput = document.getElementById('profilePicInput');
const profilePreview = document.getElementById('profilePreview');
const usernameInput = document.getElementById('usernameInput');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const updateSettingsBtn = document.getElementById('updateSettingsBtn');

let currentUser = null;
let pendingImage = null;
let profileImage = null;

// --- Auth ---
onAuthStateChanged(auth, user=>{
  if(!user) window.location.href="../Login/index.html";
  else{
    currentUser = user;
    document.getElementById("welcome").innerText = "Welcome, "+(user.displayName||user.email);
    loadMessages();
  }
});

// --- Notifications ---
function notify(msg){
  notifyEl.innerText = msg;
  notifyEl.style.opacity = 1;
  setTimeout(()=> notifyEl.style.opacity=0, 3000);
}

// --- Options Menu ---
optionsBtn.addEventListener('click',()=> optionsMenu.style.display = optionsMenu.style.display==='flex'?'none':'flex');
logoutBtn.addEventListener('click', async ()=>{
  await signOut(auth);
  window.location.href="../Login/index.html";
});
settingsBtn.addEventListener('click',()=>{
  optionsMenu.style.display='none';
  settingsPanel.style.display='flex';
});
closeSettings.addEventListener('click',()=> settingsPanel.style.display='none');

// --- Emoji Picker ---
const emojis = ["😀","😁","😂","😍","😎","😢","😡","👍","🙏","🔥","❤️","🎉"];
emojis.forEach(e=>{
  const s = document.createElement('span');
  s.textContent = e;
  s.onclick = ()=>{ msgInput.value += e; emojiPicker.style.display='none'; };
  emojiPicker.appendChild(s);
});
emojiToggle.addEventListener('click', ()=> emojiPicker.style.display = emojiPicker.style.display==='flex'?'none':'flex');

// --- Image upload preview ---
imgBtn.addEventListener('click',()=> fileInput.click());
fileInput.addEventListener('change', e=>{
  const file=e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ev=>{
    pendingImage = ev.target.result;
    imgPreview.innerHTML=`<img src="${pendingImage}" alt="preview"/>`;
    imgPreview.style.display='block';
  }
  reader.readAsDataURL(file);
});

// --- Profile Pic preview ---
profilePicInput.addEventListener('change', e=>{
  const file=e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ev=>{
    profilePreview.src = ev.target.result;
    profilePreview.style.display='block';
    profileImage = ev.target.result;
  }
  reader.readAsDataURL(file);
});

// --- Update Settings ---
updateSettingsBtn.addEventListener('click', async ()=>{
  if(profileImage) await updateProfile(currentUser,{photoURL:profileImage});
  if(usernameInput.value) await updateProfile(currentUser,{displayName:usernameInput.value});
  if(emailInput.value) try{await updateEmail(currentUser,emailInput.value);}catch(e){notify(e.message);}
  if(passwordInput.value) try{await updatePassword(currentUser,passwordInput.value);}catch(e){notify(e.message);}
  notify("Profile updated!");
  settingsPanel.style.display='none';
});

// --- Send Message ---
async function sendMessage(){
  const text = msgInput.value.trim();
  if(!text && !pendingImage) return;
  const payload = {
    uid: currentUser.uid,
    username: currentUser.displayName || currentUser.email,
    ts: Date.now(),
    type: pendingImage?'image-text':'text',
    text: text,
    img: pendingImage||null,
    reactions: {}
  };
  await push(ref(db,'messages'),payload);
  msgInput.value=''; pendingImage=null; imgPreview.style.display='none';
}
sendBtn.addEventListener('click', sendMessage);
msgInput.addEventListener("keydown", e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}});

// --- Load Messages ---
function loadMessages(){
  const msgRef = ref(db,'messages');
  onChildAdded(msgRef, snap=> renderMessage(snap.key,snap.val()));
  onChildChanged(msgRef, snap=> renderMessage(snap.key,snap.val()));
}

// --- Render Message ---
function renderMessage(id,msg){
  let row = document.getElementById('msg-'+id);
  if(!row){
    row=document.createElement('div'); row.className='msg-row'; row.id='msg-'+id; messagesEl.appendChild(row);
  } row.innerHTML='';
  
  const avatar = document.createElement('img');
  avatar.className='avatar';
  avatar.src = msg.uid===currentUser.uid && currentUser.photoURL?currentUser.photoURL:
               msg.photoURL?msg.photoURL:"https://avatars.dicebear.com/api/identicon/"+encodeURIComponent(msg.username)+".svg";
  row.appendChild(avatar);

  const bubble = document.createElement('div'); bubble.className='bubble';
  bubble.innerHTML=`<div class="meta">${msg.username} <span class="time">${new Date(msg.ts).toLocaleTimeString()}</span></div>`;
  if(msg.type==='image-text' && msg.img) bubble.innerHTML+=`<img src="${msg.img}" class="chat-img"/><div>${msg.text}</div>`;
  else if(msg.type==='image') bubble.innerHTML+=`<img src="${msg.text}" class="chat-img"/>`;
  else bubble.innerHTML+=`<div>${msg.text}</div>`;

  const reactionsDiv = document.createElement('div'); reactionsDiv.className='reactions';
  bubble.appendChild(reactionsDiv);
  row.appendChild(bubble);

  renderReactions(id,msg);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// --- Reactions ---
async function toggleReaction(msgId, emoji, prev){
  const reactRef = ref(db,`messages/${msgId}/reactions/${currentUser.uid}`);
  if(prev===emoji) await set(reactRef,null);
  else await set(reactRef,emoji);
}

function renderReactions(id,msg){
  const row=document.getElementById('msg-'+id);
  if(!row) return;
  const reactionsDiv=row.querySelector('.reactions'); reactionsDiv.innerHTML='';
  const reactions=msg.reactions||{};
  let myReaction=null; const counts={};
  for(const uid in reactions){ const em=reactions[uid]; if(!em) continue; counts[em]=(counts[em]||0)+1; if(uid===currentUser.uid) myReaction=em;}
  ["👍","😂","❤️","🔥","😢","😡"].forEach(em=>{
    const btn=document.createElement('span'); btn.className='reaction-btn'; if(myReaction===em) btn.classList.add('you');
    btn.textContent=counts[em]?`${em} ${counts[em]}`:em;
    btn.onclick=()=>toggleReaction(id,em,myReaction);
    reactionsDiv.appendChild(btn);
  });
}
