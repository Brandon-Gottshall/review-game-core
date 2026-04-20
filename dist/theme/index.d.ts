import { z } from 'zod';
export type GameId = 'math-1111-review-game' | 'stats-exam-prep-game' | 'astr-unit-1-review-game' | 'cs-unit-1-review-game';
export type ThemeId = 'default';
export type ColorSchemePreference = 'light' | 'dark' | 'system';
export type ThemePreferenceBase = {
    themeId: ThemeId;
    colorScheme: ColorSchemePreference;
    updatedAt: string;
};
export type ThemePreference = ThemePreferenceBase & {
    overrides?: Partial<Record<GameId, Partial<ThemePreferenceBase>>>;
};
export type RegisteredTheme = {
    id: ThemeId;
    label: string;
    description?: string;
};
export declare const GAME_IDS: readonly ["math-1111-review-game", "stats-exam-prep-game", "astr-unit-1-review-game", "cs-unit-1-review-game"];
export declare const DEFAULT_THEME_ID: ThemeId;
export declare const THEME_PREFERENCE_STORAGE_KEY = "review-games:theme-preference";
export declare const THEME_ATTRIBUTE = "data-theme";
export declare const THEME_ID_ATTRIBUTE = "data-theme-id";
export declare const REGISTERED_THEMES: readonly RegisteredTheme[];
export declare const gameIdSchema: z.ZodEnum<{
    "math-1111-review-game": "math-1111-review-game";
    "stats-exam-prep-game": "stats-exam-prep-game";
    "astr-unit-1-review-game": "astr-unit-1-review-game";
    "cs-unit-1-review-game": "cs-unit-1-review-game";
}>;
export declare const colorSchemePreferenceSchema: z.ZodEnum<{
    light: "light";
    dark: "dark";
    system: "system";
}>;
export declare const themePreferenceBaseSchema: z.ZodObject<{
    themeId: z.ZodLiteral<"default">;
    colorScheme: z.ZodEnum<{
        light: "light";
        dark: "dark";
        system: "system";
    }>;
    updatedAt: z.ZodString;
}, z.core.$strip>;
export declare const themePreferenceSchema: z.ZodType<ThemePreference>;
export declare const isGameId: (value: string) => value is GameId;
export declare const normalizeThemePreference: (value: unknown) => ThemePreference | null;
export declare const resolveThemePreference: (preference: ThemePreference | null | undefined, gameId?: GameId) => ThemePreferenceBase;
export declare const resolveAppliedColorScheme: (colorScheme: ColorSchemePreference, systemPrefersDark: boolean) => "light" | "dark";
export declare const shouldApplyThemePreference: (candidate: ThemePreference | ThemePreferenceBase | null | undefined, current: ThemePreference | ThemePreferenceBase | null | undefined, options?: {
    gameId?: GameId;
}) => boolean;
export declare const mergeThemePreference: (current: ThemePreference | null | undefined, next: ThemePreferenceBase, gameId?: GameId) => ThemePreference;
export declare const readStoredThemePreference: (storage: Pick<Storage, "getItem">, storageKey?: string) => ThemePreference | null;
export declare const writeStoredThemePreference: (storage: Pick<Storage, "setItem">, preference: ThemePreference, storageKey?: string) => ThemePreference;
export declare const applyThemePreferenceToDocument: (root: Pick<HTMLElement, "dataset" | "style">, preference: ThemePreference | ThemePreferenceBase | null | undefined, options?: {
    gameId?: GameId;
    systemPrefersDark?: boolean;
}) => void;
export declare const buildThemeInitScript: (options?: {
    gameId?: GameId;
    storageKey?: string;
}) => string;
//# sourceMappingURL=index.d.ts.map