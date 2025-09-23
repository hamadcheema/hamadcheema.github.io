// chat.js
import { db, ref, push, onValue, set, get, chatIdFor, toast, currentUser } from './app.js';
import { onChildAdded } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

// Determine chat target from query
const chatWith = new URLSearchParams(location.search).get('with');
let currentChatId = chatWith ? chatIdFor(currentUser?.uid, chatWith) : 'PUBLIC_global_chat';

const messagesEl = document.getElementById('messages');
const msgForm = document.getElementById('msgForm');
const msgText = document.getElementById('msgText');

async function loadConversations(){
  const convList = document.getElementById('convList');
  if(!convList) return;
  convList.innerHTML = '';
  // For demo: list only public chat + all users you follow (simple)
  const pub = document.createElement('div'); pub.textContent = 'Global Chat'; pub.onclick = ()=> openChat('PUBLIC_global_chat');
  convList.appendChild(pub);
}

function openChat(cid){
  currentChatId = cid;
  document.getElementById('chatTitle').textContent = cid === 'PUBLIC_global_chat' ? 'Public Chat' : 'Private Chat';
  messagesEl.innerHTML = '';
  listenMessages(cid);
}

// Listen to messages in a chat (simple live listener)
let activeListener = null;
function listenMessages(cid){
  // detach previous is left as exercise (listeners auto-clean in simple pages)
  const msgsRef = ref(db, `chats/${cid}/messages`);
  onChildAdded(msgsRef, (snap)=>{
    const m = snap.val();
    const el = document.createElement('div'); el.className = 'post-card';
    el.textContent = `${m.fromUsername || m.from}: ${m.text}`;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
}

if(msgForm){
  msgForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const text = msgText.value.trim();
    if(!text) return;
    if(!currentUser){ toast('Login first'); return; }
    const chatRef = ref(db, `chats/${currentChatId}/messages`);
    const newMsgRef = push(chatRef);
    await set(newMsgRef, {
      from: currentUser.uid,
      fromUsername: (await (await import('./app.js')).getUserByUid(currentUser.uid)).username || currentUser.uid,
      text: text,
      createdAt: Date.now()
    });
    // update meta.lastAt
    await set(ref(db, `chats/${currentChatId}/meta/lastAt`), Date.now());
    msgText.value = '';
  });
}

// initialize
loadConversations();
openChat(currentChatId);
