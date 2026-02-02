/**
 * Get Quotes API Endpoint
 * Returns all published quotes
 */

const { getPublishedQuotes, getCommentCount } = require('../utils/db-handler');

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
        // Get all published quotes
        const quotes = await getPublishedQuotes();

        // Add comment counts to each quote
        const quotesWithCounts = await Promise.all(
            quotes.map(async (quote) => {
                const count = await getCommentCount(quote.id);
                return {
                    ...quote,
                    commentCount: count
                };
            })
        );

        return res.status(200).json({
            success: true,
            quotes: quotesWithCounts,
            count: quotesWithCounts.length
        });

    } catch (error) {
        console.error('Error in get-quotes:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error. Please try again later.'
        });
    }
};
