'use client'

import {
  applyThemePreferenceToDocument,
  mergeThemePreference,
  readStoredThemePreference,
  writeStoredThemePreference,
  type GameId,
  type ThemePreference,
  type ThemePreferenceBase,
} from '../theme/index.js'

type ThemeStorage = Pick<Storage, 'getItem' | 'setItem'>

const getSystemPrefersDark = (): boolean => (
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
)

export const readBrowserThemePreference = (
  storage: ThemeStorage = window.localStorage,
): ThemePreference | null => readStoredThemePreference(storage)

export const persistThemePreferenceLocally = (
  next: ThemePreference,
  options: {
    gameId?: GameId
    storage?: ThemeStorage
    root?: HTMLElement
  } = {},
): ThemePreference => {
  const storage = options.storage ?? window.localStorage
  const root = options.root ?? document.documentElement
  writeStoredThemePreference(storage, next)
  applyThemePreferenceToDocument(root, next, {
    gameId: options.gameId,
    systemPrefersDark: getSystemPrefersDark(),
  })
  return next
}

export const applyThemeChange = (
  current: ThemePreference | null | undefined,
  next: ThemePreferenceBase,
  options: {
    gameId?: GameId
    storage?: ThemeStorage
    root?: HTMLElement
  } = {},
): ThemePreference => {
  const merged = mergeThemePreference(current, next, options.gameId)
  return persistThemePreferenceLocally(merged, options)
}

export const migrateStoredThemePreferenceToLearner = async (
  learnerId: string,
  saveRemote: (learnerId: string, preference: ThemePreference) => Promise<void>,
  storage: ThemeStorage = window.localStorage,
): Promise<ThemePreference | null> => {
  const stored = readStoredThemePreference(storage)
  if (!stored) return null
  await saveRemote(learnerId, stored)
  return stored
}
