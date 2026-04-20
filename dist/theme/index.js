import { z } from 'zod';
export const GAME_IDS = [
    'math-1111-review-game',
    'stats-exam-prep-game',
    'astr-unit-1-review-game',
    'cs-unit-1-review-game',
];
export const DEFAULT_THEME_ID = 'default';
export const THEME_PREFERENCE_STORAGE_KEY = 'review-games:theme-preference';
export const THEME_ATTRIBUTE = 'data-theme';
export const THEME_ID_ATTRIBUTE = 'data-theme-id';
export const REGISTERED_THEMES = [
    {
        id: DEFAULT_THEME_ID,
        label: 'Review Games Default',
        description: 'The shared workspace theme from review-game-core.',
    },
];
export const gameIdSchema = z.enum(GAME_IDS);
export const colorSchemePreferenceSchema = z.enum(['light', 'dark', 'system']);
export const themePreferenceBaseSchema = z.object({
    themeId: z.literal(DEFAULT_THEME_ID),
    colorScheme: colorSchemePreferenceSchema,
    updatedAt: z.string().min(1),
});
const themePreferenceOverrideSchema = themePreferenceBaseSchema.partial();
export const themePreferenceSchema = themePreferenceBaseSchema.extend({
    overrides: z.record(z.string(), themePreferenceOverrideSchema)
        .transform((value) => Object.fromEntries(Object.entries(value).filter(([key]) => isGameId(key))))
        .optional(),
});
const buildDefaultThemePreferenceBase = () => ({
    themeId: DEFAULT_THEME_ID,
    colorScheme: 'system',
    updatedAt: new Date(0).toISOString(),
});
export const isGameId = (value) => (GAME_IDS.includes(value));
export const normalizeThemePreference = (value) => {
    const parsed = themePreferenceSchema.safeParse(value);
    return parsed.success ? parsed.data : null;
};
export const resolveThemePreference = (preference, gameId) => {
    const fallback = buildDefaultThemePreferenceBase();
    if (!preference)
        return fallback;
    const base = {
        themeId: preference.themeId ?? fallback.themeId,
        colorScheme: preference.colorScheme ?? fallback.colorScheme,
        updatedAt: preference.updatedAt ?? fallback.updatedAt,
    };
    if (!gameId)
        return base;
    const override = preference.overrides?.[gameId];
    if (!override)
        return base;
    return {
        themeId: override.themeId ?? base.themeId,
        colorScheme: override.colorScheme ?? base.colorScheme,
        updatedAt: override.updatedAt ?? base.updatedAt,
    };
};
export const resolveAppliedColorScheme = (colorScheme, systemPrefersDark) => {
    if (colorScheme === 'system') {
        return systemPrefersDark ? 'dark' : 'light';
    }
    return colorScheme;
};
const resolveComparableThemePreference = (preference, gameId) => {
    if (!preference)
        return buildDefaultThemePreferenceBase();
    if ('overrides' in preference) {
        return resolveThemePreference(preference, gameId);
    }
    return {
        themeId: preference.themeId ?? DEFAULT_THEME_ID,
        colorScheme: preference.colorScheme ?? 'system',
        updatedAt: preference.updatedAt ?? new Date(0).toISOString(),
    };
};
const toComparableTimestamp = (value) => {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
};
export const shouldApplyThemePreference = (candidate, current, options = {}) => {
    const candidateResolved = resolveComparableThemePreference(candidate, options.gameId);
    const currentResolved = resolveComparableThemePreference(current, options.gameId);
    return toComparableTimestamp(candidateResolved.updatedAt)
        >= toComparableTimestamp(currentResolved.updatedAt);
};
export const mergeThemePreference = (current, next, gameId) => {
    const normalizedCurrent = current ?? {
        ...buildDefaultThemePreferenceBase(),
        overrides: {},
    };
    if (!gameId) {
        return {
            themeId: next.themeId,
            colorScheme: next.colorScheme,
            updatedAt: next.updatedAt,
            overrides: normalizedCurrent.overrides,
        };
    }
    return {
        themeId: normalizedCurrent.themeId,
        colorScheme: normalizedCurrent.colorScheme,
        updatedAt: normalizedCurrent.updatedAt,
        overrides: {
            ...(normalizedCurrent.overrides ?? {}),
            [gameId]: next,
        },
    };
};
export const readStoredThemePreference = (storage, storageKey = THEME_PREFERENCE_STORAGE_KEY) => {
    const raw = storage.getItem(storageKey);
    if (!raw)
        return null;
    try {
        return normalizeThemePreference(JSON.parse(raw));
    }
    catch {
        return null;
    }
};
export const writeStoredThemePreference = (storage, preference, storageKey = THEME_PREFERENCE_STORAGE_KEY) => {
    storage.setItem(storageKey, JSON.stringify(preference));
    return preference;
};
export const applyThemePreferenceToDocument = (root, preference, options = {}) => {
    const resolved = 'overrides' in (preference ?? {})
        ? resolveThemePreference(preference, options.gameId)
        : (preference ?? buildDefaultThemePreferenceBase());
    const applied = resolveAppliedColorScheme(resolved.colorScheme, options.systemPrefersDark ?? false);
    root.dataset.theme = applied;
    root.dataset.themeId = resolved.themeId;
    root.style.colorScheme = applied;
};
export const buildThemeInitScript = (options = {}) => {
    const storageKey = options.storageKey ?? THEME_PREFERENCE_STORAGE_KEY;
    const gameId = options.gameId ? `'${options.gameId}'` : 'undefined';
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
  `.trim();
};
//# sourceMappingURL=index.js.map