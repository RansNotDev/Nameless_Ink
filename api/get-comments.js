/**
 * Get Comments API Endpoint
 * Returns all published comments for a specific quote
 */

const { getCommentsForQuote } = require('../utils/db-handler');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow GET
    if (req.method !== 'GET') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });
    }

    try {
        const { quoteId } = req.query;

        // Validate input
        if (!quoteId || typeof quoteId !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Quote ID is required'
            });
        }

        // Get comments for the quote
        const comments = await getCommentsForQuote(quoteId);

        return res.status(200).json({
            success: true,
            comments: comments,
            count: comments.length
        });

    } catch (error) {
        console.error('Error in get-comments:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error. Please try again later.'
        });
    }
};
