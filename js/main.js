/**
 * Main Application Entry Point
 * Initializes the application and sets up event listeners
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    setupEventListeners();
    loadQuotes();
    setupCharCounters();
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Quote form submission
    const quoteForm = document.getElementById('quoteForm');
    if (quoteForm) {
        quoteForm.addEventListener('submit', handleQuoteSubmit);
    }

    // Comment form submission
    const commentForm = document.getElementById('commentForm');
    if (commentForm) {
        commentForm.addEventListener('submit', handleCommentSubmit);
    }

    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadQuotes();
        });
    }

    // Modal close button
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', closeQuoteModal);
    }

    // Close modal when clicking outside
    const modal = document.getElementById('quoteModal');
    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeQuoteModal();
            }
        });
    }

    // Close modal with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeQuoteModal();
        }
    });
}

/**
 * Set up character counters
 */
function setupCharCounters() {
    const quoteInput = document.getElementById('quoteInput');
    const commentInput = document.getElementById('commentInput');
    
    if (quoteInput) {
        quoteInput.addEventListener('input', () => {
            updateCharCount('quoteInput', 'charCount', 500);
        });
        // Initial count
        updateCharCount('quoteInput', 'charCount', 500);
    }
    
    if (commentInput) {
        commentInput.addEventListener('input', () => {
            updateCharCount('commentInput', 'commentCharCount', 300);
        });
        // Initial count
        updateCharCount('commentInput', 'commentCharCount', 300);
    }
}

/**
 * Update character count display
 */
function updateCharCount(inputId, countId, maxLength) {
    const input = document.getElementById(inputId);
    const countElement = document.getElementById(countId);
    
    if (input && countElement) {
        const currentLength = input.value.length;
        countElement.textContent = currentLength;
        
        // Change color if approaching limit
        if (currentLength > maxLength * 0.9) {
            countElement.style.color = '#e74c3c';
        } else {
            countElement.style.color = '';
        }
    }
}

/**
 * Close the quote modal
 */
function closeQuoteModal() {
    const modal = document.getElementById('quoteModal');
    if (modal) {
        modal.classList.remove('show');
        // Clear comment form
        const commentForm = document.getElementById('commentForm');
        if (commentForm) {
            commentForm.reset();
            commentForm.removeAttribute('data-quote-id');
        }
        // Clear status messages
        const statusDiv = document.getElementById('commentStatus');
        if (statusDiv) {
            hideCommentStatus(statusDiv);
        }
    }
}
