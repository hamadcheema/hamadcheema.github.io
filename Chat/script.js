import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Firebase
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

// DOM
const messagesEl = document.getElementById('messages');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const emojiToggle = document.getElementById('emojiToggle');
const emojiPicker = document.getElementById('emojiPicker');
const fileInput = document.getElementById('fileInput');
const imgBtn = document.getElementById('imgBtn');
const imgPreview = document.getElementById('imgPreview');
const menuBtn = document.querySelector('.menu-btn');
const menuPanel = document.querySelector('.menu-panel');
const logoutBtn = document.getElementById('logoutBtn');

let currentUser = null;
let pendingImage = null;

// Emoji
const emojis = ["😀","😁","😂","😍","😎","😢","😡","👍","🙏","🔥","❤️","🎉"];
emojis.forEach(e=>{
  const span = document.createElement('span'); span.textContent = e;
  span.addEventListener('click', ()=> { msgInput.value += e; emojiPicker.classList.remove('show'); });
  emojiPicker.appendChild(span);
});
emojiToggle.addEventListener('click', ()=> emojiPicker.classList.toggle('show'));

// Menu
menuBtn.addEventListener('click', ()=> menuPanel.style.display = menuPanel.style.display==='flex'?'none':'flex');

// Logout
logoutBtn.addEventListener('click', async()=>{ await signOut(auth); window.location.href="../Login"; });

// Auth
onAuthStateChanged(auth,user=>{
  if(!user) window.location.href="../Login";
  else currentUser = user;
  
  onChildAdded(ref(db,'messages'), snap=>renderMessage(snap.key,snap.val()));
});

// Image preview
imgBtn.addEventListener('click', ()=> fileInput.click());
fileInput.addEventListener('change', e=>{
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    pendingImage = ev.target.result;
    imgPreview.style.display='block';
    imgPreview.innerHTML = `<img src="${pendingImage}" alt="preview"/>`;
  };
  reader.readAsDataURL(file);
});

// Send message (text or image only)
async function sendMessage(){
  const text = msgInput.value.trim();
  if(!text && !pendingImage) return;

  const payload = {
    uid: currentUser.uid,
    username: currentUser.displayName || currentUser.email,
    ts: Date.now()
  };
  if(pendingImage){ payload.type='image'; payload.text=pendingImage; pendingImage=null; imgPreview.style.display='none'; }
  else{ payload.type='text'; payload.text=text; }

  await push(ref(db,'messages'), payload);
  msgInput.value='';
}
sendBtn.addEventListener('click', sendMessage);
msgInput.addEventListener('keydown', e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); } });

// Render messages
function renderMessage(id,msg){
  const row = document.createElement('div'); row.className='msg-row slide-in';
  const avatar = document.createElement('img'); avatar.className='avatar';
  avatar.src = `https://avatars.dicebear.com/api/identicon/${encodeURIComponent(msg.username)}.svg`;
  row.appendChild(avatar);

  const bubble = document.createElement('div'); bubble.className='bubble';
  bubble.innerHTML = `<div class="meta">${msg.username} <span class="time">${new Date(msg.ts).toLocaleTimeString()}</span></div>`;
  if(msg.type==='image'){ bubble.innerHTML += `<img src="${msg.text}" class="chat-img"/>`; }
  else{ bubble.innerHTML += `<div>${msg.text}</div>`; }

  row.appendChild(bubble);
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  // Image modal
  if(msg.type==='image'){ 
    bubble.querySelector('.chat-img').addEventListener('click', ()=>{
      const modal = document.createElement('div');
      modal.style.cssText="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;justify-content:center;align-items:center;z-index:1000;";
      modal.innerHTML = `<img src="${msg.text}" style="max-width:90%;max-height:90%;border-radius:8px;"><span style="position:absolute;top:20px;right:30px;font-size:30px;color:#fff;cursor:pointer;">&times;</span>`;
      document.body.appendChild(modal);
      modal.querySelector('span').addEventListener('click', ()=> modal.remove());
    });
  }
}
