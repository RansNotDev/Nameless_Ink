/**
 * Database Handler Utility
 * Handles Firestore operations
 */

const { Firestore } = require('@google-cloud/firestore');

let db = null;

/**
 * Initialize Firestore connection
 */
function initFirestore() {
    if (db) {
        return db;
    }

    try {
        const projectId = process.env.FIRESTORE_PROJECT_ID;
        const keyFilename = process.env.FIRESTORE_KEY_FILE;

        if (!projectId) {
            throw new Error('FIRESTORE_PROJECT_ID is not set in environment variables');
        }

        const config = { projectId };
        
        // Use service account key file if provided
        if (keyFilename) {
            config.keyFilename = keyFilename;
        }

        db = new Firestore(config);
        return db;
    } catch (error) {
        console.error('Error initializing Firestore:', error);
        throw error;
    }
}

/**
 * Save a quote to Firestore
 */
async function saveQuote(quoteData) {
    const firestore = initFirestore();
    const quotesRef = firestore.collection('quotes');

    const quote = {
        text: quoteData.text,
        rating: quoteData.rating,
        published: quoteData.published,
        timestamp: Firestore.FieldValue.serverTimestamp(),
        commentCount: 0
    };

    const docRef = await quotesRef.add(quote);
    return docRef.id;
}

/**
 * Get all published quotes
 */
async function getPublishedQuotes() {
    const firestore = initFirestore();
    const quotesRef = firestore.collection('quotes');

    try {
        const snapshot = await quotesRef
            .where('published', '==', true)
            .orderBy('timestamp', 'desc')
            .get();

        const quotes = [];
        snapshot.forEach(doc => {
            quotes.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return quotes;
    } catch (error) {
        console.error('Error getting quotes:', error);
        throw error;
    }
}

/**
 * Save a comment to Firestore
 */
async function saveComment(commentData) {
    const firestore = initFirestore();
    const commentsRef = firestore.collection('comments');

    const comment = {
        quoteId: commentData.quoteId,
        text: commentData.text,
        rating: commentData.rating,
        published: commentData.published,
        timestamp: Firestore.FieldValue.serverTimestamp()
    };

    const docRef = await commentsRef.add(comment);

    // Update comment count on quote if published
    if (comment.published) {
        await incrementCommentCount(commentData.quoteId);
    }

    return docRef.id;
}

/**
 * Get comments for a specific quote
 */
async function getCommentsForQuote(quoteId) {
    const firestore = initFirestore();
    const commentsRef = firestore.collection('comments');

    try {
        const snapshot = await commentsRef
            .where('quoteId', '==', quoteId)
            .where('published', '==', true)
            .orderBy('timestamp', 'desc')
            .get();

        const comments = [];
        snapshot.forEach(doc => {
            comments.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return comments;
    } catch (error) {
        console.error('Error getting comments:', error);
        throw error;
    }
}

/**
 * Increment comment count for a quote
 */
async function incrementCommentCount(quoteId) {
    const firestore = initFirestore();
    const quoteRef = firestore.collection('quotes').doc(quoteId);

    try {
        await quoteRef.update({
            commentCount: Firestore.FieldValue.increment(1)
        });
    } catch (error) {
        console.error('Error incrementing comment count:', error);
        // Don't throw - this is not critical
    }
}

/**
 * Get comment count for a quote (for display)
 */
async function getCommentCount(quoteId) {
    const firestore = initFirestore();
    const commentsRef = firestore.collection('comments');

    try {
        const snapshot = await commentsRef
            .where('quoteId', '==', quoteId)
            .where('published', '==', true)
            .get();

        return snapshot.size;
    } catch (error) {
        console.error('Error getting comment count:', error);
        return 0;
    }
}

module.exports = {
    saveQuote,
    getPublishedQuotes,
    saveComment,
    getCommentsForQuote,
    incrementCommentCount,
    getCommentCount
};
