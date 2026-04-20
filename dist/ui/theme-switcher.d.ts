import { type GameId, type RegisteredTheme, type ThemePreference, type ThemePreferenceBase } from '../theme/index.js';
type ThemeSwitcherProps = {
    preference: ThemePreference | ThemePreferenceBase | null | undefined;
    registeredThemes?: readonly RegisteredTheme[];
    anonymous?: boolean;
    currentEmail?: string | null;
    gameId?: GameId;
    className?: string;
    statusMessage?: string | null;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onChange: (next: ThemePreferenceBase, options?: {
        gameId?: GameId;
    }) => void | Promise<void>;
};
export declare function ThemeSwitcher({ preference, registeredThemes, anonymous, currentEmail, gameId, className, statusMessage, open, defaultOpen, onOpenChange, onChange, }: ThemeSwitcherProps): import("react/jsx-runtime").JSX.Element;
export declare const buildNextThemePreference: (current: ThemePreference | null | undefined, next: ThemePreferenceBase, gameId?: GameId) => ThemePreference;
export {};
//# sourceMappingURL=theme-switcher.d.ts.map