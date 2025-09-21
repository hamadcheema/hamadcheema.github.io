import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, updateEmail, updatePassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, onChildChanged, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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
const banner = document.getElementById('banner');

let currentUser = null;
let pendingImage = null;

function showBanner(msg,type='success'){
  banner.textContent=msg; banner.className=`banner ${type} show`;
  setTimeout(()=> banner.className='banner',3000);
}

onAuthStateChanged(auth, (user)=>{
  if(!user) window.location.href="../Login/";
  else {
    currentUser=user;
    document.getElementById("welcome").innerText="Welcome, "+(user.displayName||user.email);
    onChildAdded(ref(db,'messages'),snap=>renderMessage(snap.key,snap.val()));
    onChildChanged(ref(db,'messages'),snap=>updateMessage(snap.key,snap.val()));
  }
});

sendBtn.addEventListener('click', sendMessage);
msgInput.addEventListener("keydown", (e) => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();} });

imgBtn.addEventListener('click',()=> fileInput.click());
fileInput.addEventListener('change', e=>{
  const file=e.target.files[0]; if(!file) return;
  const reader=new FileReader();
  reader.onload=ev=>{ pendingImage=ev.target.result; imgPreview.innerHTML=`<img src="${pendingImage}" alt="preview"/>`; imgPreview.style.display='block'; };
  reader.readAsDataURL(file);
});

const emojis = ["😀","😁","😂","😍","😎","😢","😡","👍","🙏","🔥","❤️","🎉"];
emojis.forEach(e=>{ const s=document.createElement('span'); s.textContent=e; s.onclick=()=>{msgInput.value+=e; emojiPicker.style.display='none'}; emojiPicker.appendChild(s); });
emojiToggle.addEventListener('click', ()=>{emojiPicker.style.display=emojiPicker.style.display==='flex'?'none':'flex';});

async function sendMessage(){
  const text = msgInput.value.trim();
  if(!text && !pendingImage) return;
  const payload={uid:currentUser.uid,username:currentUser.displayName||currentUser.email,ts:Date.now()};
  if(pendingImage){ payload.type='image'; payload.text=pendingImage; pendingImage=null; imgPreview.style.display='none'; }
  else payload.type='text'; payload.text=text;
  await push(ref(db,'messages'),payload);
  msgInput.value=''; fileInput.value='';
}

function renderMessage(id,msg){
  const row=document.createElement('div'); row.className='msg-row'; row.id='msg-'+id;
  const avatar=document.createElement('img'); avatar.className='avatar'; avatar.src="https://avatars.dicebear.com/api/identicon/"+encodeURIComponent(msg.username)+".svg"; row.appendChild(avatar);
  const bubble=document.createElement('div'); bubble.className='bubble';
  bubble.innerHTML=`<div class="meta">${msg.username} <span class="time">${new Date(msg.ts).toLocaleTimeString()}</span></div>`;
  if(msg.type==='image') bubble.innerHTML+=`<img src="${msg.text}" class="chat-img"/>`; else bubble.innerHTML+=`<div>${msg.text}</div>`;
  const reactionsDiv=document.createElement('div'); reactionsDiv.className='reactions'; bubble.appendChild(reactionsDiv); row.appendChild(bubble);
  messagesEl.appendChild(row); messagesEl.scrollTop=messagesEl.scrollHeight;
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
  const reactions=msg.reactions||{}; let counts={},myReaction=null;
  for(const uid in reactions){ const em=reactions[uid]; if(!em) continue; counts[em]=(counts[em]||0)+1; if(uid===currentUser.uid) myReaction=em; }
  ["👍","😂","❤️","🔥","😢","😡"].forEach(em=>{ const btn=document.createElement('span'); btn.className='reaction-btn'; if(myReaction===em) btn.classList.add('you'); btn.textContent=counts[em]?`${em} ${counts[em]}`:em; btn.onclick=()=>toggleReaction(id,em,myReaction); reactionsDiv.appendChild(btn); });
}

// Settings modal
const settingsModal = document.getElementById('settingsModal');
document.getElementById('settingsBtn').addEventListener('click', ()=> settingsModal.style.display='flex');
document.getElementById('closeSettings').addEventListener('click', ()=> settingsModal.style.display='none');
document.getElementById('logoutBtn').addEventListener('click', async ()=> { await signOut(auth); window.location.href="../Login/"; });

document.getElementById('changeName').addEventListener('click', async ()=>{
  const name=prompt("Enter new display name:");
  if(name){ await updateProfile(currentUser,{displayName:name}); showBanner("Name updated!"); }
});
document.getElementById('changeEmail').addEventListener('click', async ()=>{
  const email=prompt("Enter new email:");
  if(email){ try{ await updateEmail(currentUser,email); showBanner("Email updated!"); }catch(err){ showBanner(err.message,'error'); } }
});
document.getElementById('changePassword').addEventListener('click', async ()=>{
  const pass=prompt("Enter new password:");
  if(pass){ try{ await updatePassword(currentUser,pass); showBanner("Password updated!"); }catch(err){ showBanner(err.message,'error'); } }
});
document.getElementById('uploadPic').addEventListener('click', ()=>{
  const fileInput=document.createElement('input'); fileInput.type='file'; fileInput.accept='image/*'; fileInput.click();
  fileInput.onchange=e=>{
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader(); reader.onload=ev=>{
      updateProfile(currentUser,{photoURL:ev.target.result});
      showBanner("Profile picture updated!");
    }; reader.readAsDataURL(file);
  };
});
