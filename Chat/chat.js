import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, onChildChanged, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut, updateEmail, updatePassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

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

const overlay = document.getElementById('overlay');
const settingsModal = document.getElementById('settingsModal');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettings = document.getElementById('closeSettings');
const profilePicInput = document.getElementById('profilePicInput');
const profilePreview = document.getElementById('profilePreview');
const usernameInput = document.getElementById('usernameInput');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const saveSettings = document.getElementById('saveSettings');
const topOptions = document.getElementById('topOptions');
const openOptions = document.getElementById('openOptions');

let currentUser = null;
let pendingImage = null;
let pendingProfile = null;

// Auth check
onAuthStateChanged(auth, (user) => {
  if(!user) window.location.href="../Login";
  else{
    currentUser=user;
    document.getElementById("welcome").innerText="Welcome, "+(user.displayName||user.email);
    profilePreview.src = user.photoURL || 'https://avatars.dicebear.com/api/identicon/'+encodeURIComponent(user.uid)+'.svg';
    onChildAdded(ref(db,'messages'), snap=>renderMessage(snap.key,snap.val()));
    onChildChanged(ref(db,'messages'), snap=>updateMessage(snap.key,snap.val()));
  }
});

// Options btn toggle
openOptions.addEventListener('click',()=>{ topOptions.style.display = topOptions.style.display==='flex'?'none':'flex'; topOptions.style.flexDirection='column'; });

// Logout
document.getElementById('logoutBtn').addEventListener('click',async()=>{ await signOut(auth); window.location.href="../Login"; });

// Open/close settings
openSettingsBtn.addEventListener('click',()=>{ settingsModal.style.display='block'; overlay.style.display='block'; });
closeSettings.addEventListener('click',()=>{ settingsModal.style.display='none'; overlay.style.display='none'; });
overlay.addEventListener('click',()=>{ settingsModal.style.display='none'; overlay.style.display='none'; });

// Profile preview
profilePicInput.addEventListener('change',e=>{
  const file=e.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=ev=>{
    pendingProfile=ev.target.result;
    profilePreview.src=pendingProfile;
  }
  reader.readAsDataURL(file);
});

// Save settings
saveSettings.addEventListener('click', async ()=>{
  try{
    if(pendingProfile){
      await updateProfile(currentUser,{photoURL:pendingProfile});
      showNotification("Profile updated!");
      pendingProfile=null;
    }
    if(usernameInput.value) await updateProfile(currentUser,{displayName:usernameInput.value});
    if(emailInput.value) await updateEmail(currentUser,emailInput.value);
    if(passwordInput.value) await updatePassword(currentUser,passwordInput.value);
    showNotification("Settings saved!");
  }catch(err){ showNotification(err.message,true); }
});

// Emojis
const emojis=["😀","😁","😂","😍","😎","😢","😡","👍","🙏","🔥","❤️","🎉"];
emojis.forEach(e=>{
  const s=document.createElement('span'); s.textContent=e; s.onclick=()=>{ msgInput.value+=e; emojiPicker.style.display='none'; }; emojiPicker.appendChild(s);
});
emojiToggle.addEventListener('click',()=>{ emojiPicker.style.display=emojiPicker.style.display==='flex'?'none':'flex'; });

// Send message
async function sendMessage(){
  const text=msgInput.value.trim();
  if(!text && !pendingImage) return;
  const payload={uid:currentUser.uid,username:currentUser.displayName||currentUser.email,ts:Date.now()};
  if(pendingImage){ payload.type='image'; payload.text=pendingImage; pendingImage=null; imgPreview.style.display='none'; }
  else payload.type='text',payload.text=text;
  await push(ref(db,'messages'),payload);
  msgInput.value=''; fileInput.value='';
}
sendBtn.addEventListener('click',sendMessage);
msgInput.addEventListener('keydown',e=>{ if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); sendMessage(); }});

// Image upload
imgBtn.addEventListener('click',()=>fileInput.click());
fileInput.addEventListener('change',e=>{
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=ev=>{
    pendingImage=ev.target.result;
    imgPreview.innerHTML=`<img src="${pendingImage}" alt="preview"/>`; imgPreview.style.display='flex';
  }
  reader.readAsDataURL(file);
});

// Notification
function showNotification(msg,error=false){
  const n=document.createElement('div'); n.className='notify'; n.style.background=error?'#ff4d4d':'#00bfff'; n.textContent=msg;
  document.body.appendChild(n);
  setTimeout(()=>n.remove(),3000);
}

// Render messages
function renderMessage(id,msg){
  const row=document.createElement('div'); row.className='msg-row'; row.id='msg-'+id;
  const avatar=document.createElement('img'); avatar.className='avatar'; avatar.src=msg.photoURL||'https://avatars.dicebear.com/api/identicon/'+encodeURIComponent(msg.uid)+'.svg';
  row.appendChild(avatar);
  const bubble=document.createElement('div'); bubble.className='bubble';
  bubble.innerHTML=`<div class="meta">${msg.username} <span class="time">${new Date(msg.ts).toLocaleTimeString()}</span></div>`;
  if(msg.type==='image'){
    bubble.innerHTML+=`<img src="${msg.text}" class="chat-img"/>`;
  }else bubble.innerHTML+=`<div>${msg.text}</div>`;
  const reactionsDiv=document.createElement('div'); reactionsDiv.className='reactions'; bubble.appendChild(reactionsDiv);
  row.appendChild(bubble); messagesEl.appendChild(row); messagesEl.scrollTop=messagesEl.scrollHeight;
  renderReactions(id,msg);

  // Image full view
  if(msg.type==='image'){
    const img=row.querySelector('.chat-img');
    img.addEventListener('click',()=>{
      overlay.style.display='block';
      const modalImg=document.createElement('img');
      modalImg.src=msg.text;
      modalImg.style.maxWidth='90%'; modalImg.style.maxHeight='90%'; modalImg.style.borderRadius='10px';
      modalImg.id='fullViewImg';
      overlay.innerHTML=''; overlay.appendChild(modalImg);
      overlay.addEventListener('click',()=>{ overlay.style.display='none'; overlay.innerHTML=''; });
    });
  }
}

function updateMessage(id,msg){ renderReactions(id,msg); }

async function toggleReaction(msgId,emoji,prev){
  const reactRef = ref(db,`messages/${msgId}/reactions/${currentUser.uid}`);
  if(prev===emoji) await set(reactRef,null); else await set(reactRef,emoji);
}

function renderReactions(id,msg){
  const row=document.getElementById('msg-'+id); if(!row) return;
  const reactionsDiv=row.querySelector('.reactions'); reactionsDiv.innerHTML='';
  const reactions=msg.reactions||{}; let counts={}; let myReaction=null;
  for(const uid in reactions){ const em=reactions[uid]; if(!em) continue; counts[em]=(counts[em]||0)+1; if(uid===currentUser?.uid) myReaction=em; }
  ["👍","😂","❤️","🔥","😢","😡"].forEach(em=>{
    const btn=document.createElement('span'); btn.className='reaction-btn'; if(myReaction===em) btn.classList.add('you'); btn.textContent=counts[em]?`${em} ${counts[em]}`:em;
    btn.onclick=()=>toggleReaction(id,em,myReaction); reactionsDiv.appendChild(btn);
  });
}
