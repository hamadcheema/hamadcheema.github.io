// js/utils.js

/**
 * Converts a File object (image/video) to a Base64 string.
 * @param {File} file - The file to convert.
 * @returns {Promise<string>} A promise that resolves with the Base64 string.
 */
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            return reject("No file provided.");
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

/**
 * Generates a unique ID (similar to push keys in Firebase).
 * @returns {string} A unique ID.
 */
export function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Formats a timestamp into a human-readable string.
 * @param {number} timestamp - The timestamp in milliseconds.
 * @returns {string} Formatted date/time.
 */
export function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime(); // difference in milliseconds

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);

    if (seconds < 60) {
        return `${seconds}s ago`;
    } else if (minutes < 60) {
        return `${minutes}m ago`;
    } else if (hours < 24) {
        return `${hours}h ago`;
    } else if (days < 7) {
        return `${days}d ago`;
    } else if (weeks < 4) { // Roughly less than a month
        return `${weeks}w ago`;
    } else {
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
}
