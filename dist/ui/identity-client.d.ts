type IdentityConfirmationStorage = Pick<Storage, 'getItem' | 'setItem'>;
type IdentityDismissedStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export declare const readStoredEmailConfirmation: (learnerId: string, storage?: IdentityConfirmationStorage) => boolean | null;
export declare const writeStoredEmailConfirmation: (learnerId: string, confirmed: boolean, storage?: IdentityConfirmationStorage) => boolean;
/**
 * Read whether the learner has already dismissed the IdentityFloat auto-open
 * on this browser. True means "don't auto-open again for anonymous users."
 *
 * Stored as a simple flag in localStorage keyed by
 * `review-games:identity-float-dismissed`.
 */
export declare const readIdentityFloatDismissed: (storage?: IdentityDismissedStorage) => boolean;
/**
 * Mark the IdentityFloat as dismissed for this browser. Call from the
 * composite wrapper whenever the user closes the float (via toggle, Escape,
 * or outside-click). Subsequent visits will not auto-open the float for
 * anonymous users.
 */
export declare const markIdentityFloatDismissed: (storage?: IdentityDismissedStorage) => void;
/**
 * Clear the dismissed flag — e.g., for tests or if a future "reset" action
 * wants to surface the identity prompt again.
 */
export declare const clearIdentityFloatDismissed: (storage?: IdentityDismissedStorage) => void;
export {};
//# sourceMappingURL=identity-client.d.ts.map