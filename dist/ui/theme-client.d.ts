import { type GameId, type ThemePreference, type ThemePreferenceBase } from '../theme/index.js';
type ThemeStorage = Pick<Storage, 'getItem' | 'setItem'>;
export declare const readBrowserThemePreference: (storage?: ThemeStorage) => ThemePreference | null;
export declare const persistThemePreferenceLocally: (next: ThemePreference, options?: {
    gameId?: GameId;
    storage?: ThemeStorage;
    root?: HTMLElement;
}) => ThemePreference;
export declare const applyThemeChange: (current: ThemePreference | null | undefined, next: ThemePreferenceBase, options?: {
    gameId?: GameId;
    storage?: ThemeStorage;
    root?: HTMLElement;
}) => ThemePreference;
export declare const migrateStoredThemePreferenceToLearner: (learnerId: string, saveRemote: (learnerId: string, preference: ThemePreference) => Promise<void>, storage?: ThemeStorage) => Promise<ThemePreference | null>;
export {};
//# sourceMappingURL=theme-client.d.ts.map