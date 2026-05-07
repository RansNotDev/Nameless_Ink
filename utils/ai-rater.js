/**
 * AI Rater Utility
 * Handles communication with Gemini API for rating content
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

function isLocalDev() {
    return String(process.env.LOCAL_DEV || '').toLowerCase() === 'true';
}

/**
 * Initialize Gemini AI
 */
function initGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    return new GoogleGenerativeAI(apiKey);
}

/**
 * Rate content using Gemini AI (or a deterministic mock when LOCAL_DEV=true)
 * @param {string} text
 * @param {{ kind?: 'quote' | 'comment' }} [options] — LOCAL_DEV mock length rules only
 */
async function rateContent(text, options = {}) {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
        throw new Error('Invalid text provided for rating');
    }

    const kind = options.kind === 'comment' ? 'comment' : 'quote';

    if (isLocalDev()) {
        const len = text.trim().length;
        const minPublishChars = kind === 'comment' ? 2 : 4;

        let rating = 4;
        let feedback =
            'Local dev mock rating (set LOCAL_DEV=false and GEMINI_API_KEY for real AI).';

        if (len < minPublishChars) {
            rating = 2;
            feedback =
                kind === 'comment'
                    ? 'Mock: reply too short (try at least 2 characters). Real AI runs when LOCAL_DEV=false.'
                    : 'Mock: quote too short (try at least 4 characters). Real AI runs when LOCAL_DEV=false.';
        }

        return { rating, feedback };
    }

    const genAI = initGemini();
    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const prompt = `You are a quality rater for anonymous quotes. Rate the following text on a scale of 1-5 based on:
- Thoughtfulness and depth
- Clarity and readability
- Originality
- Overall quality

Rating scale:
1 - Noise, nonsense, or trash
2 - Weak thought, barely formed
3 - Fine, readable, acceptable
4 - Strong and thoughtful
5 - Sharp, memorable, hits hard

Text to rate (JSON string): ${JSON.stringify(text)}

Respond ONLY with a JSON object in this exact format:
{
  "rating": <number 1-5>,
  "feedback": "<brief explanation in one sentence>"
}

Do not include any other text, explanations, or markdown formatting. Only the JSON object.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textResponse = response.text().trim();

        // Parse JSON response
        let ratingData;
        try {
            // Remove markdown code blocks if present
            const cleanedResponse = textResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            ratingData = JSON.parse(cleanedResponse);
        } catch (parseError) {
            // If JSON parsing fails, try to extract rating from text
            const ratingMatch = textResponse.match(/["']?rating["']?\s*:\s*(\d)/i) || 
                               textResponse.match(/rating[:\s]+(\d)/i) ||
                               textResponse.match(/(\d)\s*\/\s*5/i);
            
            const rating = ratingMatch ? parseInt(ratingMatch[1]) : 3;
            ratingData = {
                rating: Math.max(1, Math.min(5, rating)), // Clamp between 1-5
                feedback: 'AI rating completed'
            };
        }

        // Validate and clamp rating
        if (!ratingData.rating || typeof ratingData.rating !== 'number') {
            ratingData.rating = 3; // Default to 3 if invalid
        }
        ratingData.rating = Math.max(1, Math.min(5, Math.round(ratingData.rating)));

        // Ensure feedback exists
        if (!ratingData.feedback || typeof ratingData.feedback !== 'string') {
            ratingData.feedback = 'Rated by AI';
        }

        return ratingData;
    } catch (error) {
        console.error('Error rating content with Gemini:', error);
        // Return default rating on error
        return {
            rating: 3,
            feedback: 'Rating service temporarily unavailable'
        };
    }
}

/**
 * Check if content should be published based on rating threshold
 */
function shouldPublish(rating, threshold = 3) {
    return rating >= threshold;
}

module.exports = {
    rateContent,
    shouldPublish
};
