/**
 * API Communication Module
 * Handles all HTTP requests to the backend
 */

const API_BASE_URL = '/api';

/**
 * Make a POST request to the API
 */
async function apiPost(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API POST Error (${endpoint}):`, error);
        throw error;
    }
}

/**
 * Make a GET request to the API
 */
async function apiGet(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(error.error || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API GET Error (${endpoint}):`, error);
        throw error;
    }
}

/**
 * Submit a quote to the backend
 */
async function submitQuote(quoteText) {
    return await apiPost('/submit-quote', { text: quoteText });
}

/**
 * Submit a comment/reply to a quote
 */
async function submitComment(quoteId, commentText) {
    return await apiPost('/submit-comment', { 
        quoteId: quoteId, 
        text: commentText 
    });
}

/**
 * Get all approved quotes
 */
async function getQuotes() {
    return await apiGet('/get-quotes');
}

/**
 * Get comments for a specific quote
 */
async function getComments(quoteId) {
    return await apiGet(`/get-comments?quoteId=${quoteId}`);
}
