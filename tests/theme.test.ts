import { describe, expect, it } from 'vitest'

import {
  DEFAULT_THEME_ID,
  buildThemeInitScript,
  mergeThemePreference,
  readStoredThemePreference,
  resolveAppliedColorScheme,
  resolveThemePreference,
  writeStoredThemePreference,
} from '../src/theme/index.js'

describe('theme preferences', () => {
  it('resolves base and per-game overrides', () => {
    const preference = mergeThemePreference(null, {
      themeId: DEFAULT_THEME_ID,
      colorScheme: 'dark',
      updatedAt: '2026-04-19T12:00:00.000Z',
    })
    const withOverride = mergeThemePreference(preference, {
      themeId: DEFAULT_THEME_ID,
      colorScheme: 'light',
      updatedAt: '2026-04-19T13:00:00.000Z',
    }, 'stats-exam-prep-game')

    expect(resolveThemePreference(withOverride)).toEqual({
      themeId: DEFAULT_THEME_ID,
      colorScheme: 'dark',
      updatedAt: '2026-04-19T12:00:00.000Z',
    })
    expect(resolveThemePreference(withOverride, 'stats-exam-prep-game')).toEqual({
      themeId: DEFAULT_THEME_ID,
      colorScheme: 'light',
      updatedAt: '2026-04-19T13:00:00.000Z',
    })
  })

  it('reads and writes the shared local storage envelope', () => {
    const storage = new Map<string, string>()
    const target = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value)
      },
    }

    writeStoredThemePreference(target, {
      themeId: DEFAULT_THEME_ID,
      colorScheme: 'system',
      updatedAt: '2026-04-19T12:00:00.000Z',
    })

    expect(readStoredThemePreference(target)).toEqual({
      themeId: DEFAULT_THEME_ID,
      colorScheme: 'system',
      updatedAt: '2026-04-19T12:00:00.000Z',
    })
  })

  it('resolves system mode and produces an init script', () => {
    expect(resolveAppliedColorScheme('system', true)).toBe('dark')
    expect(buildThemeInitScript({ gameId: 'math-1111-review-game' })).toContain("review-games:theme-preference")
    expect(buildThemeInitScript({ gameId: 'math-1111-review-game' })).toContain("math-1111-review-game")
  })
})
