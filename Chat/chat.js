import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, onChildChanged, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut, updateEmail, updatePassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBHQyKuiAgi831qANOkkWTNprdW1Pq6rbA",
  authDomain: "devchatbyhamad.firebaseapp.com",
  databaseURL: "https://devchatbyhamad-default-rtdb.firebaseio.com",
  projectId: "devchatbyhamad",
  storageBucket: "devchatbyhamad.appspot.com",
  messagingSenderId: "798871184058",
  appId: "1:798871184058:web:c735bea9756f8109149883"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Elements
const messagesEl = document.getElementById('messages');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const emojiPicker = document.getElementById('emojiPicker');
const emojiToggle = document.getElementById('emojiToggle');
const fileInput = document.getElementById('fileInput');
const imgBtn = document.getElementById('imgBtn');
const imgPreview = document.getElementById('imgPreview');
const menuBtn = document.getElementById('menuBtn');
const settingsPanel = document.getElementById('settingsPanel');
const newName = document.getElementById('newName');
const newEmail = document.getElementById('newEmail');
const newPass = document.getElementById('newPass');
const profilePicInput = document.getElementById('profilePicInput');
const updateProfileBtn = document.getElementById('updateProfileBtn');
const logoutBtn = settingsPanel.querySelector('#logoutBtn');

let currentUser = null;
let pendingImage = null;

// Auth check
onAuthStateChanged(auth, user=>{
  if(!user) location.href="../Login/login.html";
  currentUser = user;
  loadMessages();
});

// Show notification
function notify(msg,type='success'){
  const n=document.createElement('div');
  n.className=`notification ${type}`;
  n.textContent=msg;
  document.body.appendChild(n);
  setTimeout(()=>n.remove(),3000);
}

// Emoji setup
const emojis = ["😀","😁","😂","😍","😎","😢","😡","👍","🙏","🔥","❤️","🎉"];
emojis.forEach(e=>{
  const s=document.createElement('span');
  s.textContent=e;
  s.onclick=()=>{ msgInput.value+=e; emojiPicker.classList.remove('active'); };
  emojiPicker.appendChild(s);
});
emojiToggle.onclick=()=>emojiPicker.classList.toggle('active');

// Send message
async function sendMessage(){
  const text = msgInput.value.trim();
  if(!text && !pendingImage) return;
  const payload = {
    uid:currentUser.uid,
    username:currentUser.displayName || currentUser.email,
    ts:Date.now()
  };
  if(pendingImage){ payload.type='image'; payload.text=pendingImage; pendingImage=null; imgPreview.style.display='none'; }
  else payload.type='text', payload.text=text;

  await push(ref(db,'messages'),payload);
  msgInput.value='';
  fileInput.value='';
}
sendBtn.onclick=sendMessage;
msgInput.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendMessage(); }
});

// Image upload
imgBtn.onclick=()=>fileInput.click();
fileInput.addEventListener('change',e=>{
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=ev=>{ pendingImage=ev.target.result; imgPreview.innerHTML=`<img src="${pendingImage}"/>`; imgPreview.style.display='block'; }
  reader.readAsDataURL(file);
});

// Render messages
function loadMessages(){
  const msgRef=ref(db,'messages');
  onChildAdded(msgRef,snap=>renderMessage(snap.key,snap.val()));
  onChildChanged(msgRef,snap=>updateMessage(snap.key,snap.val()));
}
function renderMessage(id,msg){
  const row=document.createElement('div');
  row.className='msg-row'; if(msg.uid===currentUser.uid) row.classList.add('self'); row.id='msg-'+id;
  const avatar=document.createElement('img'); avatar.className='avatar'; avatar.src=msg.profilePic || "https://avatars.dicebear.com/api/identicon/"+encodeURIComponent(msg.username)+".svg";
  row.appendChild(avatar);

  const bubble=document.createElement('div'); bubble.className='bubble';
  bubble.innerHTML=`<div class="meta">${msg.username} <span class="time">${new Date(msg.ts).toLocaleTimeString()}</span></div>`;
  if(msg.type==='image') bubble.innerHTML+=`<img src="${msg.text}" class="chat-img"/>`; else bubble.innerHTML+=`<div>${msg.text}</div>`;
  const reactionsDiv=document.createElement('div'); reactionsDiv.className='reactions'; bubble.appendChild(reactionsDiv);
  row.appendChild(bubble); messagesEl.appendChild(row); messagesEl.scrollTop=messagesEl.scrollHeight;
  renderReactions(id,msg);
}

function updateMessage(id,msg){ renderReactions(id,msg); }
async function toggleReaction(msgId,emoji,prev){
  const reactRef=ref(db,`messages/${msgId}/reactions/${currentUser.uid}`);
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
    btn.onclick=()=>toggleReaction(id,em,myReaction); reactionsDiv.appendChild(btn);
  });
}

// Settings panel toggle
menuBtn.onclick=()=>settingsPanel.classList.toggle('active');
logoutBtn.onclick=async()=>{ await signOut(auth); location.href="../Login/login.html"; }

// Update profile
updateProfileBtn.onclick=async()=>{
  try{
    if(newName.value) await updateProfile(currentUser,{displayName:newName.value});
    if(newEmail.value) await updateEmail(currentUser,newEmail.value);
    if(newPass.value) await updatePassword(currentUser,newPass.value);
    if(profilePicInput.files[0]){
      const file=profilePicInput.files[0];
      const storageRef=sRef(storage,'profilePics/'+currentUser.uid);
      await uploadBytes(storageRef,file);
      const url=await getDownloadURL(storageRef);
      await updateProfile(currentUser,{photoURL:url});
    }
    notify("Profile updated ✅",'success');
  }catch(err){ notify(err.message,'error'); }
}
