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
const profilePicInput = document.getElementById('profilePicInput');
const profilePreview = document.getElementById('profilePreview');
const changeProfileBtn = document.getElementById('changeProfileBtn');

const imgModal = document.getElementById('imgModal');
const modalImg = imgModal.querySelector('img');
const closeModal = document.getElementById('closeModal');

let currentUser = null;
let pendingImage = null;

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

// Toggle settings panel
menuBtn.onclick = ()=>{settingsPanel.style.display='block';};
closeSettings.onclick = ()=>{settingsPanel.style.display='none';};

// Logout
logoutBtn.onclick=async()=>{await signOut(auth); window.location.href="../Login";};

// Change Name
changeNameBtn.onclick=async()=>{
  const newName=usernameInput.value.trim();
  if(!newName)return alert("Name cannot be empty");
  await updateProfile(currentUser,{displayName:newName});
  alert("✅ Name updated");
};

// Change Email
changeEmailBtn.onclick=async()=>{
  const newEmail=emailInput.value.trim();
  if(!newEmail)return alert("Email cannot be empty");
  try{await updateEmail(currentUser,newEmail); alert("✅ Email updated");}
  catch(err){alert("❌ "+err.message);}
};

// Change Password
changePasswordBtn.onclick=async()=>{
  const newPass=passwordInput.value.trim();
  if(!newPass)return alert("Password cannot be empty");
  try{await updatePassword(currentUser,newPass); alert("✅ Password updated");}
  catch(err){alert("❌ "+err.message);}
};

// Profile pic preview
profilePicInput.onchange=e=>{
  const file=e.target.files[0]; if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    profilePreview.innerHTML=`<img src="${ev.target.result}" alt="preview" style="max-width:100px; border-radius:50%;">`;
    profilePreview.style.display='block';
  };
  reader.readAsDataURL(file);
};

// Change Profile Pic
changeProfileBtn.onclick=async()=>{
  const file=profilePicInput.files[0]; if(!file)return alert("Select a file first");
  const storageRef=sRef(storage,'profilePics/'+currentUser.uid);
  await uploadBytes(storageRef,file);
  const url=await getDownloadURL(storageRef);
  await updateProfile(currentUser,{photoURL:url});
  alert("✅ Profile picture updated");
};

// Emojis
const emojis = ["😀","😁","😂","😍","😎","😢","😡","👍","🙏","🔥","❤️","🎉"];
emojis.forEach(e=>{
  const s=document.createElement('span'); s.textContent=e;
  s.onclick=()=>{msgInput.value+=e; emojiPicker.style.display='none';};
  emojiPicker.appendChild(s);
});
emojiToggle.onclick=()=>{emojiPicker.style.display=emojiPicker.style.display==='flex'?'none':'flex';};

// Send message
async function sendMessage(){
  const text=msgInput.value.trim();
  if(!text && !pendingImage)return;
  const payload={uid:currentUser.uid, username:currentUser.displayName||currentUser.email, ts:Date.now()};
  if(pendingImage){payload.type='image';payload.text=pendingImage; pendingImage=null; imgPreview.style.display='none';}
  else payload.type='text',payload.text=text;
  await push(ref(db,'messages'),payload);
  msgInput.value=''; fileInput.value='';
}
sendBtn.onclick=sendMessage;
msgInput.addEventListener('keydown', e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}});

// Image upload preview
imgBtn.onclick=()=>fileInput.click();
fileInput.onchange=e=>{
  const file=e.target.files[0]; if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{pendingImage=ev.target.result; imgPreview.innerHTML=`<img src="${pendingImage}" alt="preview"/>`; imgPreview.style.display='block';};
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
  if(msg.type==='image'){ bubble.innerHTML+=`<img src="${msg.text}" class="chat-img"/>`; }
  else{ bubble.innerHTML+=`<div>${msg.text}</div>`;}
  const reactionsDiv=document.createElement('div'); reactionsDiv.className='reactions';
  bubble.appendChild(reactionsDiv); row.appendChild(bubble); messagesEl.appendChild(row); messagesEl.scrollTop=messagesEl.scrollHeight;

  if(msg.type==='image'){
    const img=bubble.querySelector('img');
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
