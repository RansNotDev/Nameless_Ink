/**
 * Quote Handler Module
 * Handles quote submission and display
 */

/**
 * Display quotes in the container
 */
function displayQuotes(quotes) {
    const container = document.getElementById('quotesContainer');
    
    if (!quotes || quotes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No quotes yet</h3>
                <p>Be the first to share a thought!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = quotes.map(quote => createQuoteCard(quote)).join('');
    
    // Add click listeners to quote cards
    container.querySelectorAll('.quote-card').forEach(card => {
        card.addEventListener('click', () => {
            const quoteId = card.dataset.quoteId;
            openQuoteModal(quoteId, quote);
        });
    });
}

/**
 * Create a quote card HTML element
 */
function createQuoteCard(quote) {
    const timestamp = formatTimestamp(quote.timestamp);
    const commentCount = quote.commentCount || 0;
    
    return `
        <div class="quote-card" data-quote-id="${quote.id}">
            <div class="quote-text">${escapeHtml(quote.text)}</div>
            <div class="quote-meta">
                <div>
                    <span class="rating-badge rating-${quote.rating}">
                        ⭐ ${quote.rating}/5
                    </span>
                </div>
                <div style="display: flex; gap: 15px; align-items: center;">
                    <span class="comment-count">💬 ${commentCount} ${commentCount === 1 ? 'reply' : 'replies'}</span>
                    <span class="timestamp">${timestamp}</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Handle quote form submission
 */
async function handleQuoteSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const input = document.getElementById('quoteInput');
    const submitBtn = document.getElementById('submitBtn');
    const statusDiv = document.getElementById('quoteStatus');
    
    const quoteText = input.value.trim();
    
    if (!quoteText) {
        showStatus(statusDiv, 'Please enter a quote', 'error');
        return;
    }

    // Disable form
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    hideStatus(statusDiv);

    try {
        const result = await submitQuote(quoteText);
        
        if (result.success) {
            if (result.published) {
                showStatus(statusDiv, `Quote published! Rating: ${result.rating}/5`, 'success');
                input.value = '';
                updateCharCount('quoteInput', 'charCount');
                // Refresh quotes list
                await loadQuotes();
            } else {
                showStatus(statusDiv, `Quote rejected. Rating: ${result.rating}/5. ${result.feedback || 'Quality threshold not met.'}`, 'error');
            }
        } else {
            showStatus(statusDiv, result.error || 'Failed to submit quote', 'error');
        }
    } catch (error) {
        console.error('Quote submission error:', error);
        showStatus(statusDiv, 'Error submitting quote. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Quote';
    }
}

/**
 * Load and display quotes
 */
async function loadQuotes() {
    const container = document.getElementById('quotesContainer');
    const loadingDiv = document.getElementById('loadingQuotes');
    
    if (loadingDiv) {
        loadingDiv.style.display = 'block';
    }
    
    try {
        const result = await getQuotes();
        if (result.success && result.quotes) {
            displayQuotes(result.quotes);
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Error loading quotes</h3>
                    <p>${result.error || 'Please try again later.'}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading quotes:', error);
        container.innerHTML = `
            <div class="empty-state">
                <h3>Error loading quotes</h3>
                <p>Please check your connection and try again.</p>
            </div>
        `;
    } finally {
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
    }
}

// Utility functions are imported from utils.js

/**
 * Open quote modal for viewing comments
 */
function openQuoteModal(quoteId, quote) {
    const modal = document.getElementById('quoteModal');
    const modalContent = document.getElementById('modalQuoteContent');
    
    modalContent.innerHTML = `
        <div class="modal-quote">
            <div class="quote-text">${escapeHtml(quote.text)}</div>
            <div class="quote-meta">
                <span class="rating-badge rating-${quote.rating}">
                    ⭐ ${quote.rating}/5
                </span>
                <span class="timestamp">${formatTimestamp(quote.timestamp)}</span>
            </div>
        </div>
    `;
    
    // Set quote ID for comment submission
    document.getElementById('commentForm').dataset.quoteId = quoteId;
    
    // Load comments
    loadComments(quoteId);
    
    // Show modal
    modal.classList.add('show');
}
