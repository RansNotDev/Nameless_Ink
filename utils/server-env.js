/**
 * Server-side env checks (no dependency on db-handler to avoid circular imports).
 */

function isLocalDev() {
    return String(process.env.LOCAL_DEV || '').toLowerCase() === 'true';
}

/**
 * Resolved GCP project id for Firestore (same lookup everywhere).
 */
function resolveFirestoreProjectId() {
    const raw =
        process.env.FIRESTORE_PROJECT_ID ||
        process.env.GOOGLE_CLOUD_PROJECT ||
        process.env.GCLOUD_PROJECT ||
        '';
    return String(raw).trim();
}

/**
 * When not in local mock mode, Firestore project id must be set.
 */
function assertDatastoreConfigured() {
    if (isLocalDev()) {
        return;
    }
    const id = resolveFirestoreProjectId();
    if (!id) {
        throw new Error(
            'Firestore is not configured: set FIRESTORE_PROJECT_ID (or GOOGLE_CLOUD_PROJECT) in .env, or set LOCAL_DEV=true for in-memory mock data without Firestore.'
        );
    }
}

module.exports = {
    isLocalDev,
    resolveFirestoreProjectId,
    assertDatastoreConfigured,
};
