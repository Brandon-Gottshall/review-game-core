# Header / Topbar Audit — all four apps

Cross-app audit of the theme/profile control area. Refreshed after the fork agent landed all `IdentityFloat` mounts, the ASTR FOUC fix, and the email-confirmation loop. All four apps pass the theme/profile WF.

---

## 1. Current build state

All four apps build and pass the theme/profile WF. ASTR, MATH 1111, MATH 1401 each carry the full `<ThemeSwitcher>` + `<IdentityFloat>` composite. CS's quiz shell renders the composite with `showIdentity={false}`.

## 2. Control inventory per app — all resolved

| App | ThemeSwitcher | IdentityFloat | `<html data-theme>` contract | Topbar | Mount path |
|---|---|---|---|---|---|
| MATH 1111 | ✅ | ✅ | ✅ `data-theme="light"` + `THEME_INIT_SCRIPT` | `<header className="app-topbar">` | Layout-level composite [`components/theme-toggle.tsx`](../../../../math-1111-review-game/components/theme-toggle.tsx) |
| MATH 1401 | ✅ | ✅ | ✅ same | `<header className="app-topbar">` | Same pattern |
| ASTR 1020K | ✅ | ✅ | ✅ `data-theme="light"` + `THEME_INIT_SCRIPT` | Page-level in `<header>` | [`components/theme-toggle.tsx`](../../../../astr-unit-1-review-game/components/theme-toggle.tsx) mounted in [`app/home-client.tsx`](../../../../astr-unit-1-review-game/app/home-client.tsx) |
| CS 1301K | ✅ | ✅ on home; hidden in quiz shell via `showIdentity={false}` | ✅ same | Home page + quiz shell headers | [`components/profile-controls.tsx`](../../../../cs-unit-1-review-game/components/profile-controls.tsx) |

---

## 3. Findings (visual + structural)

### 3.1 Gaps — resolved

| # | Was | Status |
|---|---|---|
| G1 | No `<IdentityFloat>` in MATH 1111, MATH 1401 | ✅ Landed — composite wrapper in each app's `components/theme-toggle.tsx` |
| G2 | No `<IdentityFloat>` in ASTR | ✅ Landed — page-level composite in `home-client.tsx` |
| G3 | ASTR's static `className="dark"` + no FOUC script | ✅ Landed — `data-theme="light" suppressHydrationWarning` + `THEME_INIT_SCRIPT` |
| G4 | CS quiz shell had both floats | ✅ Resolved — `showIdentity={false}` passes at quiz mount |

### 3.1b Remaining polish observations

| # | Observation | Severity | Notes |
|---|---|---|---|
| P1 | MATH 1111 / 1401 `<IdentityFloat>` auto-opens for anonymous users on first visit, pushing hero content down ~260px before the learner can read the headline | 🟡 Moderate | Matches component default; CS has same pattern. Consider a one-time-dismiss option (persist to localStorage) for returning anonymous users |
| P2 | When confirmation is pending, the main Save button stays visible in the panel (disabled) alongside the strip's Yes/Edit | 🟢 Minor | Correct but slightly noisy. Keeps the form shape stable across states. Acceptable as-is. |
| P3 | Confirmation strip's sr-only live region uses inline styles rather than a utility class | 🟢 Minor | Functional parity but a future refactor could extract `.sr-only` into `theme.css` |
| P4 | ASTR's home page renders a full-viewport "Loading..." Suspense fallback on cold compile that delays first paint of the topbar composite | 🟢 Minor (dev-only) | Functional. Users see the default Analytics log activity but no controls until `hydrateFromDb` resolves |

### 3.2 Density findings

**MATH 1111 / 1401 — single-control topbar**
- Only ThemeSwitcher visible today. When `<IdentityFloat>` lands (G1), two controls need to fit in `.app-topbar-shell` (flex row, right-aligned). Side-by-side with `gap: 0.75rem` is fine at desktop; collapses gracefully on mobile because both controls wrap.

**CS 1301K — stacked two-control cluster**
- `ProfileControls` uses `flex flex-col items-end gap-3` — the two cards stack vertically.
- Auto-open for anonymous users means IdentityFloat renders expanded (~260px tall) on first paint.
- **Quiz-shell header pattern**: CS renders `ProfileControls` in the quiz page header next to the exit button + title. `IdentityFloat` here is redundant — identity has been established by the time a quiz starts, so the duplicate attach-your-email prompt is noise. **Resolution (§4 R1)**: drop `IdentityFloat` from the quiz shell; keep `ThemeSwitcher` only.

**ASTR** — page-level mount, no dedicated topbar. When G2 adds `IdentityFloat`, both controls need a deliberate home. Options: mirror MATH 1111's topbar pattern at layout level, or keep CS-style page-level mount. Recommendation: go page-level (consistency with CS's learner-facing space).

### 3.3 Typography & placement consistency

- MATH 1111 / 1401: controls sit in `.app-topbar-shell` — a plain `<div>`, not a semantic landmark. **Resolution (§4 R2)**: upgrade to `<header>`.
- CS quiz-shell: already a real `<header>` ✓.
- CS home: wraps `<ProfileControls>` inside a flex `<div>` inside a `<header>` — semantic ✓.
- ASTR: page-level; theme-toggle is not inside a `<header>` in `home-client.tsx`. **Resolution**: when the G2 mount happens, wrap in a `<header>`.

### 3.4 Copy defaults (after the cleanup pass)

`<IdentityFloat>` default copy is now:

| Prop | Default |
|---|---|
| description | `Attach one email so your theme and progress follow you across review games.` |
| saveLabel | `Save email` |
| updateLabel | `Update email` (new; used when an email is already attached and the draft differs) |
| anonymousLabel | `Use anonymous mode` |
| anonymousNote | `Anonymous mode keeps your theme and progress on this browser only.` |

CS's previously-needed overrides were dropped — defaults now match. See `identity-float.md`.

### 3.5 A11y

Live check confirmed on CS (the reference implementation):

| Surface | Label | Status |
|---|---|---|
| ThemeSwitcher trigger | `aria-label="Theme: {current}. {Open/Close} picker."` + `aria-expanded` + `aria-haspopup="dialog"` + `aria-controls` | ✓ |
| ThemeSwitcher panel | `role="dialog"` + `aria-label="Theme switcher"` | ✓ |
| Color-scheme chips | `role="radiogroup"` → `role="radio"` + `aria-checked` | ✓ (replaced the native `<select>`) |
| Theme-family chips | `role="radiogroup"` → `role="radio"` + `aria-checked` | ✓ (hidden when only one theme registered) |
| Panel close — Escape | Returns focus to trigger | ✓ |
| Panel close — outside-click | Closes panel | ✓ |
| IdentityFloat container | `aria-label="Learner association"` | ✓ |
| IdentityFloat trigger | `aria-label="Learner: {email|'Anonymous'}. {Open/Close}..."` + `aria-expanded` | ✓ |
| IdentityFloat panel | `<form>` with native validation + `Enter`-to-save | ✓ |
| Email input | `aria-label="Learner email"` + `autoComplete="email"` + `type="email"` + `name="email"` | ✓ |
| Save button | `type="submit"`, `disabled` when draft unchanged, relabels to `Update email` when updating | ✓ |
| Panel close — Escape / outside-click | Same as ThemeSwitcher | ✓ |

**No outstanding a11y gaps in shipped components.**

---

## 4. Recommendations

| # | Recommendation | Status |
|---|---|---|
| R1 | Drop `<IdentityFloat>` from CS quiz-shell header | ✅ Landed via `showIdentity={false}` |
| R2 | Semantic `<header>` on MATH 1111 + 1401 topbar | ✅ Landed |
| R3 | Mount `<IdentityFloat>` in MATH 1111, MATH 1401, ASTR | ✅ Landed (fork agent) |
| R4 | ASTR `data-theme` contract + FOUC script | ✅ Landed (fork agent) |
| R5 | Opt-in dismiss of IdentityFloat auto-open for returning anonymous users | ⏭️ Future. Matches P1 above. Low priority. |

---

## 5. Cross-references

- Canonical copy + confirmation-loop spec: `identity-float.md`
- Switcher keyboard/chip-group spec: `theme-switcher.md` §12
- Tokens the controls consume: `tokens.md` §1.9, §1.10
- Preset vs spec reconciliation: `rollout-alignment.md`
