import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, onChildChanged, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
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

const optionsBtn = document.getElementById('optionsBtn');
const optionsMenu = document.getElementById('optionsMenu');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettings = document.getElementById('closeSettings');
const usernameInput = document.getElementById('usernameInput');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const profilePicInput = document.getElementById('profilePicInput');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');

const logoutBtn = document.getElementById('logoutBtn');
const notification = document.getElementById('notification');

let currentUser = null;
let pendingImage = null;
let pendingProfilePic = null;

// ------------------ Auth ------------------
onAuthStateChanged(auth, user=>{
  if(!user) window.location.href="../Login";
  else{
    currentUser = user;
    document.getElementById("welcome").innerText = "Welcome, "+(user.displayName||user.email);
    loadMessages();
  }
});

logoutBtn.addEventListener('click', async ()=>{
  await signOut(auth);
});

// ------------------ Options menu ------------------
optionsBtn.addEventListener('click', ()=>{optionsMenu.style.display = optionsMenu.style.display==='flex'?'none':'flex';});

// ------------------ Settings ------------------
openSettingsBtn.addEventListener('click', ()=>{optionsMenu.style.display='none'; settingsPanel.style.display='flex';});
closeSettings.addEventListener('click', ()=>{settingsPanel.style.display='none';});

profilePicInput.addEventListener('change', e=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ev=>{
    pendingProfilePic = ev.target.result;
  };
  reader.readAsDataURL(file);
});

// ------------------ Save Settings ------------------
saveSettingsBtn.addEventListener('click', async ()=>{
  try{
    if(usernameInput.value) await updateProfile(currentUser, {displayName:usernameInput.value});
    if(emailInput.value) await updateEmail(currentUser,emailInput.value);
    if(passwordInput.value) await updatePassword(currentUser,passwordInput.value);
    if(pendingProfilePic) await updateProfile(currentUser,{photoURL:pendingProfilePic});
    showNotification("✅ Profile Updated");
    settingsPanel.style.display='none';
    usernameInput.value=emailInput.value=passwordInput.value="";
    pendingProfilePic=null;
    document.getElementById("welcome").innerText = "Welcome, "+(currentUser.displayName||currentUser.email);
  }catch(err){ showNotification("❌ "+err.message);}
});

// ------------------ Notifications ------------------
function showNotification(msg){
  notification.innerText = msg;
  notification.style.display='block';
  setTimeout(()=>{notification.style.display='none';},3000);
}

// ------------------ Emojis ------------------
const emojis=["😀","😁","😂","😍","😎","😢","😡","👍","🙏","🔥","❤️","🎉"];
emojis.forEach(e=>{
  const s=document.createElement('span');
  s.textContent=e;
  s.onclick=()=>{msgInput.value+=e; emojiPicker.classList.remove('show');};
  emojiPicker.appendChild(s);
});
emojiToggle.addEventListener('click', ()=>{emojiPicker.classList.toggle('show');});

// ------------------ Messages ------------------
async function sendMessage(){
  const text = msgInput.value.trim();
  if(!text && !pendingImage) return;
  const payload = {
    uid:currentUser.uid,
    username:currentUser.displayName||currentUser.email,
    ts:Date.now()
  };
  if(pendingImage){
    payload.type='image'; payload.text=pendingImage; pendingImage=null; imgPreview.style.display='none';
  } else payload.type='text', payload.text=text;
  await push(ref(db,'messages'), payload);
  msgInput.value=''; fileInput.value='';
}
sendBtn.addEventListener('click', sendMessage);
msgInput.addEventListener('keydown', e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault(); sendMessage();}});

imgBtn.addEventListener('click', ()=>fileInput.click());
fileInput.addEventListener('change', e=>{
  const file=e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ev=>{
    pendingImage=ev.target.result;
    imgPreview.innerHTML=`<img src="${pendingImage}"/>`; imgPreview.style.display='block';
  };
  reader.readAsDataURL(file);
});

// ------------------ Load Messages ------------------
function loadMessages(){
  onChildAdded(ref(db,'messages'), snap=>{renderMessage(snap.key,snap.val());});
  onChildChanged(ref(db,'messages'), snap=>{updateMessage(snap.key,snap.val());});
}

function renderMessage(id,msg){
  const row=document.createElement('div'); row.className='msg-row'; row.id='msg-'+id;
  // avatar
  const avatar=document.createElement('img'); avatar.className='avatar';
  avatar.src = msg.photoURL||"https://avatars.dicebear.com/api/identicon/"+encodeURIComponent(msg.username)+".svg";
  row.appendChild(avatar);
  // bubble
  const bubble=document.createElement('div'); bubble.className='bubble';
  bubble.innerHTML=`<div class="meta">${msg.username} <span class="time">${new Date(msg.ts).toLocaleTimeString()}</span></div>`;
  if(msg.type==='image'){bubble.innerHTML+=`<img src="${msg.text}" class="chat-img"/>`;}
  else{bubble.innerHTML+=`<div>${msg.text}</div>`;}
  const reactionsDiv=document.createElement('div'); reactionsDiv.className='reactions';
  bubble.appendChild(reactionsDiv); row.appendChild(bubble); messagesEl.appendChild(row);
  messagesEl.scrollTop=messagesEl.scrollHeight;
  setTimeout(()=>{row.classList.add('show');},50);
  renderReactions(id,msg);
}

// ------------------ Reactions ------------------
async function toggleReaction(msgId, emoji, prev){
  const reactRef = ref(db,`messages/${msgId}/reactions/${currentUser.uid}`);
  if(prev===emoji) await set(reactRef,null);
  else await set(reactRef,emoji);
}

function renderReactions(id,msg){
  const row=document.getElementById('msg-'+id);
  if(!row) return;
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
