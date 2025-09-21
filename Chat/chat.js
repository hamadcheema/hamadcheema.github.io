import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// ✅ Firebase Config
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
const fileInput = document.getElementById('fileInput');
const imgBtn = document.getElementById('imgBtn');
const imgPreview = document.getElementById('imgPreview');
const logoutBtn = document.getElementById("logoutBtn");

let currentUser = null;
let pendingImage = null;

// ✅ Auth check
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "../Login/index.html";
  } else {
    currentUser = user;
    document.getElementById("welcome").innerText =
      "Welcome, " + (user.displayName || user.email);

    // Load messages
    onChildAdded(ref(db, 'messages'), (snap) => renderMessage(snap.key, snap.val()));
  }
});

// ✅ Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "../Login/index.html";
});

// ✅ Send message (Text + Image both allowed)
async function sendMessage() {
  const text = msgInput.value.trim();

  if (!text && !pendingImage) return;

  const payload = {
    uid: currentUser.uid,
    username: currentUser.displayName || currentUser.email,
    photoURL: currentUser.photoURL || null,
    ts: Date.now(),
    text: text || "",
    image: pendingImage || null
  };

  await push(ref(db, 'messages'), payload);

  msgInput.value = "";
  fileInput.value = "";
  imgPreview.style.display = "none";
  pendingImage = null;
}

sendBtn.addEventListener('click', sendMessage);
msgInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// ✅ Image select preview
imgBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    pendingImage = ev.target.result;
    imgPreview.innerHTML = `<img src="${pendingImage}" alt="preview" style="max-width:120px;border-radius:8px"/>`;
    imgPreview.style.display = "block";
  };
  reader.readAsDataURL(file);
});

// ✅ Render message
function renderMessage(id, msg) {
  const row = document.createElement('div');
  row.className = 'msg-row';
  row.id = 'msg-' + id;

  const avatar = document.createElement('img');
  avatar.className = 'avatar';

  // 🔹 Avatar logic
  if (msg.photoURL) {
    avatar.src = msg.photoURL;
  } else {
    avatar.src = "https://avatars.dicebear.com/api/identicon/" + encodeURIComponent(msg.username) + ".svg";
  }

  row.appendChild(avatar);

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = `
    <div class="meta">
      ${msg.username} 
      <span class="time">${new Date(msg.ts).toLocaleTimeString()}</span>
    </div>
  `;

  // 🔹 Show text (if any)
  if (msg.text) {
    bubble.innerHTML += `<div>${msg.text}</div>`;
  }

  // 🔹 Show image (if any)
  if (msg.image) {
    const imgEl = document.createElement("img");
    imgEl.src = msg.image;
    imgEl.className = "chat-img";
    imgEl.style.cursor = "pointer";

    // Full screen view
    imgEl.onclick = () => openImageFullscreen(msg.image);

    bubble.appendChild(imgEl);
  }

  row.appendChild(bubble);
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ✅ Fullscreen image viewer
function openImageFullscreen(src) {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.9)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = 9999;

  const img = document.createElement("img");
  img.src = src;
  img.style.maxWidth = "90%";
  img.style.maxHeight = "90%";
  img.style.borderRadius = "10px";

  const closeBtn = document.createElement("span");
  closeBtn.innerText = "✖";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "20px";
  closeBtn.style.right = "30px";
  closeBtn.style.fontSize = "30px";
  closeBtn.style.color = "#fff";
  closeBtn.style.cursor = "pointer";
  closeBtn.onclick = () => document.body.removeChild(overlay);

  overlay.appendChild(img);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);
}
