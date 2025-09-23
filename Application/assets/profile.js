// profile.js - show profile, follow, requests, settings
import { db, ref, get, set, push, toast, currentUser } from './app.js';
import { onChildAdded } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js';

// Utility to read query param
function qp(name){
  return new URLSearchParams(location.search).get(name);
}

const usernameQuery = qp('u');

// If profile page is opened for a specific username, load that. Otherwise load current user's profile.
async function loadProfile(){
  let targetUid = null;
  if(usernameQuery){
    // resolve username to uid
    const snap = await get(ref(db, `usernames/${usernameQuery}`));
    if(!snap.exists()){ document.getElementById('profileName').textContent = 'Not found'; return; }
    targetUid = snap.val();
  } else {
    if(!currentUser) { location.replace('/login.html'); return; }
    targetUid = currentUser.uid;
  }

  const userSnap = await get(ref(db, `users/${targetUid}`));
  if(!userSnap.exists()){ toast('User not found'); return; }
  const user = userSnap.val();
  document.getElementById('displayName').textContent = user.fullname || 'No name';
  document.getElementById('usernameLine').textContent = '@' + (user.username || '');
  document.getElementById('bio').textContent = user.bio || '';
  const imgEl = document.getElementById('profileImg');
  imgEl.src = user.profileImage || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"></svg>';

  // posts by this user
  const postsSnap = await get(ref(db,'posts'));
  const userPosts = [];
  if(postsSnap.exists()){
    postsSnap.forEach(c=>{ const p=c.val(); p._id=c.key; if(p.owner === targetUid) userPosts.push(p); });
  }
  const upEl = document.getElementById('userPosts'); upEl.innerHTML = '';
  userPosts.sort((a,b)=>b.createdAt - a.createdAt).forEach(p=>{
    const d = document.createElement('div'); d.className='post-card';
    const img = document.createElement('img'); img.src=p.image; img.style.maxWidth='100%';
    d.appendChild(img); upEl.appendChild(d);
  });

  // follow / message button logic
  const followBtn = document.getElementById('followBtn');
  const messageBtn = document.getElementById('messageBtn');
  if(currentUser && currentUser.uid === targetUid){
    followBtn.style.display = 'none'; messageBtn.style.display='none';
  } else {
    // determine relationship
    const folSnap = await get(ref(db, `followers/${targetUid}/followers/${currentUser.uid}`));
    const reqSnap = await get(ref(db, `followers/${targetUid}/followRequests/${currentUser.uid}`));
    if(folSnap.exists()){ followBtn.textContent = 'Following'; }
    else if(reqSnap.exists()){ followBtn.textContent = 'Requested'; }
    else { followBtn.textContent = 'Follow'; }

    followBtn.onclick = async ()=>{
      if(folSnap.exists()){
        // unfollow: remove entries both sides (simpler version)
        await set(ref(db, `followers/${targetUid}/followers/${currentUser.uid}`), null);
        await set(ref(db, `followers/${currentUser.uid}/following/${targetUid}`), null);
        toast('Unfollowed');
        location.reload();
      } else {
        // check if target is private
        if(user.private){
          // send follow request
          await set(ref(db, `followers/${targetUid}/followRequests/${currentUser.uid}`), {at: Date.now()});
          await set(ref(db, `followers/${currentUser.uid}/sentFollowRequests/${targetUid}`), {at: Date.now()});
          toast('Follow request sent');
          location.reload();
        } else {
          // auto follow
          await set(ref(db, `followers/${targetUid}/followers/${currentUser.uid}`), true);
          await set(ref(db, `followers/${currentUser.uid}/following/${targetUid}`), true);
          toast('Followed');
          location.reload();
        }
      }
    };

    messageBtn.onclick = ()=>{
      // go to private chat
      location.href = `/chat.html?with=${targetUid}`;
    };
  }
}

if(document.getElementById('profileCard')) loadProfile();

// Settings form handlers (on settings.html)
const settingsForm = document.getElementById('settingsForm');
if(settingsForm){
  (async ()=>{
    if(!currentUser) return;
    const s = await get(ref(db, `users/${currentUser.uid}`));
    if(s.exists()){
      const u = s.val();
      document.getElementById('fullname').value = u.fullname || '';
      document.getElementById('bio').value = u.bio || '';
      document.getElementById('privateAccount').checked = !!u.private;
    }
  })();

  settingsForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if(!currentUser) return;
    const fullname = document.getElementById('fullname').value.trim();
    const bio = document.getElementById('bio').value.trim();
    const isPrivate = document.getElementById('privateAccount').checked;
    const profileFile = document.getElementById('profileImage').files[0];
    const update = { fullname, bio, private: isPrivate };
    if(profileFile){
      const dataUrl = await (await import('./auth.js')).fileToCompressedDataURL(profileFile, 800, 0.65);
      update.profileImage = dataUrl;
    }
    await set(ref(db, `users/${currentUser.uid}`), Object.assign({}, (await get(ref(db, `users/${currentUser.uid}`))).val(), update));
    toast('Settings saved');
    setTimeout(()=> location.replace('/profile.html'), 800);
  });
}

// Follow requests management (for the logged-in user's profile page)
const requestsBox = document.getElementById('requestsBox');
if(requestsBox && currentUser){
  (async ()=>{
    const reqSnap = await get(ref(db, `followers/${currentUser.uid}/followRequests`));
    const box = document.getElementById('followRequests');
    box.innerHTML = '';
    if(reqSnap.exists()){
      for(const key in reqSnap.val()){
        const uid = key;
        const userSnap = await get(ref(db, `users/${uid}`));
        const u = userSnap.exists() ? userSnap.val() : {username:uid};
        const row = document.createElement('div');
        row.textContent = `@${u.username || uid}`;
        const accept = document.createElement('button'); accept.textContent='Accept';
        const deny = document.createElement('button'); deny.textContent='Deny';
        accept.onclick = async ()=>{
          await set(ref(db, `followers/${currentUser.uid}/followers/${uid}`), true);
          await set(ref(db, `followers/${uid}/following/${currentUser.uid}`), true);
          await set(ref(db, `followers/${currentUser.uid}/followRequests/${uid}`), null);
          toast('Accepted'); location.reload();
        };
        deny.onclick = async ()=>{
          await set(ref(db, `followers/${currentUser.uid}/followRequests/${uid}`), null);
          toast('Denied'); location.reload();
        };
        row.append(accept,deny);
        box.appendChild(row);
      }
    } else {
      box.textContent = 'No requests';
    }
  })();
}
