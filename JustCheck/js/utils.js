// js/utils.js

/**
 * Converts a File object (image/video) to a Base64 string.
 * @param {File} file - The file to convert.
 * @returns {Promise<string>} A promise that resolves with the Base64 string.
 */
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

/**
 * Generates a unique ID (similar to Firebase push IDs).
 * @returns {string} A unique ID.
 */
export function generateUniqueId() {
    // This is a simplified version; Firebase push IDs are more robust.
    // For a simple unique string, this can work.
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
