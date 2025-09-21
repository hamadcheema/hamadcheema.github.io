// ---- Dummy Firebase-like setup (replace with real Firebase if needed) ----
let currentUser = { uid: "u1", displayName: "Me" };
let replyTo = null;
let pendingImage = null;

// Elements
const messagesEl = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const imgInput = document.getElementById("imgInput");
const imgPreview = document.getElementById("imgPreview");

// Notify
function notify(msg, type="success"){
  const box=document.createElement("div");
  box.className=`notification ${type}`;
  box.textContent=msg;
  document.getElementById("notifyContainer").appendChild(box);
  setTimeout(()=>box.remove(),3000);
}

// --------------------
// Send Message
// --------------------
sendBtn.onclick = sendMessage;
msgInput.addEventListener("keypress",(e)=>{if(e.key==="Enter") sendMessage();});

function sendMessage(){
  const text = msgInput.value.trim();
  if(!text && !pendingImage){notify("Message empty","error");return;}

  const msg = {
    id: Date.now(),
    uid: currentUser.uid,
    username: currentUser.displayName,
    ts: Date.now(),
    text: text || "",
    img: pendingImage || null,
    replyTo: replyTo
  };

  renderMessage(msg.id, msg);

  msgInput.value="";
  imgPreview.style.display="none";
  pendingImage=null;
  replyTo=null;
  document.getElementById("replyBar").style.display="none";
}

// --------------------
// Render Message
// --------------------
function renderMessage(id,msg){
  const row=document.createElement("div");
  row.className="msg-row";
  if(msg.uid===currentUser.uid) row.classList.add("self");

  const avatar=document.createElement("img");
  avatar.className="avatar";
  avatar.src=`https://avatars.dicebear.com/api/identicon/${encodeURIComponent(msg.username)}.svg`;
  row.appendChild(avatar);

  const bubble=document.createElement("div");
  bubble.className="bubble";
  bubble.innerHTML=`<div class="meta">${msg.username} <span class="time">${new Date(msg.ts).toLocaleTimeString()}</span></div>`;

  if(msg.replyTo){
    bubble.innerHTML+=`
      <div class="reply-quote">
        <strong>${msg.replyTo.username}</strong>: ${msg.replyTo.text ? msg.replyTo.text : "[Image]"}
      </div>`;
  }

  if(msg.img) bubble.innerHTML+=`<img src="${msg.img}" class="chat-img"/>`;
  if(msg.text) bubble.innerHTML+=`<div>${msg.text}</div>`;

  // reply button
  const replyBtn=document.createElement("span");
  replyBtn.className="reply-btn";
  replyBtn.textContent="↩ Reply";
  replyBtn.onclick=()=>{replyTo={id:msg.id,username:msg.username,text:msg.text||null,img:msg.img||null};showReplyBar();};
  bubble.appendChild(replyBtn);

  row.appendChild(bubble);
  messagesEl.appendChild(row);
  messagesEl.scrollTop=messagesEl.scrollHeight;
}

// --------------------
// Reply Preview Bar
// --------------------
function showReplyBar(){
  const bar=document.getElementById("replyBar");
  bar.style.display="flex";
  bar.innerHTML=`
    <div class="reply-preview">
      Replying to <strong>${replyTo.username}</strong>: ${replyTo.text ? replyTo.text : "[Image]"}
    </div>
    <button id="cancelReply">✕</button>`;
  document.getElementById("cancelReply").onclick=()=>{
    replyTo=null;
    bar.style.display="none";
  };
}

// --------------------
// Image Upload (local preview only)
// --------------------
imgInput.onchange=()=>{
  const file=imgInput.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=e=>{
    pendingImage=e.target.result;
    imgPreview.style.display="flex";
    imgPreview.innerHTML=`<img src="${pendingImage}"/>`;
  };
  reader.readAsDataURL(file);
};
