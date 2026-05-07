/**
 * Database Handler Utility
 * Firestore in production; in-memory store when LOCAL_DEV=true
 */

const { Firestore } = require('@google-cloud/firestore');
const { randomUUID } = require('crypto');
const { timestampToIso } = require('./api-helpers');
const { resolveFirestoreProjectId } = require('./server-env');

let db = null;

const mockQuotes = [];
const mockComments = [];

function isLocalDev() {
    return String(process.env.LOCAL_DEV || '').toLowerCase() === 'true';
}

function serializeQuoteDoc(doc) {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        timestamp: timestampToIso(data.timestamp) || data.timestamp,
    };
}

function serializeCommentDoc(doc) {
    const data = doc.data();
    return {
        id: doc.id,
        ...data,
        timestamp: timestampToIso(data.timestamp) || data.timestamp,
    };
}

/**
 * Initialize Firestore connection
 */
function initFirestore() {
    if (db) {
        return db;
    }

    const projectId = resolveFirestoreProjectId();
    const keyFilename = process.env.FIRESTORE_KEY_FILE;

    if (!projectId) {
        throw new Error(
            'Firestore project id missing: set FIRESTORE_PROJECT_ID or GOOGLE_CLOUD_PROJECT in .env, or LOCAL_DEV=true.'
        );
    }

    const config = { projectId };

    if (keyFilename) {
        config.keyFilename = keyFilename;
    }

    db = new Firestore(config);
    return db;
}

/**
 * Save a quote to Firestore or mock store
 */
async function saveQuote(quoteData) {
    if (isLocalDev()) {
        const id = randomUUID();
        mockQuotes.unshift({
            id,
            text: quoteData.text,
            rating: quoteData.rating,
            published: quoteData.published,
            timestamp: new Date().toISOString(),
            commentCount: 0,
        });
        return id;
    }

    const firestore = initFirestore();
    const quotesRef = firestore.collection('quotes');

    const quote = {
        text: quoteData.text,
        rating: quoteData.rating,
        published: quoteData.published,
        timestamp: Firestore.FieldValue.serverTimestamp(),
        commentCount: 0,
    };

    const docRef = await quotesRef.add(quote);
    return docRef.id;
}

/**
 * Get all published quotes
 */
async function getPublishedQuotes() {
    if (isLocalDev()) {
        return mockQuotes
            .filter((q) => q.published)
            .slice()
            .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
    }

    const firestore = initFirestore();
    const quotesRef = firestore.collection('quotes');

    const snapshot = await quotesRef
        .where('published', '==', true)
        .orderBy('timestamp', 'desc')
        .get();

    const quotes = [];
    snapshot.forEach((doc) => {
        quotes.push(serializeQuoteDoc(doc));
    });

    return quotes;
}

/**
 * Save a comment to Firestore or mock store
 */
async function saveComment(commentData) {
    if (isLocalDev()) {
        const id = randomUUID();
        const comment = {
            id,
            quoteId: commentData.quoteId,
            text: commentData.text,
            rating: commentData.rating,
            published: commentData.published,
            timestamp: new Date().toISOString(),
        };
        mockComments.unshift(comment);

        if (comment.published) {
            await incrementCommentCount(commentData.quoteId);
        }

        return id;
    }

    const firestore = initFirestore();
    const commentsRef = firestore.collection('comments');

    const comment = {
        quoteId: commentData.quoteId,
        text: commentData.text,
        rating: commentData.rating,
        published: commentData.published,
        timestamp: Firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await commentsRef.add(comment);

    if (comment.published) {
        await incrementCommentCount(commentData.quoteId);
    }

    return docRef.id;
}

/**
 * Get comments for a specific quote
 */
async function getCommentsForQuote(quoteId) {
    if (isLocalDev()) {
        return mockComments
            .filter((c) => c.quoteId === quoteId && c.published)
            .slice()
            .sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
    }

    const firestore = initFirestore();
    const commentsRef = firestore.collection('comments');

    const snapshot = await commentsRef
        .where('quoteId', '==', quoteId)
        .where('published', '==', true)
        .orderBy('timestamp', 'desc')
        .get();

    const comments = [];
    snapshot.forEach((doc) => {
        comments.push(serializeCommentDoc(doc));
    });

    return comments;
}

/**
 * Increment comment count for a quote
 */
async function incrementCommentCount(quoteId) {
    if (isLocalDev()) {
        const q = mockQuotes.find((x) => x.id === quoteId);
        if (q) {
            q.commentCount = (q.commentCount || 0) + 1;
        }
        return;
    }

    const firestore = initFirestore();
    const quoteRef = firestore.collection('quotes').doc(quoteId);

    try {
        await quoteRef.update({
            commentCount: Firestore.FieldValue.increment(1),
        });
    } catch (error) {
        console.error('Error incrementing comment count:', error);
    }
}

/**
 * Get comment count for a quote (for display)
 */
async function getCommentCount(quoteId) {
    if (isLocalDev()) {
        return mockComments.filter((c) => c.quoteId === quoteId && c.published).length;
    }

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
    getCommentCount,
};
