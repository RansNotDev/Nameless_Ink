/**
 * Shared helpers for Vercel Node serverless handlers (JSON body, serialization).
 */

/**
 * Return parsed JSON body — handles Buffer, string, or pre-parsed object from Vercel.
 */
function getJsonBody(req) {
    const raw = req.body;
    if (raw == null || raw === '') {
        return {};
    }
    if (Buffer.isBuffer(raw)) {
        try {
            const s = raw.toString('utf8');
            return s ? JSON.parse(s) : {};
        } catch {
            return {};
        }
    }
    if (typeof raw === 'string') {
        try {
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    }
    if (typeof raw === 'object') {
        return raw;
    }
    return {};
}

/**
 * Convert Firestore Timestamp (or plain ISO string / millis) to ISO string for JSON APIs.
 */
function timestampToIso(value) {
    if (value == null) {
        return null;
    }
    if (typeof value === 'string') {
        return value;
    }
    if (typeof value.toDate === 'function') {
        return value.toDate().toISOString();
    }
    if (typeof value._seconds === 'number') {
        return new Date(value._seconds * 1000).toISOString();
    }
    if (typeof value.seconds === 'number') {
        return new Date(value.seconds * 1000).toISOString();
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    return null;
}

/**
 * Consistent JSON error responses from API handlers.
 */
function sendApiCatch(res, error, logLabel) {
    console.error(`Error in ${logLabel}:`, error);
    const msg = error instanceof Error ? error.message : String(error);
    const looksLikeSetup =
        /LOCAL_DEV|FIRESTORE_PROJECT_ID|not configured|Could not load the default credentials|ENOENT|does not exist|Could not refresh access token|The query requires an index|FAILED_PRECONDITION/i.test(
            msg
        );
    const status = looksLikeSetup ? 503 : 500;
    let clientMsg = msg.slice(0, 480);
    if (status === 500 && process.env.VERCEL === '1') {
        clientMsg = 'Internal server error. Please try again later.';
    }
    return res.status(status).json({ success: false, error: clientMsg });
}

module.exports = {
    getJsonBody,
    timestampToIso,
    sendApiCatch,
};
