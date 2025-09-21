// Firebase config
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  databaseURL: "YOUR_DB",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APPID"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

// ✅ Fixed selectors to match your HTML
const messagesEl = document.getElementById("messages");
const inputEl = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const fileInput = document.getElementById("fileInput");
const toggleBtn = document.getElementById("optionsBtn");
const optionsPanel = document.getElementById("optionsPanel");
const logoutBtn = document.getElementById("logoutBtn");

let currentUser = null;

// 🔹 Auth state
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    loadMessages();
  } else {
    // redirect to login
    window.location = "../Login/index.html";
  }
});

// 🔹 Logout
logoutBtn.onclick = () => {
  auth.signOut();
};

// 🔹 Toggle options
toggleBtn.onclick = () => {
  optionsPanel.style.display =
    optionsPanel.style.display === "flex" ? "none" : "flex";
};

// 🔹 Send message
sendBtn.onclick = sendMessage;
inputEl.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  const text = inputEl.value.trim();
  const file = fileInput.files[0];

  if (!text && !file) return;

  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      db.ref("messages").push({
        uid: currentUser.uid,
        username: currentUser.displayName || "Guest",
        photoURL: currentUser.photoURL || null,
        ts: Date.now(),
        type: "image",
        text: text || "",
        image: e.target.result
      });
    };
    reader.readAsDataURL(file);
  } else {
    db.ref("messages").push({
      uid: currentUser.uid,
      username: currentUser.displayName || "Guest",
      photoURL: currentUser.photoURL || null,
      ts: Date.now(),
      type: "text",
      text: text
    });
  }

  inputEl.value = "";
  fileInput.value = "";
}

// 🔹 Load messages
function loadMessages() {
  db.ref("messages").on("child_added", snap => {
    const msg = snap.val();
    renderMessage(snap.key, msg);
  });
}

// 🔹 Render message
function renderMessage(id, msg) {
  const row = document.createElement("div");
  row.className = "msg-row show";
  row.id = "msg-" + id;

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

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerHTML = `
    <div class="meta">
      ${msg.username || "Unknown"} 
      <span class="time">${new Date(msg.ts).toLocaleTimeString()}</span>
    </div>
  `;

  // Text-only
  if (msg.type === "text" && msg.text) {
    bubble.innerHTML += `<div>${msg.text}</div>`;
  }

  // Image + optional text
  if (msg.type === "image") {
    if (msg.text) bubble.innerHTML += `<div>${msg.text}</div>`;
    const imgEl = document.createElement("img");
    imgEl.src = msg.image || msg.text;
    imgEl.className = "chat-img";
    imgEl.style.cursor = "pointer";
    imgEl.onclick = () => openImageFullscreen(imgEl.src);
    bubble.appendChild(imgEl);
  }

  row.appendChild(bubble);
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// 🔹 Fullscreen Image Viewer
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

  let img = document.createElement("img");
  img.src = src;
  img.style.maxWidth = "90%";
  img.style.maxHeight = "90%";
  img.style.borderRadius = "10px";
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
