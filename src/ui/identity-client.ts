'use client'

type IdentityConfirmationStorage = Pick<Storage, 'getItem' | 'setItem'>
type IdentityDismissedStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

const EMAIL_CONFIRMATION_STORAGE_KEY = 'review-games:learner-email-confirmed'
const IDENTITY_FLOAT_DISMISSED_STORAGE_KEY = 'review-games:identity-float-dismissed'

type StoredEmailConfirmations = Record<string, boolean>

const normalizeLearnerEmailKey = (value: string): string => value.trim().toLowerCase()

const readConfirmationMap = (
  storage: IdentityConfirmationStorage,
): StoredEmailConfirmations => {
  const raw = storage.getItem(EMAIL_CONFIRMATION_STORAGE_KEY)
  if (!raw) return {}

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return Object.fromEntries(
      Object.entries(parsed).filter((entry): entry is [string, boolean] => typeof entry[1] === 'boolean'),
    )
  } catch {
    return {}
  }
}

export const readStoredEmailConfirmation = (
  learnerId: string,
  storage: IdentityConfirmationStorage = window.localStorage,
): boolean | null => {
  const normalizedLearnerId = normalizeLearnerEmailKey(learnerId)
  if (!normalizedLearnerId) return null

  const stored = readConfirmationMap(storage)
  return typeof stored[normalizedLearnerId] === 'boolean'
    ? stored[normalizedLearnerId]
    : null
}

export const writeStoredEmailConfirmation = (
  learnerId: string,
  confirmed: boolean,
  storage: IdentityConfirmationStorage = window.localStorage,
): boolean => {
  const normalizedLearnerId = normalizeLearnerEmailKey(learnerId)
  if (!normalizedLearnerId) return confirmed

  const next = {
    ...readConfirmationMap(storage),
    [normalizedLearnerId]: confirmed,
  }
  storage.setItem(EMAIL_CONFIRMATION_STORAGE_KEY, JSON.stringify(next))
  return confirmed
}

/**
 * Read whether the learner has already dismissed the IdentityFloat auto-open
 * on this browser. True means "don't auto-open again for anonymous users."
 *
 * Stored as a simple flag in localStorage keyed by
 * `review-games:identity-float-dismissed`.
 */
export const readIdentityFloatDismissed = (
  storage: IdentityDismissedStorage = window.localStorage,
): boolean => {
  try {
    return storage.getItem(IDENTITY_FLOAT_DISMISSED_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * Mark the IdentityFloat as dismissed for this browser. Call from the
 * composite wrapper whenever the user closes the float (via toggle, Escape,
 * or outside-click). Subsequent visits will not auto-open the float for
 * anonymous users.
 */
export const markIdentityFloatDismissed = (
  storage: IdentityDismissedStorage = window.localStorage,
): void => {
  try {
    storage.setItem(IDENTITY_FLOAT_DISMISSED_STORAGE_KEY, 'true')
  } catch {
    // no-op: storage unavailable or quota exceeded; next visit re-opens
  }
}

/**
 * Clear the dismissed flag — e.g., for tests or if a future "reset" action
 * wants to surface the identity prompt again.
 */
export const clearIdentityFloatDismissed = (
  storage: IdentityDismissedStorage = window.localStorage,
): void => {
  try {
    storage.removeItem(IDENTITY_FLOAT_DISMISSED_STORAGE_KEY)
  } catch {
    // no-op
  }
}
