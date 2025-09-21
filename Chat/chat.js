// Firebase setup
const firebaseConfig = {
  apiKey: "AIzaSyBHQyKuiAgi831qANOkkWTNprdW1Pq6rbA",
  authDomain: "devchatbyhamad.firebaseapp.com",
  databaseURL: "https://devchatbyhamad-default-rtdb.firebaseio.com",
  projectId: "devchatbyhamad",
  storageBucket: "devchatbyhamad.appspot.com",   // ✅ fix here
  messagingSenderId: "798871184058",
  appId: "1:798871184058:web:c735bea9756f8109149883",
  measurementId: "G-QTCCWC70QH"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();

// Elements
const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const fileInput = document.getElementById("fileInput");

let currentUser = null;

// Auth
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    loadMessages();
  } else {
    window.location = "../Login/index.html";
  }
});

// Send
sendBtn.onclick = sendMessage;
inputEl.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = inputEl.value.trim();
  const file = fileInput.files[0];

  if (!text && !file) return;

  if (file) {
    // 🔹 Upload file to Firebase Storage
    const fileRef = storage.ref("chat_images/" + Date.now() + "_" + file.name);
    fileRef.put(file).then(snapshot => {
      snapshot.ref.getDownloadURL().then(url => {
        pushMessage(text, "image", url);
      });
    });
  } else {
    pushMessage(text, "text", null);
  }

  inputEl.value = "";
  fileInput.value = "";
}

function pushMessage(text, type, imageUrl) {
  db.ref("messages").push({
    uid: currentUser.uid,
    username: currentUser.displayName || "Guest",
    photoURL: currentUser.photoURL || null,
    ts: Date.now(),
    type: type,
    text: text,
    image: imageUrl
  });
}

// Load
function loadMessages() {
  db.ref("messages").on("child_added", snap => {
    renderMessage(snap.val());
  });
}

function renderMessage(msg) {
  const row = document.createElement("div");
  row.className = "msg-row";

  const avatar = document.createElement("img");
  avatar.className = "avatar";
  avatar.src = msg.photoURL ||
    "https://avatars.dicebear.com/api/identicon/" +
    encodeURIComponent(msg.username || "user") +
    ".svg";
  row.appendChild(avatar);

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = `<div class="meta">${msg.username} <span class="time">${new Date(msg.ts).toLocaleTimeString()}</span></div>`;

  if (msg.type === "text" && msg.text) {
    bubble.innerHTML += `<div>${msg.text}</div>`;
  }

  if (msg.type === "image") {
    if (msg.text) bubble.innerHTML += `<div>${msg.text}</div>`;
    const imgEl = document.createElement("img");
    imgEl.src = msg.image;
    imgEl.className = "chat-img";
    imgEl.style.cursor = "pointer";
    imgEl.onclick = () => openImageFullscreen(imgEl.src);
    bubble.appendChild(imgEl);
  }

  row.appendChild(bubble);
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Fullscreen image
function openImageFullscreen(src) {
  let overlay = document.createElement("div");
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

  let img = document.createElement("img");
  img.src = src;
  img.style.maxWidth = "90%";
  img.style.maxHeight = "90%";
  overlay.appendChild(img);

  let closeBtn = document.createElement("span");
  closeBtn.innerHTML = "✖";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "20px";
  closeBtn.style.right = "30px";
  closeBtn.style.fontSize = "30px";
  closeBtn.style.color = "white";
  closeBtn.style.cursor = "pointer";
  closeBtn.onclick = () => document.body.removeChild(overlay);

  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);
}
