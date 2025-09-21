import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, onChildChanged, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut, updateEmail, updatePassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js";

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

const messagesEl = document.getElementById('messages');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const emojiToggle = document.getElementById('emojiToggle');
const emojiPicker = document.getElementById('emojiPicker');
const fileInput = document.getElementById('fileInput');
const imgBtn = document.getElementById('imgBtn');
const imgPreview = document.getElementById('imgPreview');
const notify = document.getElementById('notify');

const menuBtn = document.getElementById('menuBtn');
const settingsPanel = document.getElementById('settingsPanel');
const closeSettings = document.getElementById('closeSettings');
const logoutBtn = document.getElementById('logoutBtn');
const usernameInput = document.getElementById('usernameInput');
const changeNameBtn = document.getElementById('changeNameBtn');
const emailInput = document.getElementById('emailInput');
const changeEmailBtn = document.getElementById('changeEmailBtn');
const passwordInput = document.getElementById('passwordInput');
const changePasswordBtn = document.getElementById('changePasswordBtn');

const imgModal = document.getElementById('imgModal');
const modalImg = imgModal.querySelector('img');
const closeModal = document.getElementById('closeModal');

let currentUser = null;
let pendingImage = null;

// Notifications inside page
function showNotify(msg){
  notify.innerText = msg;
  notify.style.display="block";
  setTimeout(()=>notify.style.display="none",2500);
}

// Auth check
onAuthStateChanged(auth,user=>{
  if(!user) window.location.href="../Login";
  else{
    currentUser=user;
    document.getElementById("welcome").innerText = "Welcome, "+(user.displayName||user.email);
    usernameInput.value=user.displayName||"";
    emailInput.value=user.email;
    onChildAdded(ref(db,'messages'), snap=>renderMessage(snap.key,snap.val()));
    onChildChanged(ref(db,'messages'), snap=>updateMessage(snap.key,snap.val()));
  }
});

// Settings panel
menuBtn.onclick = ()=>{settingsPanel.style.display='block';};
closeSettings.onclick = ()=>{settingsPanel.style.display='none';};
logoutBtn.onclick=async()=>{await signOut(auth); window.location.href="../Login";};

// Name change
changeNameBtn.onclick=async()=>{
  const newName=usernameInput.value.trim();
  if(!newName)return showNotify("⚠️ Name empty");
  await updateProfile(currentUser,{displayName:newName});
  showNotify("✅ Name updated");
};

// Email change
changeEmailBtn.onclick=async()=>{
  const newEmail=emailInput.value.trim();
  if(!newEmail)return showNotify("⚠️ Email empty");
  try{await updateEmail(currentUser,newEmail); showNotify("✅ Email updated");}
  catch(err){showNotify("❌ "+err.message);}
};

// Password change
changePasswordBtn.onclick=async()=>{
  const newPass=passwordInput.value.trim();
  if(!newPass)return showNotify("⚠️ Password empty");
  try{await updatePassword(currentUser,newPass); showNotify("✅ Password updated");}
  catch(err){showNotify("❌ "+err.message);}
};

// Emojis
const emojis = ["😀","😁","😂","😍","😎","😢","😡","👍","🙏","🔥","❤️","🎉"];
emojis.forEach(e=>{
  const s=document.createElement('span'); s.textContent=e;
  s.onclick=()=>{msgInput.value+=e; emojiPicker.style.display='none';};
  emojiPicker.appendChild(s);
});
emojiToggle.onclick=()=>{emojiPicker.style.display=emojiPicker.style.display==='flex'?'none':'flex';};

// Send message (image + text allowed)
async function sendMessage(){
  const text=msgInput.value.trim();
  if(!text && !pendingImage)return;
  let imageUrl=null;
  if(pendingImage){
    const file=fileInput.files[0];
    const storageRef=sRef(storage,'chatImages/'+Date.now()+'_'+file.name);
    await uploadBytes(storageRef,file);
    imageUrl=await getDownloadURL(storageRef);
  }
  const payload={
    uid:currentUser.uid,
    username:currentUser.displayName||currentUser.email,
    ts:Date.now(),
    type:'text',
    text:text,
    photoURL:currentUser.photoURL||null,
    image:imageUrl||null
  };
  await push(ref(db,'messages'),payload);
  msgInput.value=''; fileInput.value=''; imgPreview.style.display='none'; pendingImage=null;
}
sendBtn.onclick=sendMessage;
msgInput.addEventListener('keydown', e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}});

// Image select
imgBtn.onclick=()=>fileInput.click();
fileInput.onchange=e=>{
  const file=e.target.files[0]; if(!file)return;
  pendingImage=file;
  const reader=new FileReader();
  reader.onload=ev=>{imgPreview.innerHTML=`<img src="${ev.target.result}" alt="preview"/>`; imgPreview.style.display='block';};
  reader.readAsDataURL(file);
};

// Render messages
function renderMessage(id,msg){
  const row=document.createElement('div'); row.className='msg-row'; row.id='msg-'+id;
  const avatar=document.createElement('img'); avatar.className='avatar';
  avatar.src=msg.photoURL||"https://avatars.dicebear.com/api/identicon/"+encodeURIComponent(msg.username)+".svg";
  row.appendChild(avatar);

  const bubble=document.createElement('div'); bubble.className='bubble';
  bubble.innerHTML=`<div class="meta">${msg.username} <span class="time">${new Date(msg.ts).toLocaleTimeString()}</span></div>`;
  if(msg.text) bubble.innerHTML+=`<div>${msg.text}</div>`;
  if(msg.image) bubble.innerHTML+=`<img src="${msg.image}" class="chat-img"/>`;

  const reactionsDiv=document.createElement('div'); reactionsDiv.className='reactions';
  bubble.appendChild(reactionsDiv); row.appendChild(bubble); messagesEl.appendChild(row); messagesEl.scrollTop=messagesEl.scrollHeight;

  if(msg.image){
    const img=bubble.querySelector('img.chat-img');
    img.onclick=()=>{modalImg.src=img.src; imgModal.style.display='flex';};
  }
  renderReactions(id,msg);
}
closeModal.onclick=()=>{imgModal.style.display='none';};
function updateMessage(id,msg){renderReactions(id,msg);}

// Reactions
async function toggleReaction(msgId, emoji, prev){
  const reactRef=ref(db,`messages/${msgId}/reactions/${currentUser.uid}`);
  if(prev===emoji) await set(reactRef,null);
  else await set(reactRef,emoji);
}
function renderReactions(id,msg){
  const row=document.getElementById('msg-'+id); if(!row)return;
  const reactionsDiv=row.querySelector('.reactions'); reactionsDiv.innerHTML='';
  const reactions=msg.reactions||{}; const counts={}; let myReaction=null;
  for(const uid in reactions){ const em=reactions[uid]; if(!em) continue; counts[em]=(counts[em]||0)+1; if(uid===currentUser?.uid) myReaction=em;}
  ["👍","😂","❤️","🔥","😢","😡"].forEach(em=>{
    const btn=document.createElement('span'); btn.className='reaction-btn'; if(myReaction===em) btn.classList.add('you');
    btn.textContent=counts[em]?`${em} ${counts[em]}`:em; btn.onclick=()=>toggleReaction(id,em,myReaction); reactionsDiv.appendChild(btn);
  });
}
