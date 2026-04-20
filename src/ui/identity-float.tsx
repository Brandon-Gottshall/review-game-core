'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'

import { cx } from './utils.js'

type IdentityFloatProps = {
  currentEmail?: string | null
  message?: string | null
  placeholder?: string
  description?: string
  saveLabel?: string
  updateLabel?: string
  anonymousLabel?: string
  anonymousNote?: string
  className?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  requireEmailConfirmation?: boolean
  onConfirmEmail?: (email: string) => void | Promise<void>
  emailConfirmed?: boolean
  onSave: (email: string) => void | Promise<void>
  onGoAnonymous: () => void | Promise<void>
}

export function IdentityFloat({
  currentEmail,
  message,
  placeholder = 'you@valdosta.edu',
  description = 'Attach one email so your theme and progress follow you across review games.',
  saveLabel = 'Save email',
  updateLabel = 'Update email',
  anonymousLabel = 'Use anonymous mode',
  anonymousNote = 'Anonymous mode keeps your theme and progress on this browser only.',
  className,
  open,
  defaultOpen,
  onOpenChange,
  requireEmailConfirmation = true,
  onConfirmEmail,
  emailConfirmed,
  onSave,
  onGoAnonymous,
}: IdentityFloatProps) {
  const [draftEmail, setDraftEmail] = useState(currentEmail ?? '')
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? !currentEmail)
  const [internalEmailConfirmed, setInternalEmailConfirmed] = useState(true)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const resolvedOpen = open ?? internalOpen
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setDraftEmail(currentEmail ?? '')
  }, [currentEmail])

  useEffect(() => {
    if (!requireEmailConfirmation) {
      setPendingEmail(null)
      setInternalEmailConfirmed(true)
      return
    }

    if (!currentEmail) {
      setPendingEmail(null)
      setInternalEmailConfirmed(true)
      return
    }

    if (typeof emailConfirmed === 'boolean') {
      setPendingEmail(emailConfirmed ? null : currentEmail)
      setInternalEmailConfirmed(emailConfirmed)
      return
    }

    const stillPending = pendingEmail === currentEmail ? pendingEmail : null
    setPendingEmail(stillPending)
    setInternalEmailConfirmed(!stillPending)
  }, [currentEmail, emailConfirmed, pendingEmail, requireEmailConfirmation])

  const setOpen = (next: boolean) => {
    if (typeof open !== 'boolean') setInternalOpen(next)
    onOpenChange?.(next)
  }

  const confirmationPending = requireEmailConfirmation
    && Boolean(
      pendingEmail
      && draftEmail.trim() === pendingEmail
      && (typeof emailConfirmed === 'boolean' ? !emailConfirmed : !internalEmailConfirmed),
    )

  useEffect(() => {
    if (!resolvedOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (confirmationPending) return
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current) return
      if (event.target instanceof Node && containerRef.current.contains(event.target)) return
      setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('pointerdown', handlePointerDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmationPending, resolvedOpen])

  useEffect(() => {
    if (!resolvedOpen || !confirmationPending) return
    confirmButtonRef.current?.focus()
  }, [confirmationPending, resolvedOpen])

  const trimmedDraft = draftEmail.trim()
  const isDirty = trimmedDraft !== (currentEmail ?? '')
  const canSubmit = isDirty && trimmedDraft.length > 0

  useEffect(() => {
    if (!pendingEmail) return
    if (!draftEmail.trim() || draftEmail.trim() === pendingEmail) return
    setPendingEmail(null)
    if (typeof emailConfirmed !== 'boolean') {
      setInternalEmailConfirmed(true)
    }
  }, [draftEmail, emailConfirmed, pendingEmail])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!canSubmit) return
    try {
      await onSave(trimmedDraft)
      if (!requireEmailConfirmation) {
        if (typeof emailConfirmed !== 'boolean') {
          setInternalEmailConfirmed(true)
        }
        setPendingEmail(null)
        return
      }

      if (typeof emailConfirmed !== 'boolean') {
        setInternalEmailConfirmed(false)
      }
      setPendingEmail(trimmedDraft)
    } catch {
      // Consumers surface the visible error state via `message`.
    }
  }

  const primaryLabel = currentEmail && isDirty ? updateLabel : saveLabel
  const triggerStatus = currentEmail ?? 'Anonymous'
  const handleConfirmEmail = async () => {
    if (!pendingEmail) return

    try {
      await onConfirmEmail?.(pendingEmail)
      if (typeof emailConfirmed !== 'boolean') {
        setInternalEmailConfirmed(true)
      }
      setPendingEmail(null)
    } catch {
      // Consumers surface the visible error state via `message`.
    }
  }

  return (
    <div
      ref={containerRef}
      className={cx('rg-card rg-identity-float', className)}
      aria-label="Learner association"
    >
      <button
        ref={triggerRef}
        type="button"
        className={cx('rg-identity-float__toggle', !currentEmail && 'is-anonymous')}
        aria-expanded={resolvedOpen}
        aria-label={`Learner: ${triggerStatus}. ${resolvedOpen ? 'Close' : 'Open'} learner association.`}
        onClick={() => setOpen(!resolvedOpen)}
      >
        <span className="rg-identity-float__icon" aria-hidden="true">✉</span>
        <span>{triggerStatus}</span>
      </button>

      {message ? <p className="rg-note" role="status">{message}</p> : null}

      {resolvedOpen ? (
        <form className="rg-identity-float__panel" onSubmit={handleSubmit} noValidate>
          <p className="rg-kicker">Learner association</p>
          <p className="rg-note">{description}</p>
          {confirmationPending && pendingEmail ? (
            <>
              <div className="rg-identity-float__confirm" role="group" aria-label="Confirm saved email">
                <p className="rg-note">Is {pendingEmail} correct?</p>
                <div className="rg-button-row">
                  <button
                    ref={confirmButtonRef}
                    type="button"
                    className="rg-button rg-button--primary"
                    onClick={() => void handleConfirmEmail()}
                  >
                    Yes, save
                  </button>
                  <button
                    type="button"
                    className="rg-button rg-button--secondary"
                    onClick={() => {
                      const currentPendingEmail = pendingEmail
                      setDraftEmail(currentPendingEmail)
                      requestAnimationFrame(() => {
                        const input = containerRef.current?.querySelector<HTMLInputElement>('input[name=\"email\"]')
                        input?.focus()
                      })
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
              <p
                role="status"
                aria-live="polite"
                style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: 0,
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap',
                  border: 0,
                }}
              >
                Saved {pendingEmail}. Confirm it&apos;s correct.
              </p>
            </>
          ) : null}
          <input
            className="rg-input"
            type="email"
            name="email"
            autoComplete="email"
            value={draftEmail}
            onChange={(event) => setDraftEmail(event.target.value)}
            placeholder={placeholder}
            aria-label="Learner email"
          />
          <div className="rg-button-row">
            <button
              type="submit"
              className="rg-button rg-button--primary"
              disabled={!canSubmit}
            >
              {primaryLabel}
            </button>
            <button
              type="button"
              className="rg-button rg-button--secondary"
              onClick={() => void onGoAnonymous()}
            >
              {anonymousLabel}
            </button>
          </div>
          <p className="rg-note">
            {currentEmail ? `Active learner: ${currentEmail}` : anonymousNote}
          </p>
        </form>
      ) : null}
    </div>
  )
}
