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

    container.innerHTML = quotes.map((quote) => createQuoteCard(quote)).join('');

    container.querySelectorAll('.quote-card').forEach((card) => {
        card.addEventListener('click', () => {
            const quoteId = card.dataset.quoteId;
            const fullQuote = quotes.find((q) => q.id === quoteId);
            if (fullQuote) {
                openQuoteModal(quoteId, fullQuote);
            }
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
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
        <article class="quote-card" data-quote-id="${quote.id}" tabindex="0" role="button" aria-label="Open quote and replies">
            <p class="quote-text">${escapeHtml(quote.text)}</p>
            <footer class="quote-meta">
                <span class="rating-badge rating-${quote.rating}" aria-label="AI rating ${quote.rating} out of 5">
                    <span class="rating-star" aria-hidden="true">★</span>
                    <span>${quote.rating}</span><span class="rating-max">/5</span>
                </span>
                <div class="quote-meta__aside">
                    <span class="comment-count">${commentCount} ${commentCount === 1 ? 'reply' : 'replies'}</span>
                    <span class="timestamp">${timestamp}</span>
                </div>
            </footer>
        </article>
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
    submitBtn.textContent = 'Sending…';
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
        submitBtn.textContent = 'Send into the ink';
    }
}

/**
 * Load and display quotes
 */
async function loadQuotes() {
    const container = document.getElementById('quotesContainer');
    container.innerHTML = `
        <div class="loading skeleton-zone" id="loadingQuotes">
            <span class="loading__text">Opening the folio…</span>
        </div>
    `;

    try {
        const result = await getQuotes();
        if (result.success && result.quotes) {
            displayQuotes(result.quotes);
        } else {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Error loading quotes</h3>
                    <p>${escapeHtml(result.error || 'Please try again later.')}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading quotes:', error);
        const detail =
            error && error.message
                ? escapeHtml(error.message)
                : escapeHtml('Please check your connection and try again.');
        container.innerHTML = `
            <div class="empty-state empty-state--error">
                <h3>Error loading quotes</h3>
                <p>${detail}</p>
            </div>
        `;
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
            <p class="quote-text">${escapeHtml(quote.text)}</p>
            <div class="quote-meta">
                <span class="rating-badge rating-${quote.rating}" aria-label="AI rating ${quote.rating} out of 5">
                    <span class="rating-star" aria-hidden="true">★</span>
                    <span>${quote.rating}</span><span class="rating-max">/5</span>
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
    requestAnimationFrame(() => {
        modal.querySelector('.modal__close')?.focus();
    });
}
