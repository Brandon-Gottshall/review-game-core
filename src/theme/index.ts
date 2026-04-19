import { z } from 'zod'

export type GameId =
  | 'math-1111-review-game'
  | 'stats-exam-prep-game'
  | 'astr-unit-1-review-game'
  | 'cs-unit-1-review-game'

export type ThemeId = 'default'
export type ColorSchemePreference = 'light' | 'dark' | 'system'

export type ThemePreferenceBase = {
  themeId: ThemeId
  colorScheme: ColorSchemePreference
  updatedAt: string
}

export type ThemePreference = ThemePreferenceBase & {
  overrides?: Partial<Record<GameId, Partial<ThemePreferenceBase>>>
}

export type RegisteredTheme = {
  id: ThemeId
  label: string
  description?: string
}

export const GAME_IDS = [
  'math-1111-review-game',
  'stats-exam-prep-game',
  'astr-unit-1-review-game',
  'cs-unit-1-review-game',
] as const satisfies readonly GameId[]

export const DEFAULT_THEME_ID: ThemeId = 'default'
export const THEME_PREFERENCE_STORAGE_KEY = 'review-games:theme-preference'
export const THEME_ATTRIBUTE = 'data-theme'
export const THEME_ID_ATTRIBUTE = 'data-theme-id'

export const REGISTERED_THEMES: readonly RegisteredTheme[] = [
  {
    id: DEFAULT_THEME_ID,
    label: 'Review Games Default',
    description: 'The shared workspace theme from review-game-core.',
  },
] as const

export const gameIdSchema = z.enum(GAME_IDS)
export const colorSchemePreferenceSchema = z.enum(['light', 'dark', 'system'])
export const themePreferenceBaseSchema = z.object({
  themeId: z.literal(DEFAULT_THEME_ID),
  colorScheme: colorSchemePreferenceSchema,
  updatedAt: z.string().min(1),
})

export const themePreferenceSchema: z.ZodType<ThemePreference> = themePreferenceBaseSchema.extend({
  overrides: z.record(gameIdSchema, themePreferenceBaseSchema.partial())
    .transform((value) => value as Partial<Record<GameId, Partial<ThemePreferenceBase>>>)
    .optional(),
})

const buildDefaultThemePreferenceBase = (): ThemePreferenceBase => ({
  themeId: DEFAULT_THEME_ID,
  colorScheme: 'system',
  updatedAt: new Date(0).toISOString(),
})

export const isGameId = (value: string): value is GameId => (
  GAME_IDS.includes(value as GameId)
)

export const normalizeThemePreference = (value: unknown): ThemePreference | null => {
  const parsed = themePreferenceSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

export const resolveThemePreference = (
  preference: ThemePreference | null | undefined,
  gameId?: GameId,
): ThemePreferenceBase => {
  const fallback = buildDefaultThemePreferenceBase()
  if (!preference) return fallback

  const base: ThemePreferenceBase = {
    themeId: preference.themeId ?? fallback.themeId,
    colorScheme: preference.colorScheme ?? fallback.colorScheme,
    updatedAt: preference.updatedAt ?? fallback.updatedAt,
  }

  if (!gameId) return base
  const override = preference.overrides?.[gameId]
  if (!override) return base

  return {
    themeId: override.themeId ?? base.themeId,
    colorScheme: override.colorScheme ?? base.colorScheme,
    updatedAt: override.updatedAt ?? base.updatedAt,
  }
}

export const resolveAppliedColorScheme = (
  colorScheme: ColorSchemePreference,
  systemPrefersDark: boolean,
): 'light' | 'dark' => {
  if (colorScheme === 'system') {
    return systemPrefersDark ? 'dark' : 'light'
  }

  return colorScheme
}

export const mergeThemePreference = (
  current: ThemePreference | null | undefined,
  next: ThemePreferenceBase,
  gameId?: GameId,
): ThemePreference => {
  const normalizedCurrent = current ?? {
    ...buildDefaultThemePreferenceBase(),
    overrides: {} as Partial<Record<GameId, Partial<ThemePreferenceBase>>>,
  }

  if (!gameId) {
    return {
      themeId: next.themeId,
      colorScheme: next.colorScheme,
      updatedAt: next.updatedAt,
      overrides: normalizedCurrent.overrides,
    }
  }

  return {
    themeId: normalizedCurrent.themeId,
    colorScheme: normalizedCurrent.colorScheme,
    updatedAt: normalizedCurrent.updatedAt,
    overrides: {
      ...(normalizedCurrent.overrides ?? {}),
      [gameId]: next,
    },
  }
}

export const readStoredThemePreference = (
  storage: Pick<Storage, 'getItem'>,
  storageKey = THEME_PREFERENCE_STORAGE_KEY,
): ThemePreference | null => {
  const raw = storage.getItem(storageKey)
  if (!raw) return null

  try {
    return normalizeThemePreference(JSON.parse(raw))
  } catch {
    return null
  }
}

export const writeStoredThemePreference = (
  storage: Pick<Storage, 'setItem'>,
  preference: ThemePreference,
  storageKey = THEME_PREFERENCE_STORAGE_KEY,
): ThemePreference => {
  storage.setItem(storageKey, JSON.stringify(preference))
  return preference
}

export const applyThemePreferenceToDocument = (
  root: Pick<HTMLElement, 'dataset' | 'style'>,
  preference: ThemePreference | ThemePreferenceBase | null | undefined,
  options: {
    gameId?: GameId
    systemPrefersDark?: boolean
  } = {},
): void => {
  const resolved = 'overrides' in (preference ?? {})
    ? resolveThemePreference(preference as ThemePreference | null | undefined, options.gameId)
    : (preference ?? buildDefaultThemePreferenceBase())

  const applied = resolveAppliedColorScheme(
    resolved.colorScheme,
    options.systemPrefersDark ?? false,
  )

  root.dataset.theme = applied
  root.dataset.themeId = resolved.themeId
  root.style.colorScheme = applied
}

export const buildThemeInitScript = (options: {
  gameId?: GameId
  storageKey?: string
} = {}): string => {
  const storageKey = options.storageKey ?? THEME_PREFERENCE_STORAGE_KEY
  const gameId = options.gameId ? `'${options.gameId}'` : 'undefined'

  return `
    (function () {
      try {
        var raw = window.localStorage.getItem('${storageKey}');
        var parsed = raw ? JSON.parse(raw) : null;
        var base = parsed && typeof parsed === 'object'
          ? {
              themeId: parsed.themeId === '${DEFAULT_THEME_ID}' ? parsed.themeId : '${DEFAULT_THEME_ID}',
              colorScheme: parsed.colorScheme === 'light' || parsed.colorScheme === 'dark' || parsed.colorScheme === 'system'
                ? parsed.colorScheme
                : 'system',
              updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '${new Date(0).toISOString()}'
            }
          : {
              themeId: '${DEFAULT_THEME_ID}',
              colorScheme: 'system',
              updatedAt: '${new Date(0).toISOString()}'
            };
        var override = ${gameId} && parsed && parsed.overrides ? parsed.overrides[${gameId}] : null;
        var resolved = override && typeof override === 'object'
          ? {
              themeId: override.themeId === '${DEFAULT_THEME_ID}' ? override.themeId : base.themeId,
              colorScheme: override.colorScheme === 'light' || override.colorScheme === 'dark' || override.colorScheme === 'system'
                ? override.colorScheme
                : base.colorScheme,
              updatedAt: typeof override.updatedAt === 'string' ? override.updatedAt : base.updatedAt
            }
          : base;
        var applied = resolved.colorScheme === 'system'
          ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
          : resolved.colorScheme;
        var root = document.documentElement;
        root.dataset.theme = applied;
        root.dataset.themeId = resolved.themeId;
        root.style.colorScheme = applied;
      } catch (_error) {
        var fallback = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.dataset.theme = fallback;
        document.documentElement.dataset.themeId = '${DEFAULT_THEME_ID}';
        document.documentElement.style.colorScheme = fallback;
      }
    })();
  `.trim()
}
