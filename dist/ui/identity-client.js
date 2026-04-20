'use client';
const EMAIL_CONFIRMATION_STORAGE_KEY = 'review-games:learner-email-confirmed';
const IDENTITY_FLOAT_DISMISSED_STORAGE_KEY = 'review-games:identity-float-dismissed';
const normalizeLearnerEmailKey = (value) => value.trim().toLowerCase();
const readConfirmationMap = (storage) => {
    const raw = storage.getItem(EMAIL_CONFIRMATION_STORAGE_KEY);
    if (!raw)
        return {};
    try {
        const parsed = JSON.parse(raw);
        return Object.fromEntries(Object.entries(parsed).filter((entry) => typeof entry[1] === 'boolean'));
    }
    catch {
        return {};
    }
};
export const readStoredEmailConfirmation = (learnerId, storage = window.localStorage) => {
    const normalizedLearnerId = normalizeLearnerEmailKey(learnerId);
    if (!normalizedLearnerId)
        return null;
    const stored = readConfirmationMap(storage);
    return typeof stored[normalizedLearnerId] === 'boolean'
        ? stored[normalizedLearnerId]
        : null;
};
export const writeStoredEmailConfirmation = (learnerId, confirmed, storage = window.localStorage) => {
    const normalizedLearnerId = normalizeLearnerEmailKey(learnerId);
    if (!normalizedLearnerId)
        return confirmed;
    const next = {
        ...readConfirmationMap(storage),
        [normalizedLearnerId]: confirmed,
    };
    storage.setItem(EMAIL_CONFIRMATION_STORAGE_KEY, JSON.stringify(next));
    return confirmed;
};
/**
 * Read whether the learner has already dismissed the IdentityFloat auto-open
 * on this browser. True means "don't auto-open again for anonymous users."
 *
 * Stored as a simple flag in localStorage keyed by
 * `review-games:identity-float-dismissed`.
 */
export const readIdentityFloatDismissed = (storage = window.localStorage) => {
    try {
        return storage.getItem(IDENTITY_FLOAT_DISMISSED_STORAGE_KEY) === 'true';
    }
    catch {
        return false;
    }
};
/**
 * Mark the IdentityFloat as dismissed for this browser. Call from the
 * composite wrapper whenever the user closes the float (via toggle, Escape,
 * or outside-click). Subsequent visits will not auto-open the float for
 * anonymous users.
 */
export const markIdentityFloatDismissed = (storage = window.localStorage) => {
    try {
        storage.setItem(IDENTITY_FLOAT_DISMISSED_STORAGE_KEY, 'true');
    }
    catch {
        // no-op: storage unavailable or quota exceeded; next visit re-opens
    }
};
/**
 * Clear the dismissed flag — e.g., for tests or if a future "reset" action
 * wants to surface the identity prompt again.
 */
export const clearIdentityFloatDismissed = (storage = window.localStorage) => {
    try {
        storage.removeItem(IDENTITY_FLOAT_DISMISSED_STORAGE_KEY);
    }
    catch {
        // no-op
    }
};
//# sourceMappingURL=identity-client.js.map