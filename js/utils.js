/**
 * Utility Functions
 * Shared functions used across the application
 */

/**
 * Format timestamp to readable format
 */
function formatTimestamp(timestamp) {
    if (!timestamp) return 'Just now';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    
    return date.toLocaleDateString();
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show status message
 */
function showStatus(element, message, type = 'info') {
    if (!element) return;
    element.textContent = message;
    element.className = `status-message ${type}`;
}

/**
 * Hide status message
 */
function hideStatus(element) {
    if (!element) return;
    element.className = 'status-message';
    element.textContent = '';
}
