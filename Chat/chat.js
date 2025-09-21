import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, onChildChanged, set, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
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

// DOM Elements
const messagesEl = document.getElementById('messages');
const msgInput = document.getElementById('msgInput');
const sendBtn = document.getElementById('sendBtn');
const emojiToggle = document.getElementById('emojiToggle');
const emojiPicker = document.getElementById('emojiPicker');
const fileInput = document.getElementById('fileInput');
const imgBtn = document.getElementById('imgBtn');
const imgPreview = document.getElementById('imgPreview');

const fullScreenOverlay = document.getElementById('fullScreenOverlay');
const fullScreenImg = fullScreenOverlay.querySelector('img');
const closeFullScreen = document.getElementById('closeFullScreen');

const settingsPanel = document.getElementById('settingsPanel');
const topMenu = document.getElementById('topMenu');
const profilePicInput = document.getElementById('profilePicInput');
const profilePreview = document.getElementById('profilePreview');
const usernameInput = document.getElementById('usernameInput');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const logoutBtn = document.getElementById('logoutBtn');

let currentUser = null;
let pendingImage = null;
let pendingProfilePic = null;

// Emojis
const emojis = ["😀","😁","😂","😍","😎","😢","😡","👍","🙏","🔥","❤️","🎉"];
emojis.forEach(e=>{
  const s = document.createElement('span');
  s.textContent = e;
  s.onclick = ()=>{ msgInput.value += e; emojiPicker.style.display='none'; };
  emojiPicker.appendChild(s);
});
emojiToggle.addEventListener('click', ()=> {
  emojiPicker.style.display = emojiPicker.style.display==='flex'?'none':'flex';
});

// Auth check
onAuthStateChanged(auth, async (user) => {
  if(!user) window.location.href="../Login";
  else {
    currentUser = user;
    document.getElementById("welcome").innerText = "Welcome, "+(user.displayName||user.email);

    // Load user profile pic from database if exists
    const profileRef = ref(db, 'users/'+user.uid+'/profilePic');
    const snapshot = await get(profileRef);
    if(snapshot.exists()) profilePreview.innerHTML = `<img src="${snapshot.val()}" alt="profile"/>`;

    usernameInput.value = user.displayName||'';
    emailInput.value = user.email||'';

    // Load messages
    onChildAdded(ref(db,'messages'), snap=>renderMessage(snap.key,snap.val()));
    onChildChanged(ref(db,'messages'), snap=>updateMessage(snap.key,snap.val()));
  }
});

// Send message
async function sendMessage(){
  const text = msgInput.value.trim();
  if(!text && !pendingImage) return;

  const payload = {
    uid: currentUser.uid,
    username: currentUser.displayName || currentUser.email,
    ts: Date.now()
  };

  if(pendingImage){
    payload.type='image';
    payload.text=pendingImage;
    pendingImage=null;
    imgPreview.style.display='none';
  } else {
    payload.type='text';
    payload.text=text;
  }
  await push(ref(db,'messages'), payload);
  msgInput.value='';
  fileInput.value='';
}

sendBtn.addEventListener('click',sendMessage);
msgInput.addEventListener('keydown',(e)=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}});

// Upload message image
imgBtn.addEventListener('click',()=>fileInput.click());
fileInput.addEventListener('change', e=>{
  const file=e.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=ev=>{
    pendingImage=ev.target.result;
    imgPreview.innerHTML=`<img src="${pendingImage}" alt="preview"/>`;
    imgPreview.style.display='block';
  };
  reader.readAsDataURL(file);
});

// Render message
function renderMessage(id,msg){
  const row=document.createElement('div');
  row.className='msg-row';
  row.id='msg-'+id;

  // avatar
  const avatar=document.createElement('img');
  avatar.className='avatar';
  avatar.src=msg.profilePic || `https://avatars.dicebear.com/api/identicon/${encodeURIComponent(msg.username)}.svg`;
  row.appendChild(avatar);

  const bubble=document.createElement('div');
  bubble.className='bubble';
  bubble.innerHTML=`<div class="meta">${msg.username} <span class="time">${new Date(msg.ts).toLocaleTimeString()}</span></div>`;

  if(msg.type==='image'){
    bubble.innerHTML+=`<img src="${msg.text}" class="chat-img"/>`;
  } else {
    bubble.innerHTML+=`<div>${msg.text}</div>`;
  }

  const reactionsDiv=document.createElement('div');
  reactionsDiv.className='reactions';
  bubble.appendChild(reactionsDiv);

  row.appendChild(bubble);
  messagesEl.appendChild(row);
  messagesEl.scrollTop=messagesEl.scrollHeight;

  renderReactions(id,msg);

  // Full screen image
  if(msg.type==='image'){
    bubble.querySelector('.chat-img').onclick=()=>{
      fullScreenImg.src=msg.text;
      fullScreenOverlay.style.display='flex';
    };
  }
}

closeFullScreen.onclick=()=>{fullScreenOverlay.style.display='none';};

// Reactions
async function toggleReaction(msgId, emoji, prev){
  const reactRef = ref(db,`messages/${msgId}/reactions/${currentUser.uid}`);
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
  for(const uid in reactions){
    const em=reactions[uid]; if(!em) continue;
    counts[em]=(counts[em]||0)+1;
    if(uid===currentUser?.uid) myReaction=em;
  }
  ["👍","😂","❤️","🔥","😢","😡"].forEach(em=>{
    const btn=document.createElement('span');
    btn.className='reaction-btn'; if(myReaction===em) btn.classList.add('you');
    btn.textContent=counts[em]?`${em} ${counts[em]}`:em;
    btn.onclick=()=>toggleReaction(id,em,myReaction);
    reactionsDiv.appendChild(btn);
  });
}

// Top menu toggle
topMenu.onclick=()=>{settingsPanel.classList.toggle('open');};

// Profile pic upload preview
profilePicInput.addEventListener('change', e=>{
  const file=e.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=ev=>{
    pendingProfilePic=ev.target.result;
    profilePreview.innerHTML=`<img src="${pendingProfilePic}" alt="preview"/>`;
    profilePreview.style.display='block';
  };
  reader.readAsDataURL(file);
});

// Save settings
saveSettingsBtn.onclick=async ()=>{
  if(pendingProfilePic){
    const storageRef = sRef(storage, 'profilePics/'+currentUser.uid+'.png');
    const imgBlob = await fetch(pendingProfilePic).then(r=>r.blob());
    await uploadBytes(storageRef,imgBlob);
    const url = await getDownloadURL(storageRef);
    await updateProfile(currentUser,{photoURL:url});
    await set(ref(db,'users/'+currentUser.uid+'/profilePic'),url);
    pendingProfilePic=null;
  }

  if(usernameInput.value && usernameInput.value!==currentUser.displayName){
    await updateProfile(currentUser,{displayName:usernameInput.value});
  }
  if(emailInput.value && emailInput.value!==currentUser.email){
    try{await updateEmail(currentUser,emailInput.value);}catch(err){alert(err.message);}
  }
  if(passwordInput.value){
    try{await updatePassword(currentUser,passwordInput.value);}catch(err){alert(err.message);}
  }

  alert('✅ Settings updated');
  settingsPanel.classList.remove('open');
};

// Logout
logoutBtn.onclick=async()=>{
  await signOut(auth);
  window.location.href="../Login";
};

// Send message with profile pic
sendBtn.addEventListener('click', async ()=>{
  if(!currentUser) return;
  const userSnap = await get(ref(db,'users/'+currentUser.uid));
  const profilePic = userSnap.exists()?userSnap.val().profilePic:null;
});
