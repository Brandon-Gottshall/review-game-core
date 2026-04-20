# ThemeSwitcher

Component spec for the email-tied theme switcher that replaces the current `<ThemeToggle>` in every review game. The fork agent implements this as deliverable D-12, consuming the `themePreference` profile field from deliverable C-11.

**Name:** `<ThemeSwitcher>`
**Package:** `@brandon-gottshall/review-game-core/ui`
**Replaces:** [math-1111-review-game/components/theme-toggle.tsx](../../../../math-1111-review-game/components/theme-toggle.tsx) (byte-identical copy in 1401; ASTR and CS currently have no theme toggle)

---

## 1. What it does

Lets a learner pick a named theme (not just light/dark) and persists the choice against their email-keyed profile. When no email is attached, the preference is written to `localStorage` only; on email attach, the local preference migrates up to the profile.

Replaces the current two-state toggle (`'light' | 'dark'`) with a registry-driven picker that supports N themes plus a `'system'` color-scheme option. Light/dark remain the default themes so existing behavior is preserved the moment the component drops in.

---

## 2. Component API

```tsx
import type { ThemeRegistry, ThemePreference } from '@brandon-gottshall/review-game-core/ui'

export type ThemeSwitcherProps = {
  /** Registry of available themes. Default import: `defaultThemeRegistry` ships light + dark. */
  registry?: ThemeRegistry
  /** Current preference (usually from learner profile). Uncontrolled when omitted. */
  value?: ThemePreference
  /** Called when the learner picks a new theme. */
  onChange?: (next: ThemePreference) => void
  /** Visual variant. Defaults to 'menu'. */
  variant?: 'menu' | 'segmented' | 'icon-only'
  /** Placement hint — tunes alignment of the menu (for 'menu' variant). */
  align?: 'start' | 'end'
  /** Optional className applied to the root button. */
  className?: string
}
```

### 2.1 `ThemeRegistry` shape

```ts
export type ThemeDefinition = {
  /** Stable id. Used as the data-theme attribute value. */
  id: string
  /** Display label in the picker. */
  label: string
  /** One-line description shown on focus/hover in the menu. */
  description?: string
  /** Underlying color scheme — drives the `color-scheme` CSS property. */
  colorScheme: 'light' | 'dark'
  /** Optional token overrides; absent means the theme uses preset defaults. */
  tokens?: Record<string, string>
}

export type ThemeRegistry = {
  /** Ordered list of themes. First entry is the default when no preference is set. */
  themes: ThemeDefinition[]
  /** Whether the registry includes a "Follow system" meta-option. Default: true. */
  includeSystemOption?: boolean
}

export const defaultThemeRegistry: ThemeRegistry = {
  themes: [
    { id: 'light', label: 'Light', colorScheme: 'light' },
    { id: 'dark',  label: 'Dark',  colorScheme: 'dark'  },
  ],
  includeSystemOption: true,
}
```

### 2.2 `ThemePreference` shape

Defined by the fork agent in C-11 (profile field); referenced here for completeness:

```ts
export type ThemePreference = {
  /** Resolves against a theme id in the registry. */
  themeId: string
  /** 'system' means "follow OS; themeId is ignored for color scheme". */
  colorScheme: 'light' | 'dark' | 'system'
  /** ISO timestamp of last update. */
  updatedAt: string
}
```

---

## 3. Variants

### 3.1 `variant="menu"` (default)

A button in the topbar showing the current theme label; clicking opens a dropdown listing all themes plus (optionally) "Follow system". Matches the current `<ThemeToggle>` topbar placement.

### 3.2 `variant="segmented"`

Inline segmented control showing all themes side-by-side. Better on wide surfaces (e.g., settings panel) where the menu wouldn't fit.

### 3.3 `variant="icon-only"`

Single icon button that cycles through the registry on click. Used in dense toolbars where the menu variant is too heavy. Only practical for ≤ 3 themes.

---

## 4. States

| State | Trigger | Visual |
|---|---|---|
| Default | No interaction | Button with current theme label; border `var(--border)`, background `var(--theme-toggle-bg)` |
| Hover | Pointer over | Border `var(--accent)`, background `var(--theme-toggle-hover)`, `translateY(-1px)` |
| Focus-visible | Keyboard focus | Per `focus-states.md` §3.2 (box-shadow ring + accent border) |
| Open (menu) | Click while closed | Menu portal opens with `aria-expanded="true"` on trigger |
| Active / pressed | Mousedown / Enter-keydown | Per `focus-states.md` §3.4 |
| Disabled | `disabled` prop (rare) | `opacity: 0.56`, `cursor: not-allowed` |
| Anonymous | No email attached on profile | Tooltip / hint copy in menu footer (see §6) |

---

## 5. Placement

Topbar, right-aligned, mirroring the current `<ThemeToggle>` in [math-1111-review-game/app/layout.tsx:24–28](../../../../math-1111-review-game/app/layout.tsx):

```tsx
<div className="app-topbar">
  <div className="app-topbar-shell">
    <ThemeSwitcher />
  </div>
</div>
```

Same selector (`.theme-toggle`, or a new `.theme-switcher` alias) so existing layout CSS in each app keeps positioning it correctly until the Tailwind migration collapses those rules.

---

## 6. Anonymous-mode copy

When no email is attached to the profile, the menu shows a footer row:

> You're browsing as anonymous. Attach an email to carry this theme across every review game.

Clicking "Attach an email" opens the existing identity float (fork agent D-17 extraction) scrolled into view. Post-attach, the local preference migrates to the profile — the user does not need to re-pick their theme.

---

## 7. Accessibility

- **Keyboard:**
  - Trigger button: `Enter` / `Space` opens the menu.
  - Menu open: `ArrowDown` / `ArrowUp` move focus between items; `Enter` / `Space` selects; `Escape` closes and returns focus to the trigger.
  - `Tab` while open closes the menu and continues to the next focusable element (standard menu-button pattern).
- **ARIA:**
  - Trigger: `aria-haspopup="listbox"`, `aria-expanded={isOpen}`, dynamic `aria-label` that includes the current theme (e.g., `"Theme: Dark. Change theme."`).
  - Menu: `role="listbox"`, `aria-label="Select theme"`.
  - Menu items: `role="option"`, `aria-selected` matches current preference.
- **Screen reader:** announces label on open; announces selected theme on change via `aria-live="polite"` on a hidden status node so the change is audible even though focus returns to the trigger.
- Meets WCAG 2.4.7 (Focus Visible) via `focus-states.md` rules.

---

## 8. Storage + FOUC prevention

Preserves the existing `THEME_INIT_SCRIPT` FOUC-prevention pattern from [math-1111-review-game/lib/theme.ts](../../../../math-1111-review-game/lib/theme.ts). The script:

1. Runs synchronously in `<head>` before React hydrates.
2. Reads the app's localStorage key for the theme id.
3. Resolves the matching `ThemeDefinition` from the registry (or falls back to first entry).
4. Applies `document.documentElement.dataset.theme = themeId` and `style.colorScheme = definition.colorScheme`.
5. If `colorScheme === 'system'`, reads `prefers-color-scheme` media query.

The fork agent ships a generator function:

```ts
export function buildThemeInitScript(registry: ThemeRegistry, storageKey: string): string
```

So each app's `layout.tsx` can do:

```tsx
<script dangerouslySetInnerHTML={{ __html: buildThemeInitScript(themeRegistry, 'math-1111-review-theme') }} />
```

Preserves the existing per-app storage key semantics. When an email is attached, the switcher writes to both localStorage (for next-page-load FOUC) and the profile (for cross-game sync).

---

## 9. Migration from `<ThemeToggle>`

The fork agent's migration steps per app:

1. Add `<ThemeSwitcher />` in the topbar where `<ThemeToggle />` lives.
2. Replace the `THEME_INIT_SCRIPT` constant with a call to `buildThemeInitScript(defaultThemeRegistry, storageKey)`; keep the storage key string unchanged so existing users keep their preference.
3. Delete the old `components/theme-toggle.tsx` and `lib/theme.ts`.
4. Update `layout.tsx` import: `ThemeToggle` → `ThemeSwitcher`.
5. WF verify: light/dark still toggleable; old stored preference still honored.

For ASTR and CS (no current toggle): the switcher drops in fresh. Their layouts also gain the `<script>` tag for FOUC prevention — new territory for those apps, lifted from the MATH pattern.

---

## 10. Tests

- Unit: menu opens/closes on keyboard + click; registry ordering preserved; optimistic UI on change; anonymous-mode copy visible when no email on profile.
- Integration: `buildThemeInitScript()` generates syntactically valid JS that, when evaluated, applies the expected `data-theme` attribute for a given stored-theme value + registry.
- WF: a low-context agent can find the switcher, change the theme, reload the page, and observe the new theme persists. Per the user's global doctrine.

---

## 11. Cross-references

- Tokens consumed: `tokens.md` §1.9 (theme-toggle tokens), §1.1 (accent), §1.10 (accent-soft for focus)
- Focus treatment: `focus-states.md` §3.2 (interactive-surface ring)
- Profile field: fork-spec C-11 (`themePreference`)
- Migration companion: fork-spec B-9 (Tailwind on all apps)

---

## 12. Amendment — keyboard ergonomics of the color-scheme control

**Source of this amendment:** fork-agent WF report on CS 1301K noted that the color-scheme control "felt better with direct pointer selection than keyboard arrows."

### 12.1 Root cause

The shipped panel mixes two interaction patterns that are not visually or behaviorally equivalent:

- **Theme family** — rendered as a `.rg-chip` group (buttons with `aria-pressed`). Keyboard: `Tab` between chips, `Enter`/`Space` to press. Pointer: click to press. Parity is good.
- **Color scheme** — rendered as a native `<select>` element ([`theme-switcher.tsx:126–138`](../../src/ui/theme-switcher.tsx#L126)). Keyboard: `Tab` to the select, then platform-dependent arrow-key handling inside the native dropdown. On macOS, the native `<select>` opens a popover that requires an extra `Enter` or `Space` to commit, and arrow keys change the value *without* committing. Pointer: one click commits directly.

The asymmetry — chips commit on keypress, select commits on dropdown-close — is what creates the "worse with keyboard" feel. Pointer users don't notice because pointer interaction is one-shot in both cases.

### 12.2 Fix

Replace the `<select>` with a chip group matching the theme-family pattern, so both controls commit on keypress and the two sections feel uniform.

**New markup:**

```tsx
<div className="rg-theme-switcher__section">
  <p className="rg-kicker">Color scheme</p>
  <div className="rg-theme-switcher__options" role="radiogroup" aria-label="Color scheme">
    {(['system', 'light', 'dark'] as const).map((scheme) => {
      const selected = draft.colorScheme === scheme
      return (
        <button
          key={scheme}
          type="button"
          role="radio"
          aria-checked={selected}
          className={cx('rg-chip', selected && 'is-selected')}
          onClick={() => persist({ ...draft, colorScheme: scheme, updatedAt: new Date().toISOString() })}
        >
          {COLOR_SCHEME_LABELS[scheme]}
        </button>
      )
    })}
  </div>
</div>
```

**Labels:**

| Value | Label |
|---|---|
| `system` | `Follow system` |
| `light` | `Light` |
| `dark` | `Dark` |

**Why `role="radiogroup"` + `role="radio"` instead of `aria-pressed` buttons (as theme-family uses):** radio semantics match the behavior — exactly one color scheme is active at a time, and picking one deselects the others. Theme-family arguably should use the same pattern; leaving that as a separate follow-up since the current `aria-pressed` treatment works and isn't the source of this complaint.

### 12.3 Keyboard behavior — shipped

Verified live on CS:

- `Tab` enters the radiogroup and lands on the currently-selected chip (single tab stop via `tabIndex={0}` on the selected, `-1` on the rest).
- `ArrowLeft` / `ArrowRight` / `ArrowUp` / `ArrowDown` move focus to the prev / next chip and commit the selection (selection-follows-focus).
- `Home` jumps to the first chip + commits. `End` jumps to the last chip + commits.
- Navigation wraps at both ends (first ↔ last).
- `Space` / `Enter` on a focused non-selected chip commits it (native button behavior).
- `Tab` leaves the group to the next radiogroup or the panel edge.

Both the **theme-family** and **color-scheme** groups use the same `handleRadioGroupKeyDown` helper defined at the top of [`theme-switcher.tsx`](../../src/ui/theme-switcher.tsx). Any future radio-group surface in `review-game-core/src/ui` should reuse this helper rather than re-implementing the pattern.

### 12.4 Styling

Reuse `.rg-chip` + `.rg-chip.is-selected` — no new CSS. The chip group's line-wrapping already works for three items.

### 12.5 Visual consistency with theme-family section

Two radiogroups in the same panel, identical chip styling. The `.rg-kicker` above each labels the purpose. Panel hierarchy: `Theme family` (chips) → `Color scheme` (chips) → optional status note.

### 12.6 Migration

- Update [`theme-switcher.tsx:124–139`](../../src/ui/theme-switcher.tsx#L124) to the markup in §12.2.
- Remove the now-unused `.rg-field` CSS for this component (if no other consumer uses it).
- WF regression: confirm keyboard-only users can change color scheme without a mouse. Confirm the preference round-trips (local + remote) exactly as before.
- No migration for stored preferences — the underlying `colorScheme` values (`'light' | 'dark' | 'system'`) are unchanged.

### 12.7 Considerations

- **Why not fix the native `<select>` with CSS / `:focus-visible`?** The commit-on-change behavior is platform-dependent and not restyle-able. The user experience gap is in the interaction model, not the visual.
- **Does this affect mobile / touch?** No — chip group is equally tappable as a native select trigger, and often better since each option is a discrete hit target rather than a nested dropdown.
- **Form-submit integration?** Not applicable — the switcher is not in a form; changes persist directly via `onChange`.

### 12.8 Cross-reference

- Component file: [`review-game-core/src/ui/theme-switcher.tsx`](../../src/ui/theme-switcher.tsx)
- Theme-family chip pattern (reference): [`theme-switcher.tsx:100–121`](../../src/ui/theme-switcher.tsx#L100)
- Header-audit finding that sources this: `header-audit.md` §4 R8
