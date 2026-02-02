/**
 * Submit Quote API Endpoint
 * Handles quote submission, AI rating, and storage
 */

const { rateContent, shouldPublish } = require('../utils/ai-rater');
const { saveQuote } = require('../utils/db-handler');

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
        });
    }

    try {
        const { text } = req.body;

        // Validate input
        if (!text || typeof text !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Quote text is required'
            });
        }

        const trimmedText = text.trim();

        if (trimmedText.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Quote text cannot be empty'
            });
        }

        if (trimmedText.length > 500) {
            return res.status(400).json({
                success: false,
                error: 'Quote text cannot exceed 500 characters'
            });
        }

        // Get rating threshold from environment (default: 3)
        const threshold = parseInt(process.env.RATING_THRESHOLD) || 3;

        // Rate the content using AI
        const ratingData = await rateContent(trimmedText);
        const rating = ratingData.rating;
        const feedback = ratingData.feedback;

        // Determine if quote should be published
        const published = shouldPublish(rating, threshold);

        // Save to database
        const quoteId = await saveQuote({
            text: trimmedText,
            rating: rating,
            published: published
        });

        // Return response
        return res.status(200).json({
            success: true,
            quoteId: quoteId,
            rating: rating,
            feedback: feedback,
            published: published,
            message: published 
                ? 'Quote published successfully' 
                : 'Quote rejected - quality threshold not met'
        });

    } catch (error) {
        console.error('Error in submit-quote:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error. Please try again later.'
        });
    }
};
