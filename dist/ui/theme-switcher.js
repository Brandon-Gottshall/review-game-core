'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { DEFAULT_THEME_ID, REGISTERED_THEMES, applyThemePreferenceToDocument, mergeThemePreference, resolveThemePreference, } from '../theme/index.js';
import { cx } from './utils.js';
/**
 * WAI-ARIA radio-group keyboard pattern for chip groups inside the panel.
 * Computes the next index for ArrowLeft/Right/Up/Down + Home/End and calls
 * `onMove` with it. The group is responsible for wiring tabIndex and focus.
 */
const handleRadioGroupKeyDown = (event, length, currentIndex, onMove) => {
    let nextIndex = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % length;
    }
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        nextIndex = (currentIndex - 1 + length) % length;
    }
    else if (event.key === 'Home') {
        nextIndex = 0;
    }
    else if (event.key === 'End') {
        nextIndex = length - 1;
    }
    if (nextIndex === null || nextIndex === currentIndex)
        return;
    event.preventDefault();
    onMove(nextIndex);
    // Focus the new chip after React re-renders so the user lands on the newly
    // selected option (selection-follows-focus, standard radio-group behavior).
    const group = event.currentTarget.closest('[role="radiogroup"]');
    if (!group)
        return;
    const nextButton = group.querySelectorAll('[role="radio"]')[nextIndex];
    requestAnimationFrame(() => nextButton?.focus());
};
const COLOR_SCHEMES = [
    { id: 'system', label: 'Follow system' },
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
];
const colorSchemeLabel = (scheme) => {
    const match = COLOR_SCHEMES.find((entry) => entry.id === scheme);
    return match ? match.label : scheme;
};
const isThemePreference = (value) => Boolean(value && 'overrides' in value);
const themeButtonLabel = (preference, themes) => {
    const schemeLabel = colorSchemeLabel(preference.colorScheme);
    // Hide theme-family prefix until a second theme is registered.
    if (themes.length <= 1)
        return schemeLabel;
    const activeTheme = themes.find((theme) => theme.id === preference.themeId);
    return `${activeTheme?.label ?? preference.themeId} · ${schemeLabel}`;
};
export function ThemeSwitcher({ preference, registeredThemes = REGISTERED_THEMES, anonymous = false, currentEmail, gameId, className, statusMessage, open, defaultOpen, onOpenChange, onChange, }) {
    const resolved = useMemo(() => (isThemePreference(preference)
        ? resolveThemePreference(preference, gameId)
        : (preference ?? resolveThemePreference(null))), [gameId, preference]);
    const [draft, setDraft] = useState(resolved);
    const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
    const resolvedOpen = open ?? internalOpen;
    const componentId = useId();
    const panelId = `${componentId}-panel`;
    const schemeLabelId = `${componentId}-scheme-label`;
    const familyLabelId = `${componentId}-family-label`;
    const containerRef = useRef(null);
    const triggerRef = useRef(null);
    useEffect(() => {
        setDraft(resolved);
    }, [resolved]);
    const setOpen = (next) => {
        if (typeof open !== 'boolean')
            setInternalOpen(next);
        onOpenChange?.(next);
    };
    const persist = (next) => {
        setDraft(next);
        onChange(next, { gameId });
    };
    useEffect(() => {
        if (typeof document === 'undefined')
            return;
        applyThemePreferenceToDocument(document.documentElement, draft, {
            gameId,
            systemPrefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
        });
    }, [draft, gameId]);
    useEffect(() => {
        if (!resolvedOpen)
            return;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setOpen(false);
                triggerRef.current?.focus();
            }
        };
        const handlePointerDown = (event) => {
            if (!containerRef.current)
                return;
            if (event.target instanceof Node && containerRef.current.contains(event.target))
                return;
            setOpen(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('pointerdown', handlePointerDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('pointerdown', handlePointerDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedOpen]);
    const showThemeFamily = registeredThemes.length > 1;
    const triggerLabel = themeButtonLabel(draft, registeredThemes);
    const schemeIcon = draft.colorScheme === 'dark' ? '☾' : draft.colorScheme === 'light' ? '☀' : '◐';
    return (_jsxs(motion.div, { ref: containerRef, layout: true, transition: { type: 'spring', stiffness: 420, damping: 36 }, className: cx('rg-card rg-theme-switcher', !resolvedOpen && 'is-collapsed', className), children: [_jsx(motion.button, { layout: true, ref: triggerRef, type: "button", className: "rg-theme-switcher__trigger", "aria-expanded": resolvedOpen, "aria-haspopup": "dialog", "aria-controls": panelId, "aria-label": `Theme: ${triggerLabel}. ${resolvedOpen ? 'Close' : 'Open'} picker.`, onClick: () => setOpen(!resolvedOpen), children: resolvedOpen ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "rg-kicker", children: "Theme" }), _jsx("span", { className: "rg-theme-switcher__value", children: triggerLabel })] })) : (_jsx("span", { className: "rg-theme-switcher__icon", "aria-hidden": "true", children: schemeIcon })) }), _jsx(AnimatePresence, { initial: false, children: resolvedOpen ? (_jsxs(motion.div, { layout: true, initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 }, id: panelId, className: "rg-theme-switcher__panel", role: "dialog", "aria-label": "Theme switcher", children: [showThemeFamily ? (() => {
                            const familySelectedIndex = Math.max(0, registeredThemes.findIndex((theme) => theme.id === draft.themeId));
                            const selectFamily = (nextIndex) => {
                                const target = registeredThemes[nextIndex];
                                if (!target)
                                    return;
                                persist({
                                    ...draft,
                                    themeId: target.id ?? DEFAULT_THEME_ID,
                                    updatedAt: new Date().toISOString(),
                                });
                            };
                            return (_jsxs("div", { className: "rg-theme-switcher__section", children: [_jsx("p", { className: "rg-kicker", id: familyLabelId, children: "Theme family" }), _jsx("div", { className: "rg-theme-switcher__options", role: "radiogroup", "aria-labelledby": familyLabelId, children: registeredThemes.map((theme, index) => {
                                            const selected = index === familySelectedIndex;
                                            return (_jsx("button", { type: "button", role: "radio", "aria-checked": selected, tabIndex: selected ? 0 : -1, className: cx('rg-chip', selected && 'is-selected'), onClick: () => selectFamily(index), onKeyDown: (event) => handleRadioGroupKeyDown(event, registeredThemes.length, index, selectFamily), children: theme.label }, theme.id));
                                        }) })] }));
                        })() : null, (() => {
                            const schemeSelectedIndex = Math.max(0, COLOR_SCHEMES.findIndex((entry) => entry.id === draft.colorScheme));
                            const selectScheme = (nextIndex) => {
                                const target = COLOR_SCHEMES[nextIndex];
                                if (!target)
                                    return;
                                persist({
                                    ...draft,
                                    colorScheme: target.id,
                                    updatedAt: new Date().toISOString(),
                                });
                            };
                            return (_jsxs("div", { className: "rg-theme-switcher__section", children: [_jsx("p", { className: "rg-kicker", id: schemeLabelId, children: "Color scheme" }), _jsx("div", { className: "rg-theme-switcher__options", role: "radiogroup", "aria-labelledby": schemeLabelId, children: COLOR_SCHEMES.map(({ id, label }, index) => {
                                            const selected = index === schemeSelectedIndex;
                                            return (_jsx("button", { type: "button", role: "radio", "aria-checked": selected, tabIndex: selected ? 0 : -1, className: cx('rg-chip', selected && 'is-selected'), onClick: () => selectScheme(index), onKeyDown: (event) => handleRadioGroupKeyDown(event, COLOR_SCHEMES.length, index, selectScheme), children: label }, id));
                                        }) })] }));
                        })(), anonymous ? (_jsx("p", { className: "rg-note", children: "You're browsing as anonymous. Attach an email to keep this theme everywhere." })) : currentEmail ? (_jsxs("p", { className: "rg-note", children: ["Theme is tied to ", currentEmail, "."] })) : null, statusMessage ? _jsx("p", { className: "rg-note", role: "status", children: statusMessage }) : null] }, "panel")) : null })] }));
}
export const buildNextThemePreference = (current, next, gameId) => mergeThemePreference(current, next, gameId);
//# sourceMappingURL=theme-switcher.js.map