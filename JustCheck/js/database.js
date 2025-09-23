// js/database.js
import { ref, set, get, update, remove, push, onValue, off, serverTimestamp, query, orderByChild, limitToLast } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js';
import { database } from '../firebase-config.js';
import { generateUniqueId } from './utils.js';

// --- User Profiles ---
export async function getUserProfile(userId) {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    return snapshot.exists() ? snapshot.val() : null;
}

export async function updateProfile(userId, data) {
    const userRef = ref(database, `users/${userId}`);
    await update(userRef, data);
    console.log("Profile updated for:", userId);
}

// --- Posts (Photos & Videos) ---
export async function uploadPost(userId, fileBase64, caption, mediaType) {
    const postId = push(ref(database, 'posts')).key; // Firebase generates unique key
    const postRef = ref(database, `posts/${postId}`);
    const newPost = {
        postId: postId,
        userId: userId,
        media: fileBase64, // Base64 string of the image/video
        mediaType: mediaType, // 'image' or 'video'
        caption: caption,
        timestamp: serverTimestamp(), // Firebase server timestamp
        likes: 0,
        comments: {} // Sub-collection for comments
    };
    await set(postRef, newPost);
    console.log("Post uploaded:", postId);
    return newPost;
}

export function getFeedPosts(callback) {
    const postsRef = query(ref(database, 'posts'), orderByChild('timestamp'), limitToLast(50)); // Get latest 50 posts
    onValue(postsRef, (snapshot) => {
        const posts = [];
        snapshot.forEach((childSnapshot) => {
            const post = childSnapshot.val();
            posts.unshift(post); // Add to beginning for reverse chronological order
        });
        callback(posts);
    });
    return () => off(postsRef); // Return unsubscribe function
}

// --- Likes ---
export async function toggleLike(postId, userId) {
    const likeRef = ref(database, `postLikes/${postId}/${userId}`);
    const postRef = ref(database, `posts/${postId}`);

    const snapshot = await get(likeRef);
    if (snapshot.exists()) {
        // User already liked, so unlike
        await remove(likeRef);
        await update(postRef, { likes: (await get(postRef)).val().likes - 1 });
        return false; // Unliked
    } else {
        // User has not liked, so like
        await set(likeRef, true); // Store a boolean to indicate like
        await update(postRef, { likes: (await get(postRef)).val().likes + 1 });
        return true; // Liked
    }
}

export async function hasUserLikedPost(postId, userId) {
    const likeRef = ref(database, `postLikes/${postId}/${userId}`);
    const snapshot = await get(likeRef);
    return snapshot.exists();
}


// --- Comments ---
export async function addComment(postId, userId, username, commentText) {
    const commentId = push(ref(database, `posts/${postId}/comments`)).key;
    const newComment = {
        commentId: commentId,
        userId: userId,
        username: username,
        text: commentText,
        timestamp: serverTimestamp()
    };
    await set(ref(database, `posts/${postId}/comments/${commentId}`), newComment);
    console.log("Comment added:", commentId);
    return newComment;
}

export function getPostComments(postId, callback) {
    const commentsRef = ref(database, `posts/${postId}/comments`);
    onValue(commentsRef, (snapshot) => {
        const comments = [];
        snapshot.forEach((childSnapshot) => {
            comments.push(childSnapshot.val());
        });
        // Sort comments by timestamp if needed, Firebase usually returns in push key order
        comments.sort((a, b) => a.timestamp - b.timestamp);
        callback(comments);
    });
    return () => off(commentsRef);
}

// --- Stories ---
export async function uploadStory(userId, fileBase64, mediaType) {
    const storyId = push(ref(database, 'stories')).key;
    const storyRef = ref(database, `stories/${storyId}`);
    const newStory = {
        storyId: storyId,
        userId: userId,
        media: fileBase64, // Base64 string
        mediaType: mediaType,
        timestamp: serverTimestamp(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now in ms
    };
    await set(storyRef, newStory);
    console.log("Story uploaded:", storyId);
    return newStory;
}

export function getActiveStories(callback) {
    const storiesRef = ref(database, 'stories');
    // We filter active stories on the client-side based on `expiresAt`
    onValue(storiesRef, (snapshot) => {
        const activeStories = {}; // Group stories by user
        const now = Date.now();
        snapshot.forEach((childSnapshot) => {
            const story = childSnapshot.val();
            if (story.expiresAt > now) {
                if (!activeStories[story.userId]) {
                    activeStories[story.userId] = [];
                }
                activeStories[story.userId].push(story);
            } else {
                // Optionally, delete expired stories here if you want server-side cleanup
                // remove(ref(database, `stories/${story.storyId}`));
            }
        });
        callback(activeStories);
    });
    return () => off(storiesRef);
}

// --- Direct Messaging/Chat ---
export async function sendMessage(senderId, receiverId, messageText) {
    // Create a unique chat room ID for a pair of users
    // Ensure consistent sorting for chatroomId
    const chatroomId = senderId < receiverId ? `${senderId}_${receiverId}` : `${receiverId}_${senderId}`;

    const messageId = push(ref(database, `chats/${chatroomId}/messages`)).key;
    const newMessage = {
        messageId: messageId,
        senderId: senderId,
        receiverId: receiverId,
        text: messageText,
        timestamp: serverTimestamp(),
        read: false // Optional: for read receipts
    };
    await set(ref(database, `chats/${chatroomId}/messages/${messageId}`), newMessage);

    // Update last message info for sender/receiver's chat list
    await update(ref(database, `userChats/${senderId}/${receiverId}`), {
        lastMessage: messageText,
        timestamp: serverTimestamp()
    });
    await update(ref(database, `userChats/${receiverId}/${senderId}`), {
        lastMessage: messageText,
        timestamp: serverTimestamp()
    });

    console.log("Message sent:", messageId);
    return newMessage;
}

export function getChatMessages(user1Id, user2Id, callback) {
    const chatroomId = user1Id < user2Id ? `${user1Id}_${user2Id}` : `${user2Id}_${user1Id}`;
    const messagesRef = query(ref(database, `chats/${chatroomId}/messages`), orderByChild('timestamp'));
    onValue(messagesRef, (snapshot) => {
        const messages = [];
        snapshot.forEach((childSnapshot) => {
            messages.push(childSnapshot.val());
        });
        callback(messages);
    });
    return () => off(messagesRef);
}

export function getUserChatList(userId, callback) {
    const userChatsRef = query(ref(database, `userChats/${userId}`), orderByChild('timestamp'));
    onValue(userChatsRef, (snapshot) => {
        const chatList = [];
        snapshot.forEach((childSnapshot) => {
            const otherUserId = childSnapshot.key;
            const chatInfo = childSnapshot.val();
            chatList.push({ otherUserId, ...chatInfo });
        });
        callback(chatList);
    });
    return () => off(userChatsRef);
}
