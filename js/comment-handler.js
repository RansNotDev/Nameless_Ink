/**
 * Comment Handler Module
 * Handles comment submission and display
 */

/**
 * Handle comment form submission
 */
async function handleCommentSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const quoteId = form.dataset.quoteId;
    const input = document.getElementById('commentInput');
    const submitBtn = form.querySelector('.submit-btn');
    const statusDiv = document.getElementById('commentStatus');
    
    if (!quoteId) {
        showCommentStatus(statusDiv, 'Error: Quote ID not found', 'error');
        return;
    }
    
    const commentText = input.value.trim();
    
    if (!commentText) {
        showCommentStatus(statusDiv, 'Please enter a reply', 'error');
        return;
    }

    // Disable form
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    hideCommentStatus(statusDiv);

    try {
        const result = await submitComment(quoteId, commentText);
        
        if (result.success) {
            if (result.published) {
                showCommentStatus(statusDiv, `Reply published! Rating: ${result.rating}/5`, 'success');
                input.value = '';
                updateCharCount('commentInput', 'commentCharCount');
                // Reload comments
                await loadComments(quoteId);
                // Refresh main quotes list to update comment count
                await loadQuotes();
            } else {
                showCommentStatus(statusDiv, `Reply rejected. Rating: ${result.rating}/5. ${result.feedback || 'Quality threshold not met.'}`, 'error');
            }
        } else {
            showCommentStatus(statusDiv, result.error || 'Failed to submit reply', 'error');
        }
    } catch (error) {
        console.error('Comment submission error:', error);
        showCommentStatus(statusDiv, 'Error submitting reply. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Reply';
    }
}

/**
 * Load and display comments for a quote
 */
async function loadComments(quoteId) {
    const container = document.getElementById('commentsContainer');
    
    container.innerHTML = '<div class="loading">Loading replies...</div>';
    
    try {
        const result = await getComments(quoteId);
        if (result.success && result.comments) {
            displayComments(result.comments);
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <p>${result.error || 'No replies yet. Be the first!'}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading comments:', error);
        container.innerHTML = `
            <div class="empty-state">
                <p>Error loading replies. Please try again.</p>
            </div>
        `;
    }
}

/**
 * Display comments in the container
 */
function displayComments(comments) {
    const container = document.getElementById('commentsContainer');
    
    if (!comments || comments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No replies yet. Be the first to reply!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = comments.map(comment => createCommentItem(comment)).join('');
}

/**
 * Create a comment item HTML element
 */
function createCommentItem(comment) {
    const timestamp = formatTimestamp(comment.timestamp);
    
    return `
        <div class="comment-item">
            <div class="comment-text">${escapeHtml(comment.text)}</div>
            <div class="comment-meta">
                <span class="rating-badge rating-${comment.rating}">
                    ⭐ ${comment.rating}/5
                </span>
                <span class="timestamp">${timestamp}</span>
            </div>
        </div>
    `;
}

/**
 * Show comment status message
 */
function showCommentStatus(element, message, type = 'info') {
    element.textContent = message;
    element.className = `status-message ${type}`;
}

/**
 * Hide comment status message
 */
function hideCommentStatus(element) {
    element.className = 'status-message';
    element.textContent = '';
}
