// ----------------- Firebase Imports -----------------
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import {
  getDatabase,
  ref,
  push,
  onChildAdded
} from "firebase/database";
import {
  getStorage,
  ref as sRef,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

// ----------------- Firebase Config -----------------
const firebaseConfig = {
  apiKey: "AIzaSyBHQyKuiAgi831qANOkkWTNprdW1Pq6rbA",
  authDomain: "devchatbyhamad.firebaseapp.com",
  databaseURL: "https://devchatbyhamad-default-rtdb.firebaseio.com",
  projectId: "devchatbyhamad",
  storageBucket: "devchatbyhamad.appspot.com", // ✅ fixed
  messagingSenderId: "798871184058",
  appId: "1:798871184058:web:c735bea9756f8109149883",
  measurementId: "G-QTCCWC70QH"
};

// ----------------- Init -----------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// ----------------- Elements -----------------
const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const fileInput = document.getElementById("fileInput");
const imgBtn = document.getElementById("imgBtn");
const optionsBtn = document.getElementById("optionsBtn");
const optionsPanel = document.getElementById("optionsPanel");
const logoutBtn = document.getElementById("logoutBtn");

let currentUser = null;

// ----------------- Auth Listener -----------------
onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    loadMessages();
  } else {
    window.location = "login.html";
  }
});

// ----------------- Logout -----------------
logoutBtn.onclick = () => {
  signOut(auth);
};

// ----------------- Options toggle -----------------
optionsBtn.onclick = () => {
  optionsPanel.style.display =
    optionsPanel.style.display === "flex" ? "none" : "flex";
};

// ----------------- Send Msg -----------------
sendBtn.onclick = sendMessage;
inputEl.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

imgBtn.onclick = () => fileInput.click();

async function sendMessage() {
  const text = inputEl.value.trim();
  const file = fileInput.files[0];

  if (!text && !file) return;

  let imageUrl = null;

  // ✅ If file selected → upload to storage
  if (file) {
    const imgRef = sRef(
      storage,
      "chatImages/" + Date.now() + "-" + file.name
    );
    await uploadBytes(imgRef, file);
    imageUrl = await getDownloadURL(imgRef);
  }

  const msg = {
    uid: currentUser.uid,
    username: currentUser.displayName || "Guest",
    photoURL: currentUser.photoURL || null,
    ts: Date.now(),
    type: file ? "image" : "text",
    text: text || "",
    image: imageUrl
  };

  await push(ref(db, "messages"), msg);

  inputEl.value = "";
  fileInput.value = "";
}

// ----------------- Load Messages -----------------
function loadMessages() {
  const msgRef = ref(db, "messages");
  onChildAdded(msgRef, snap => {
    const msg = snap.val();
    renderMessage(snap.key, msg);
  });
}

// ----------------- Render -----------------
function renderMessage(id, msg) {
  const row = document.createElement("div");
  row.className = "msg-row show";
  row.id = "msg-" + id;

  // Avatar
  const avatar = document.createElement("img");
  avatar.className = "avatar";
  if (msg.photoURL) {
    avatar.src = msg.photoURL;
  } else {
    avatar.src =
      "https://avatars.dicebear.com/api/identicon/" +
      encodeURIComponent(msg.username || "user") +
      ".svg";
  }
  row.appendChild(avatar);

  // Bubble
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = `
    <div class="meta">
      ${msg.username || "Unknown"} 
      <span class="time">${new Date(msg.ts).toLocaleTimeString()}</span>
    </div>
  `;

  if (msg.type === "text" && msg.text) {
    bubble.innerHTML += `<div>${msg.text}</div>`;
  }

  if (msg.type === "image" && msg.image) {
    if (msg.text) bubble.innerHTML += `<div>${msg.text}</div>`;
    const imgEl = document.createElement("img");
    imgEl.src = msg.image;
    imgEl.className = "chat-img";
    imgEl.onclick = () => openImageFullscreen(msg.image);
    bubble.appendChild(imgEl);
  }

  row.appendChild(bubble);
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ----------------- Fullscreen Viewer -----------------
function openImageFullscreen(src) {
  let overlay = document.getElementById("img-overlay");
  if (overlay) overlay.remove();

  overlay = document.createElement("div");
  overlay.id = "img-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.9)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = 9999;

  const img = document.createElement("img");
  img.src = src;
  img.style.maxWidth = "90%";
  img.style.maxHeight = "90%";
  img.style.borderRadius = "10px";
  overlay.appendChild(img);

  const closeBtn = document.createElement("span");
  closeBtn.innerHTML = "✖";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "20px";
  closeBtn.style.right = "30px";
  closeBtn.style.fontSize = "30px";
  closeBtn.style.color = "white";
  closeBtn.style.cursor = "pointer";
  closeBtn.onclick = () => overlay.remove();

  overlay.appendChild(closeBtn);
  overlay.onclick = e => {
    if (e.target === overlay) overlay.remove();
  };

  document.body.appendChild(overlay);
}
