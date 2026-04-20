'use client'

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'

import {
  DEFAULT_THEME_ID,
  REGISTERED_THEMES,
  applyThemePreferenceToDocument,
  mergeThemePreference,
  resolveThemePreference,
  type GameId,
  type RegisteredTheme,
  type ThemePreference,
  type ThemePreferenceBase,
} from '../theme/index.js'
import { cx } from './utils.js'

/**
 * WAI-ARIA radio-group keyboard pattern for chip groups inside the panel.
 * Computes the next index for ArrowLeft/Right/Up/Down + Home/End and calls
 * `onMove` with it. The group is responsible for wiring tabIndex and focus.
 */
const handleRadioGroupKeyDown = (
  event: ReactKeyboardEvent<HTMLButtonElement>,
  length: number,
  currentIndex: number,
  onMove: (nextIndex: number) => void,
): void => {
  let nextIndex: number | null = null

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    nextIndex = (currentIndex + 1) % length
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    nextIndex = (currentIndex - 1 + length) % length
  } else if (event.key === 'Home') {
    nextIndex = 0
  } else if (event.key === 'End') {
    nextIndex = length - 1
  }

  if (nextIndex === null || nextIndex === currentIndex) return

  event.preventDefault()
  onMove(nextIndex)

  // Focus the new chip after React re-renders so the user lands on the newly
  // selected option (selection-follows-focus, standard radio-group behavior).
  const group = event.currentTarget.closest('[role="radiogroup"]')
  if (!group) return
  const nextButton = group.querySelectorAll<HTMLButtonElement>('[role="radio"]')[nextIndex]
  requestAnimationFrame(() => nextButton?.focus())
}

type ThemeSwitcherProps = {
  preference: ThemePreference | ThemePreferenceBase | null | undefined
  registeredThemes?: readonly RegisteredTheme[]
  anonymous?: boolean
  currentEmail?: string | null
  gameId?: GameId
  className?: string
  statusMessage?: string | null
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onChange: (next: ThemePreferenceBase, options?: { gameId?: GameId }) => void | Promise<void>
}

type ColorScheme = ThemePreferenceBase['colorScheme']

const COLOR_SCHEMES: ReadonlyArray<{ id: ColorScheme; label: string }> = [
  { id: 'system', label: 'Follow system' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
]

const colorSchemeLabel = (scheme: ColorScheme): string => {
  const match = COLOR_SCHEMES.find((entry) => entry.id === scheme)
  return match ? match.label : scheme
}

const isThemePreference = (
  value: ThemePreference | ThemePreferenceBase | null | undefined,
): value is ThemePreference => Boolean(value && 'overrides' in value)

const themeButtonLabel = (
  preference: ThemePreferenceBase,
  themes: readonly RegisteredTheme[],
): string => {
  const schemeLabel = colorSchemeLabel(preference.colorScheme)

  // Hide theme-family prefix until a second theme is registered.
  if (themes.length <= 1) return schemeLabel

  const activeTheme = themes.find((theme) => theme.id === preference.themeId)
  return `${activeTheme?.label ?? preference.themeId} · ${schemeLabel}`
}

export function ThemeSwitcher({
  preference,
  registeredThemes = REGISTERED_THEMES,
  anonymous = false,
  currentEmail,
  gameId,
  className,
  statusMessage,
  open,
  defaultOpen,
  onOpenChange,
  onChange,
}: ThemeSwitcherProps) {
  const resolved = useMemo(
    () => (
      isThemePreference(preference)
        ? resolveThemePreference(preference, gameId)
        : (preference ?? resolveThemePreference(null))
    ),
    [gameId, preference],
  )
  const [draft, setDraft] = useState<ThemePreferenceBase>(resolved)
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false)
  const resolvedOpen = open ?? internalOpen
  const componentId = useId()
  const panelId = `${componentId}-panel`
  const schemeLabelId = `${componentId}-scheme-label`
  const familyLabelId = `${componentId}-family-label`
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setDraft(resolved)
  }, [resolved])

  const setOpen = (next: boolean) => {
    if (typeof open !== 'boolean') setInternalOpen(next)
    onOpenChange?.(next)
  }

  const persist = (next: ThemePreferenceBase) => {
    setDraft(next)
    onChange(next, { gameId })
  }

  useEffect(() => {
    if (typeof document === 'undefined') return
    applyThemePreferenceToDocument(document.documentElement, draft, {
      gameId,
      systemPrefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
    })
  }, [draft, gameId])

  useEffect(() => {
    if (!resolvedOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
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
  }, [resolvedOpen])

  const showThemeFamily = registeredThemes.length > 1
  const triggerLabel = themeButtonLabel(draft, registeredThemes)

  return (
    <div ref={containerRef} className={cx('rg-card rg-theme-switcher', className)}>
      <button
        ref={triggerRef}
        type="button"
        className="rg-theme-switcher__trigger"
        aria-expanded={resolvedOpen}
        aria-haspopup="dialog"
        aria-controls={panelId}
        aria-label={`Theme: ${triggerLabel}. ${resolvedOpen ? 'Close' : 'Open'} picker.`}
        onClick={() => setOpen(!resolvedOpen)}
      >
        <span className="rg-kicker">Theme</span>
        <span className="rg-theme-switcher__value">{triggerLabel}</span>
      </button>

      {resolvedOpen ? (
        <div
          id={panelId}
          className="rg-theme-switcher__panel"
          role="dialog"
          aria-label="Theme switcher"
        >
          {showThemeFamily ? (() => {
            const familySelectedIndex = Math.max(
              0,
              registeredThemes.findIndex((theme) => theme.id === draft.themeId),
            )
            const selectFamily = (nextIndex: number) => {
              const target = registeredThemes[nextIndex]
              if (!target) return
              persist({
                ...draft,
                themeId: target.id ?? DEFAULT_THEME_ID,
                updatedAt: new Date().toISOString(),
              })
            }
            return (
              <div className="rg-theme-switcher__section">
                <p className="rg-kicker" id={familyLabelId}>Theme family</p>
                <div
                  className="rg-theme-switcher__options"
                  role="radiogroup"
                  aria-labelledby={familyLabelId}
                >
                  {registeredThemes.map((theme, index) => {
                    const selected = index === familySelectedIndex
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        tabIndex={selected ? 0 : -1}
                        className={cx('rg-chip', selected && 'is-selected')}
                        onClick={() => selectFamily(index)}
                        onKeyDown={(event) => handleRadioGroupKeyDown(
                          event,
                          registeredThemes.length,
                          index,
                          selectFamily,
                        )}
                      >
                        {theme.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })() : null}

          {(() => {
            const schemeSelectedIndex = Math.max(
              0,
              COLOR_SCHEMES.findIndex((entry) => entry.id === draft.colorScheme),
            )
            const selectScheme = (nextIndex: number) => {
              const target = COLOR_SCHEMES[nextIndex]
              if (!target) return
              persist({
                ...draft,
                colorScheme: target.id,
                updatedAt: new Date().toISOString(),
              })
            }
            return (
              <div className="rg-theme-switcher__section">
                <p className="rg-kicker" id={schemeLabelId}>Color scheme</p>
                <div
                  className="rg-theme-switcher__options"
                  role="radiogroup"
                  aria-labelledby={schemeLabelId}
                >
                  {COLOR_SCHEMES.map(({ id, label }, index) => {
                    const selected = index === schemeSelectedIndex
                    return (
                      <button
                        key={id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        tabIndex={selected ? 0 : -1}
                        className={cx('rg-chip', selected && 'is-selected')}
                        onClick={() => selectScheme(index)}
                        onKeyDown={(event) => handleRadioGroupKeyDown(
                          event,
                          COLOR_SCHEMES.length,
                          index,
                          selectScheme,
                        )}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {anonymous ? (
            <p className="rg-note">
              You&apos;re browsing as anonymous. Attach an email to keep this theme everywhere.
            </p>
          ) : currentEmail ? (
            <p className="rg-note">Theme is tied to {currentEmail}.</p>
          ) : null}

          {statusMessage ? <p className="rg-note" role="status">{statusMessage}</p> : null}
        </div>
      ) : null}
    </div>
  )
}

export const buildNextThemePreference = (
  current: ThemePreference | null | undefined,
  next: ThemePreferenceBase,
  gameId?: GameId,
): ThemePreference => mergeThemePreference(current, next, gameId)
