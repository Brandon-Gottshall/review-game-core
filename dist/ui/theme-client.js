'use client';
import { applyThemePreferenceToDocument, mergeThemePreference, readStoredThemePreference, writeStoredThemePreference, } from '../theme/index.js';
const getSystemPrefersDark = () => (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
export const readBrowserThemePreference = (storage = window.localStorage) => readStoredThemePreference(storage);
export const persistThemePreferenceLocally = (next, options = {}) => {
    const storage = options.storage ?? window.localStorage;
    const root = options.root ?? document.documentElement;
    writeStoredThemePreference(storage, next);
    applyThemePreferenceToDocument(root, next, {
        gameId: options.gameId,
        systemPrefersDark: getSystemPrefersDark(),
    });
    return next;
};
export const applyThemeChange = (current, next, options = {}) => {
    const merged = mergeThemePreference(current, next, options.gameId);
    return persistThemePreferenceLocally(merged, options);
};
export const migrateStoredThemePreferenceToLearner = async (learnerId, saveRemote, storage = window.localStorage) => {
    const stored = readStoredThemePreference(storage);
    if (!stored)
        return null;
    await saveRemote(learnerId, stored);
    return stored;
};
//# sourceMappingURL=theme-client.js.map