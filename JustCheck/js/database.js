import { db } from "../firebase-config.js";
import { ref, push, set, onChildAdded } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Upload post (base64 string)
export async function uploadPost(userId, base64Data, caption) {
  const postsRef = ref(db, "posts/");
  const newPostRef = push(postsRef);
  await set(newPostRef, {
    userId,
    media: base64Data,
    caption,
    timestamp: Date.now(),
    likes: 0
  });
}

// Listen to posts in real-time
export function listenToPosts(callback) {
  const postsRef = ref(db, "posts/");
  onChildAdded(postsRef, (snapshot) => {
    callback(snapshot.key, snapshot.val());
  });
}
