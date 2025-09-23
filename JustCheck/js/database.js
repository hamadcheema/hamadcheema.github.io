// js/database.js
import { ref, set, get, child, push, onValue, update, remove, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-database.js";
import { database } from "../firebase-config.js";
import { generateUniqueId } from "./utils.js";

const DB_PATHS = {
    USERS: "users",
    POSTS: "posts",
    COMMENTS: "comments",
    LIKES: "likes",
    STORIES: "stories",
    CHATS: "chats",
    MESSAGES: "messages",
    FOLLOWERS: "followers" // For later, if we implement following
};

/**
 * Sets user data in Realtime Database.
 * @param {string} uid - User ID.
 * @param {object} userData - Data to save (username, email, bio, profilePictureBase64).
 */
export async function setUserData(uid, userData) {
    try {
        await set(ref(database, `${DB_PATHS.USERS}/${uid}`), userData);
        console.log("User data saved successfully.");
    } catch (error) {
        console.error("Error saving user data:", error);
        throw error;
    }
}

/**
 * Gets user data from Realtime Database.
 * @param {string} uid - User ID.
 * @returns {Promise<object|null>} User data or null if not found.
 */
export async function getUserData(uid) {
    try {
        const snapshot = await get(child(ref(database), `${DB_PATHS.USERS}/${uid}`));
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.log("No user data available for", uid);
            return null;
        }
    } catch (error) {
        console.error("Error getting user data:", error);
        throw error;
    }
}

/**
 * Updates specific fields of a user's data.
 * @param {string} uid - User ID.
 * @param {object} updates - Object with fields to update.
 */
export async function updateUserData(uid, updates) {
    try {
        await update(ref(database, `${DB_PATHS.USERS}/${uid}`), updates);
        console.log("User data updated successfully.");
    } catch (error) {
        console.error("Error updating user data:", error);
        throw error;
    }
}

/**
 * Creates a new post.
 * @param {string} userId - ID of the user creating the post.
 * @param {object} postData - Object containing post details (mediaBase64, caption, timestamp).
 * @returns {Promise<string>} The unique ID of the new post.
 */
export async function createPost(userId, postData) {
    try {
        const newPostRef = push(ref(database, DB_PATHS.POSTS));
        const postId = newPostRef.key;
        await set(newPostRef, {
            ...postData,
            userId: userId,
            postId: postId,
            timestamp: Date.now(),
            likesCount: 0,
            commentsCount: 0
        });
        console.log("Post created successfully with ID:", postId);
        return postId;
    } catch (error) {
        console.error("Error creating post:", error);
        throw error;
    }
}

/**
 * Listens for all posts in real-time.
 * @param {function} callback - Callback function to receive posts data.
 * @returns {function} Unsubscribe function.
 */
export function onPostsUpdate(callback) {
    const postsRef = ref(database, DB_PATHS.POSTS);
    return onValue(postsRef, (snapshot) => {
        const posts = [];
        snapshot.forEach((childSnapshot) => {
            posts.push(childSnapshot.val());
        });
        // Sort posts by timestamp in descending order (most recent first)
        posts.sort((a, b) => b.timestamp - a.timestamp);
        callback(posts);
    }, (error) => {
        console.error("Error fetching posts:", error);
    });
}

/**
 * Toggles a like on a post.
 * @param {string} postId - The ID of the post.
 * @param {string} userId - The ID of the user liking/unliking.
 */
export async function toggleLike(postId, userId) {
    try {
        const likeRef = ref(database, `${DB_PATHS.LIKES}/${postId}/${userId}`);
        const snapshot = await get(likeRef);

        const postRef = ref(database, `${DB_PATHS.POSTS}/${postId}`);
        const postSnapshot = await get(postRef);
        let currentLikesCount = postSnapshot.exists() ? postSnapshot.val().likesCount || 0 : 0;

        if (snapshot.exists()) {
            // User already liked, so unlike
            await remove(likeRef);
            currentLikesCount = Math.max(0, currentLikesCount - 1);
            console.log(`User ${userId} unliked post ${postId}`);
        } else {
            // User hasn't liked, so like
            await set(likeRef, true);
            currentLikesCount++;
            console.log(`User ${userId} liked post ${postId}`);
        }
        await update(postRef, { likesCount: currentLikesCount });

    } catch (error) {
        console.error("Error toggling like:", error);
        throw error;
    }
}

/**
 * Checks if a user has liked a specific post.
 * @param {string} postId - The ID of the post.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<boolean>} True if liked, false otherwise.
 */
export async function hasUserLikedPost(postId, userId) {
    try {
        const likeRef = ref(database, `${DB_PATHS.LIKES}/${postId}/${userId}`);
        const snapshot = await get(likeRef);
        return snapshot.exists();
    } catch (error) {
        console.error("Error checking like status:", error);
        return false;
    }
}


/**
 * Adds a comment to a post.
 * @param {string} postId - The ID of the post.
 * @param {string} userId - The ID of the commenting user.
 * @param {string} commentText - The comment content.
 */
export async function addComment(postId, userId, commentText) {
    try {
        const commentId = generateUniqueId(); // Using local unique ID for comments
        const newCommentRef = ref(database, `${DB_PATHS.COMMENTS}/${postId}/${commentId}`);
        await set(newCommentRef, {
            commentId: commentId,
            userId: userId,
            text: commentText,
            timestamp: Date.now()
        });
        console.log(`Comment added to post ${postId} by user ${userId}`);

        // Increment commentsCount on the post
        const postRef = ref(database, `${DB_PATHS.POSTS}/${postId}`);
        const postSnapshot = await get(postRef);
        let currentCommentsCount = postSnapshot.exists() ? postSnapshot.val().commentsCount || 0 : 0;
        await update(postRef, { commentsCount: currentCommentsCount + 1 });

    } catch (error) {
        console.error("Error adding comment:", error);
        throw error;
    }
}

/**
 * Listens for comments on a specific post in real-time.
 * @param {string} postId - The ID of the post.
 * @param {function} callback - Callback function to receive comments data.
 * @returns {function} Unsubscribe function.
 */
export function onPostCommentsUpdate(postId, callback) {
    const commentsRef = ref(database, `${DB_PATHS.COMMENTS}/${postId}`);
    return onValue(query(commentsRef, orderByChild('timestamp')), (snapshot) => {
        const comments = [];
        snapshot.forEach((childSnapshot) => {
            comments.push(childSnapshot.val());
        });
        callback(comments);
    }, (error) => {
        console.error("Error fetching comments:", error);
    });
}

/**
 * Creates a story.
 * @param {string} userId - ID of the user creating the story.
 * @param {object} storyData - Object containing story details (mediaBase64, timestamp).
 * @returns {Promise<string>} The unique ID of the new story.
 */
export async function createStory(userId, storyData) {
    try {
        const newStoryRef = push(ref(database, DB_PATHS.STORIES));
        const storyId = newStoryRef.key;
        const expirationTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now

        await set(newStoryRef, {
            ...storyData,
            userId: userId,
            storyId: storyId,
            timestamp: Date.now(),
            expiresAt: expirationTime
        });
        console.log("Story created successfully with ID:", storyId);

        // Schedule auto-delete (this would ideally be done via a Cloud Function for reliability)
        // For a client-side only app, we'll just filter expired stories when fetching.
        // A Cloud Function would use a `setWithTTL` or scheduled deletion for robustness.

        return storyId;
    } catch (error) {
        console.error("Error creating story:", error);
        throw error;
    }
}

/**
 * Listens for all active stories (not expired) in real-time.
 * @param {function} callback - Callback function to receive stories data grouped by user.
 * @returns {function} Unsubscribe function.
 */
export function onActiveStoriesUpdate(callback) {
    const storiesRef = ref(database, DB_PATHS.STORIES);
    return onValue(storiesRef, (snapshot) => {
        const storiesByUser = {};
        const now = Date.now();
        snapshot.forEach((childSnapshot) => {
            const story = childSnapshot.val();
            if (story.expiresAt > now) { // Only include non-expired stories
                if (!storiesByUser[story.userId]) {
                    storiesByUser[story.userId] = [];
                }
                storiesByUser[story.userId].push(story);
            } else {
                // Optionally, delete expired stories here if not using Cloud Functions
                // remove(childSnapshot.ref);
            }
        });
        callback(storiesByUser);
    }, (error) => {
        console.error("Error fetching stories:", error);
    });
}

/**
 * Initiates or retrieves a chat between two users.
 * @param {string} user1Id - First user's ID.
 * @param {string} user2Id - Second user's ID.
 * @returns {Promise<string>} The chat ID.
 */
export async function getOrCreateChat(user1Id, user2Id) {
    // Ensure consistent chat ID regardless of user order
    const chatMemberIds = [user1Id, user2Id].sort();
    const chatId = chatMemberIds.join('_');

    const chatRef = ref(database, `${DB_PATHS.CHATS}/${chatId}`);
    const snapshot = await get(chatRef);

    if (!snapshot.exists()) {
        await set(chatRef, {
            id: chatId,
            members: chatMemberIds,
            createdAt: Date.now(),
            lastMessageAt: Date.now(),
        });
        console.log("New chat created:", chatId);
    } else {
        console.log("Existing chat retrieved:", chatId);
    }
    return chatId;
}

/**
 * Sends a message in a chat.
 * @param {string} chatId - The ID of the chat.
 * @param {string} senderId - The ID of the message sender.
 * @param {string} messageText - The message content.
 */
export async function sendMessage(chatId, senderId, messageText) {
    try {
        const newMsgRef = push(ref(database, `${DB_PATHS.MESSAGES}/${chatId}`));
        const messageId = newMsgRef.key;
        await set(newMsgRef, {
            messageId: messageId,
            senderId: senderId,
            text: messageText,
            timestamp: Date.now()
        });
        console.log(`Message sent in chat ${chatId} by ${senderId}`);

        // Update last message timestamp in chat metadata
        await update(ref(database, `${DB_PATHS.CHATS}/${chatId}`), {
            lastMessageAt: Date.now(),
            lastMessageText: messageText,
            lastMessageSender: senderId
        });

    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
}

/**
 * Listens for messages in a specific chat in real-time.
 * @param {string} chatId - The ID of the chat.
 * @param {function} callback - Callback function to receive messages data.
 * @returns {function} Unsubscribe function.
 */
export function onChatMessagesUpdate(chatId, callback) {
    const messagesRef = ref(database, `${DB_PATHS.MESSAGES}/${chatId}`);
    return onValue(query(messagesRef, orderByChild('timestamp')), (snapshot) => {
        const messages = [];
        snapshot.forEach((childSnapshot) => {
            messages.push(childSnapshot.val());
        });
        callback(messages);
    }, (error) => {
        console.error("Error fetching chat messages:", error);
    });
}

/**
 * Listens for all chats a user is part of.
 * @param {string} userId - The ID of the user.
 * @param {function} callback - Callback function to receive chats data.
 * @returns {function} Unsubscribe function.
 */
export function onUserChatsUpdate(userId, callback) {
    const chatsRef = ref(database, DB_PATHS.CHATS);
    // Query for chats where the user is one of the members
    // This requires iterating, as there's no direct "array-contains" query for Realtime DB.
    // A more scalable solution might involve a separate /userChats/$uid path.
    return onValue(chatsRef, (snapshot) => {
        const userChats = [];
        snapshot.forEach((childSnapshot) => {
            const chat = childSnapshot.val();
            if (chat.members && chat.members.includes(userId)) {
                userChats.push(chat);
            }
        });
        // Sort by last message timestamp
        userChats.sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
        callback(userChats);
    }, (error) => {
        console.error("Error fetching user chats:", error);
    });
}


// --- AI Integration Placeholders ---
// These functions would typically interact with a backend AI service (e.g., Cloud Functions
// calling Google Cloud Vision API or a custom ML model).
// For a purely client-side Firebase Realtime DB app, AI integration is very limited.
// You *could* theoretically embed a small TensorFlow.js model for very basic image tasks,
// but it's beyond the scope of this "Realtime DB only" constraint for the AI part itself.

/**
 * Placeholder for generating automatic captions.
 * In a real app, this would send the imageBase64 to an AI service.
 * @param {string} imageBase64 - The Base64 string of the image.
 * @returns {Promise<string>} A promise that resolves with an generated caption.
 */
export async function generateCaption(imageBase64) {
    console.warn("AI caption generation is a placeholder. It would typically require a backend service.");
    // Simulate AI delay and return a generic caption
    await new Promise(resolve => setTimeout(resolve, 1500));
    return "A beautiful moment captured.";
}

/**
 * Placeholder for recommending posts based on user activity.
 * This would require a sophisticated recommendation engine, likely on a backend.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<string[]>} An array of recommended post IDs.
 */
export async function getRecommendedPosts(userId) {
    console.warn("AI post recommendation is a placeholder. It would typically require a backend service.");
    await new Promise(resolve => setTimeout(resolve, 1000));
    // For now, return a random subset of all posts or just the most recent
    const snapshot = await get(child(ref(database), DB_PATHS.POSTS));
    if (snapshot.exists()) {
        const posts = Object.values(snapshot.val());
        // Simple recommendation: return 3 most recent posts (excluding current user's, if applicable)
        return posts
            .filter(post => post.userId !== userId) // Don't recommend own posts
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 3)
            .map(post => post.postId);
    }
    return [];
}
