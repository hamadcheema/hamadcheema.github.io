// feed.js - handles home feed, post creation, and search
import { db, ref, push, set, get, toast, currentUser } from './app.js';
import { onChildAdded, onValue } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';
import { fileToCompressedDataURL } from './auth.js';

// Simple feed loader for public posts (descending by createdAt)
const feedList = document.getElementById('feedList');
if(feedList){
  loadPublicFeed();
}

async function loadPublicFeed(){
  feedList.innerHTML = 'Loading...';
  const snap = await get(ref(db,'posts'));
  const posts = [];
  if(snap.exists()){
    snap.forEach(child=>{
      const p = child.val(); p._id = child.key;
      if(p.public) posts.push(p);
    });
  }
  // sort desc
  posts.sort((a,b)=>b.createdAt - a.createdAt);
  feedList.innerHTML = '';
  posts.forEach(renderPostCard);
}

function renderPostCard(post){
  const div = document.createElement('div'); div.className = 'post-card';
  const owner = document.createElement('div'); owner.textContent = `@${post.ownerUsername || post.owner}`;
  const img = document.createElement('img'); img.src = post.image; img.style.maxWidth='100%'; img.style.borderRadius='8px';
  const cap = document.createElement('p'); cap.textContent = post.caption || '';
  div.append(owner,img,cap);
  feedList.appendChild(div);
}

// Post creation on post.html
const postForm = document.getElementById('postForm');
if(postForm){
  postForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const file = document.getElementById('imageFile').files[0];
    const caption = document.getElementById('caption').value.trim();
    const makePublic = document.getElementById('makePublic').checked;
    if(!file){ toast('Select an image'); return; }
    try{
      const dataUrl = await fileToCompressedDataURL(file, 800, 0.6);
      const newPostRef = push(ref(db, 'posts'));
      // write minimal post object
      await set(newPostRef, {
        owner: (currentUser && currentUser.uid) || 'anon',
        ownerUsername: currentUser?.uid || 'unknown',
        caption: caption,
        image: dataUrl,
        public: !!makePublic,
        createdAt: Date.now()
      });
      toast('Post uploaded');
      postForm.reset();
      setTimeout(()=> location.href = '/index.html', 600);
    }catch(err){ console.error(err); toast('Post upload failed'); }
  });
}

// Search binding on index
const searchInput = document.getElementById('search');
if(searchInput){
  let timer = null;
  searchInput.addEventListener('input', ()=>{
    clearTimeout(timer);
    timer = setTimeout(async ()=>{
      const v = searchInput.value.trim();
      if(!v) return;
      // client-side prefix search using usernames mapping
      const res = await (await import('./app.js')).searchByUsernamePrefix(v.toLowerCase());
      const list = document.getElementById('suggestList');
      list.innerHTML = '';
      res.forEach(r=>{
        const a = document.createElement('div');
        a.textContent = '@' + r.username;
        a.style.cursor='pointer';
        a.addEventListener('click', ()=> location.href = `/profile.html?u=${r.username}`);
        list.appendChild(a);
      });
    }, 300);
  });
}
