import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, onChildChanged, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

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

const messagesEl = document.getElementById('messages');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const fileInput = document.getElementById('fileInput');
const imgBtn = document.getElementById('imgBtn');
const imgPreview = document.getElementById('imgPreview');

const menuBtn = document.getElementById('menuBtn');
const menuPanel = document.getElementById('menuPanel');
const logoutBtn = document.getElementById('logoutBtn');

const replyPreview = document.getElementById('replyPreview');
const replyTextEl = document.getElementById('replyText');
const cancelReplyBtn = document.getElementById('cancelReply');
let replyToId = null;

let currentUser = null;
let pendingImage = null;

// Auth
onAuthStateChanged(auth, user=>{
  if(!user) window.location.href="../Login";
  else{
    currentUser=user;
    document.getElementById("welcome").innerText = "Welcome, "+(user.displayName||user.email);
    onChildAdded(ref(db,'messages'), snap=>renderMessage(snap.key,snap.val()));
    onChildChanged(ref(db,'messages'), snap=>updateMessage(snap.key,snap.val()));
  }
});

// Menu toggle
menuBtn.onclick = ()=>{menuPanel.style.display=menuPanel.style.display==='flex'?'none':'flex';};
logoutBtn.onclick = async()=>{await signOut(auth); window.location.href="../Login";};

// Cancel reply
cancelReplyBtn.onclick = ()=>{replyToId=null; replyPreview.style.display='none';};

// Image selection
imgBtn.onclick=()=>fileInput.click();
fileInput.onchange = e=>{
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ev=>{
    pendingImage = ev.target.result;
    imgPreview.innerHTML = `<img src="${pendingImage}" alt="preview"/>`;
    imgPreview.style.display='block';
  }
  reader.readAsDataURL(file);
}

// Send message
sendBtn.onclick = sendMessage;
msgInput.addEventListener('keydown', e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault(); sendMessage();}});

async function sendMessage(){
  const text = msgInput.value.trim();
  if(!text && !pendingImage) return;

  const payload = {
    uid: currentUser.uid,
    username: currentUser.displayName||currentUser.email,
    ts: Date.now(),
    text: text||"",
    img: pendingImage||null,
    replyTo: replyToId || null,
    reactions:{}
  };
  await push(ref(db,'messages'),payload);
  msgInput.value=''; pendingImage=null; imgPreview.style.display='none';
  replyToId=null; replyPreview.style.display='none';
}

// Render messages
function renderMessage(id,msg){
  const row = document.createElement('div'); row.className='msg-row';
  if(msg.uid===currentUser.uid) row.classList.add('self');

  const avatar = document.createElement('img'); avatar.className='avatar';
  avatar.src = msg.photoURL || `https://avatars.dicebear.com/api/identicon/${encodeURIComponent(msg.username)}.svg`;
  row.appendChild(avatar);

  const bubble = document.createElement('div'); bubble.className='bubble';
  bubble.innerHTML=`<div class="meta">${msg.username} <span class="time">${new Date(msg.ts).toLocaleTimeString()}</span></div>`;
  if(msg.replyTo){
    const replyDiv = document.createElement('div'); replyDiv.style.fontSize='12px'; replyDiv.style.color='#555';
    replyDiv.textContent = "Replying...";
    bubble.appendChild(replyDiv);
  }
  if(msg.img) bubble.innerHTML += `<img src="${msg.img}" class="chat-img"/>`;
  if(msg.text) bubble.innerHTML += `<div>${msg.text}</div>`;
  row.appendChild(bubble);

  addReactions(bubble,id);
  addReplyFeature(bubble,id,msg.text);

  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  if(msg.img){
    bubble.querySelector('.chat-img').addEventListener('click', ()=>{
      const modal=document.createElement('div');
      modal.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;justify-content:center;align-items:center;z-index:1000;";
      modal.innerHTML=`<img src="${msg.img}" style="max-width:90%;max-height:90%;border-radius:8px;"><span style="position:absolute;top:20px;right:30px;font-size:30px;color:#fff;cursor:pointer;">&times;</span>`;
      document.body.appendChild(modal);
      modal.querySelector('span').addEventListener('click', ()=>modal.remove());
    });
  }
}

// Reactions
const emojiList = ["👍","😂","❤️","🔥","😢","😡"];
function addReactions(bubble,msgId){
  const reactDiv = document.createElement('div'); reactDiv.className='reactions';
  emojiList.forEach(emoji=>{
    const btn = document.createElement('span'); btn.className='reaction-btn'; btn.textContent = emoji;
    btn.addEventListener('click', async()=>{
      const reactRef = ref(db, `messages/${msgId}/reactions/${currentUser.uid}`);
      await set(reactRef, emoji);
    });
    reactDiv.appendChild(btn);
  });
  bubble.appendChild(reactDiv);
}

// Reply button
function addReplyFeature(bubble,msgId,msgText){
  const replyBtn = document.createElement('span'); replyBtn.textContent='Reply';
  replyBtn.style.fontSize='12px'; replyBtn.style.marginLeft='8px'; replyBtn.style.cursor='pointer';
  replyBtn.addEventListener('click', ()=>{
    replyToId = msgId;
    replyPreview.style.display='flex';
    replyTextEl.textContent = msgText;
    msgInput.focus();
  });
  bubble.appendChild(replyBtn);
}

// Update message
function updateMessage(id,msg){ /* For reactions update */ }
