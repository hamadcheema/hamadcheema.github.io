import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, onChildChanged, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut, updateEmail, updatePassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getStorage, ref as sRef, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

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

const messagesEl = document.getElementById('messages');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const emojiToggle = document.getElementById('emojiToggle');
const emojiPicker = document.getElementById('emojiPicker');
const fileInput = document.getElementById('fileInput');
const imgBtn = document.getElementById('imgBtn');
const imgPreview = document.getElementById('imgPreview');

const menuBtn=document.querySelector('.menu-btn');
const menuPanel=document.querySelector('.menu-panel');
const logoutBtn=document.getElementById('logoutBtn');
const menuSettingsBtn=document.getElementById('menuSettingsBtn');
const settingsPanel=document.getElementById('settingsPanel');
const newName=document.getElementById('newName');
const newEmail=document.getElementById('newEmail');
const newPass=document.getElementById('newPass');
const updateBtn=document.getElementById('updateBtn');
const closeSettings=document.getElementById('closeSettings');
const profilePicInput=document.getElementById('profilePicInput');

let currentUser=null;
let pendingImage=null;

// Auth check
onAuthStateChanged(auth,user=>{
  if(!user) window.location.href="../Login/index.html";
  else{
    currentUser=user;
    document.getElementById("welcome").innerText="Welcome, "+(user.displayName||user.email);
    onChildAdded(ref(db,'messages'),snap=>renderMessage(snap.key,snap.val()));
    onChildChanged(ref(db,'messages'),snap=>updateMessage(snap.key,snap.val()));
  }
});

// Notifications
function notify(msg,type='success'){
  const n=document.createElement('div');
  n.className=`notification ${type}`;
  n.textContent=msg;
  document.body.appendChild(n);
  setTimeout(()=>n.remove(),3000);
}

// Menu toggle
menuBtn.onclick=()=>{ menuPanel.style.display=menuPanel.style.display==='flex'?'none':'flex'; }
menuSettingsBtn.onclick=()=>{
  menuPanel.style.display='none';
  settingsPanel.style.display='block';
}
closeSettings.onclick=()=>{ settingsPanel.style.display='none'; }
logoutBtn.onclick=async()=>{ await signOut(auth); window.location.href="../Login/index.html"; }

// Profile Update
updateBtn.onclick=async()=>{
  try{
    if(newName.value) await updateProfile(currentUser,{displayName:newName.value});
    if(newEmail.value) await updateEmail(currentUser,newEmail.value);
    if(newPass.value) await updatePassword(currentUser,newPass.value);
    if(profilePicInput.files[0]){
      const file=profilePicInput.files[0];
      const storageRef=sRef(storage,'profilePics/'+currentUser.uid);
      const reader=new FileReader();
      reader.onload=async e=>{
        await uploadString(storageRef,e.target.result,'data_url');
        const url=await getDownloadURL(storageRef);
        await updateProfile(currentUser,{photoURL:url});
        notify("Profile pic updated ✅");
      };
      reader.readAsDataURL(file);
    }
    notify("Profile updated ✅");
  }catch(err){ notify(err.message,'error'); }
};

// Emojis
const emojis=["😀","😁","😂","😍","😎","😢","😡","👍","🙏","🔥","❤️","🎉"];
emojis.forEach(e=>{
  const s=document.createElement('span');
  s.textContent=e;
  s.onclick=()=>{ msgInput.value+=e; emojiPicker.classList.remove('show'); }
  emojiPicker.appendChild(s);
});
emojiToggle.onclick=()=>{ emojiPicker.classList.toggle('show'); }

// Send message
async function sendMessage(){
  const text=msgInput.value.trim();
  if(!text && !pendingImage) return;
  const payload={uid:currentUser.uid,username:currentUser.displayName||currentUser.email,ts:Date.now()};
  if(pendingImage){ payload.type='image'; payload.text=pendingImage; pendingImage=null; imgPreview.style.display='none'; }
  else payload.type='text',payload.text=text;
  await push(ref(db,'messages'),payload);
  msgInput.value='';
  fileInput.value='';
}
sendBtn.onclick=sendMessage;
msgInput.addEventListener('keydown',e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); }});

// Image upload preview
imgBtn.onclick=()=>fileInput.click();
fileInput.addEventListener('change',e=>{
  const file=e.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=ev=>{ pendingImage=ev.target.result; imgPreview.innerHTML=`<img src="${pendingImage}">`; imgPreview.style.display='block'; }
  reader.readAsDataURL(file);
});

// Render messages
function renderMessage(id,msg){
  const row=document.createElement('div'); row.className='msg-row'; row.id='msg-'+id;
  setTimeout(()=>row.classList.add('slide-in'),50);

  const avatar=document.createElement('img'); avatar.className='avatar'; avatar.src=msg.photoURL||"https://avatars.dicebear.com/api/identicon/"+encodeURIComponent(msg.username)+".svg"; row.appendChild(avatar);

  const bubble=document.createElement('div'); bubble.className='bubble';
  bubble.innerHTML=`<div class="meta">${msg.username} <span class="time">${new Date(msg.ts).toLocaleTimeString()}</span></div>`;
  if(msg.type==='image'){ bubble.innerHTML+=`<img src="${msg.text}" class="chat-img">`; }
  else bubble.innerHTML+=`<div>${msg.text}</div>`;
  const reactionsDiv=document.createElement('div'); reactionsDiv.className='reactions'; bubble.appendChild(reactionsDiv);
  row.appendChild(bubble);
  messagesEl.appendChild(row); messagesEl.scrollTop=messagesEl.scrollHeight;
  renderReactions(id,msg);
}

function updateMessage(id,msg){ renderReactions(id,msg); }

async function toggleReaction(msgId,emoji,prev){
  const reactRef=ref(db,`messages/${msgId}/reactions/${currentUser.uid}`);
  if(prev===emoji) await set(reactRef,null);
  else await set(reactRef,emoji);
}

function renderReactions(id,msg){
  const row=document.getElementById('msg-'+id);
  if(!row) return;
  const reactionsDiv=row.querySelector('.reactions');
  reactionsDiv.innerHTML='';
  const reactions=msg.reactions||{};
  const counts={}; let myReaction=null;
  for(const uid in reactions){ const em=reactions[uid]; if(!em) continue;
    counts[em]=(counts[em]||0)+1; if(uid===currentUser?.uid) myReaction=em; }
  ["👍","😂","❤️","🔥","😢","😡"].forEach(em=>{
    const btn=document.createElement('span'); btn.className='reaction-btn'; if(myReaction===em) btn.classList.add('you');
    btn.textContent=counts[em]?`${em} ${counts[em]}`:em;
    btn.onclick=()=>toggleReaction(id,em,myReaction);
    reactionsDiv.appendChild(btn);
  });
}
