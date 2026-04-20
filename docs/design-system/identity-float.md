# IdentityFloat — Copy + Override Model + Confirmation Loop

Canonical copy and interaction spec for `<IdentityFloat>` (already shipped in [`review-game-core/src/ui/identity-float.tsx`](../../src/ui/identity-float.tsx)). The component's override surface is already sufficient for cross-app variation; this doc locks in the defaults, names the intended override points, and specs the missing email-confirmation loop.

**Consumers:** every review game. Currently mounted only in CS 1301K; headline gap (see `header-audit.md` R2) is to mount it in MATH 1111, MATH 1401, and ASTR.

---

## 1. Canonical defaults

The following defaults live in the component signature today (see [`identity-float.tsx:23–37`](../../src/ui/identity-float.tsx)). This table is the *spec* — if defaults drift from these values, update here and in the component.

| Prop | Default |
|---|---|
| `placeholder` | `you@valdosta.edu` |
| `description` | `Attach one email so your theme and progress follow you across review games.` |
| `saveLabel` | `Save email` |
| `anonymousLabel` | `Use anonymous mode` |
| `anonymousNote` | `Anonymous mode keeps your theme and progress on this browser only.` |

**Change from shipped defaults** (current component ships `Save email progress` / `Use anonymous progress` / longer sentences). CS already overrides to shorter forms; promoting CS's style to the default removes the need for every other game to repeat the override. Fork-agent action: update the defaults in the component; drop CS's redundant overrides.

**Why this copy:**
- Short button labels — buttons read as verbs, not sentences.
- "theme and progress follow you" — names both benefits explicitly; maps to the actual mechanism (email-keyed learner profile carries `themePreference` + study goals).
- "across review games" — sets the cross-game expectation so users understand the persistence scope.
- "on this browser only" — concrete about what anonymous means (as opposed to "local", which is jargon).

---

## 2. Override policy

**Use the defaults unless the game has semantic drift that genuinely changes meaning.** CS is currently the only app that overrides (see [`cs-unit-1-review-game/components/profile-controls.tsx:115–118`](../../../cs-unit-1-review-game/components/profile-controls.tsx#L115)). After the defaults above ship, CS's overrides become redundant and can be dropped.

**When to override:**

| Case | Example | Resolution |
|---|---|---|
| Game uses a different "identity" concept (e.g., a cohort-bound roster where email isn't the primary key) | Hypothetical future roster game | Override `description` to explain the actual mechanism |
| Game has a specialized tone that conflicts with the defaults | — | Override, but consult `metadata-voice.md` to stay within the "Concept Mastery" voice family |
| The defaults are just longer than the space allows (e.g., a dense game shell) | CS quiz header | Use `className` to tighten layout, NOT overrides for brevity — short defaults should already fit |

**When NOT to override:**
- Just to change the tone to something you prefer. One voice across the portfolio matters more than per-game taste.
- To say `review-games` instead of `review games` (or similar style-guide lapses). Fix the default if the default is wrong.

---

## 3. Email-confirmation loop (shipped)

Prevents silent typo attachments (e.g., `bgottsahll@valdosta.edu` passing regex and claiming progress to a phantom account). WCAG 3.3.4 (Error Prevention) pattern.

### 3.1 Behavior (as shipped)

After the first save for a given email, the component shows a confirmation strip inside the panel:

```
Is bgottsahll@valdosta.edu correct?   [Yes, save]   [Edit]
```

- `Yes, save` calls `onConfirmEmail(email)`. The strip dismisses. Status message reflects confirmation.
- `Edit` pre-fills the input with the pending email and refocuses it. The strip persists until the user types a different value (then clears) or re-submits + confirms.
- The strip persists across panel close/reopen and across reloads while the profile's `emailConfirmed` is `false`.
- The main `Save` / `Update email` button stays visible but disables while confirmation is pending + draft is unchanged (no-op gate).

### 3.2 Component API (shipped)

```ts
type IdentityFloatProps = {
  // ...existing props...

  /** Default: true. Set to false to skip the confirmation strip. */
  requireEmailConfirmation?: boolean

  /** Called when the user confirms the saved email is correct. */
  onConfirmEmail?: (email: string) => void | Promise<void>

  /**
   * Controlled confirmation state (typically hydrated from the learner profile).
   * Leave undefined for uncontrolled transient mode.
   */
  emailConfirmed?: boolean
}
```

Controlled mode: parent passes `emailConfirmed={profile.emailConfirmed}`. The strip appears whenever that value is `false` for a saved email.
Uncontrolled mode: component tracks internal `internalEmailConfirmed` state; strip appears after first `onSave` resolves and clears on `onConfirmEmail` or draft change.

### 3.3 Copy (shipped)

| Surface | Text |
|---|---|
| Prompt | `Is {email} correct?` |
| Confirm button | `Yes, save` |
| Edit button | `Edit` |
| sr-only live region | `Saved {email}. Confirm it's correct.` (announced on strip appear) |

### 3.4 Persistence

`emailConfirmed: boolean` lives on the email-keyed learner profile (alongside `themePreference`). Default `false`. Bootstrap endpoint returns it; `POST /api/learner/confirm-email` flips it to `true`. Graceful-degrade: if the DB column is missing, apps fall back to local-only confirmation storage via `readStoredEmailConfirmation` / `writeStoredEmailConfirmation` in `review-game-core/src/ui/identity-client.ts`.

### 3.5 A11y (shipped)

- Strip: `<div role="group" aria-label="Confirm saved email">`.
- Confirm button auto-focuses via `requestAnimationFrame` after the strip appears — one `Enter` press commits.
- sr-only live region (`role="status" aria-live="polite"`) announces the strip appearance.
- `Escape` is blocked while confirmation is pending (prevents accidental dismiss of the decision point).
- Outside-click still closes the panel — confirmation state persists for the next panel open.

### 3.6 Verification

Verified live on CS ([`profile-controls.tsx`](../../../../cs-unit-1-review-game/components/profile-controls.tsx)) following the full typo-recovery path:

| Step | Result |
|---|---|
| Type `bgottsahll@valdosta.edu`, click Save | Strip appears: `Is bgottsahll@valdosta.edu correct?` with `Yes, save` + `Edit`. Focus on `Yes, save`. |
| Click `Edit` | Input refocuses with the pending typo; strip still visible. |
| Type `bgottshall@valdosta.edu` | Strip clears; Save button relabels to `Update email` and enables. |
| Click `Update email` | New strip appears with corrected email. |
| Click `Yes, save` | Strip dismisses; message reads `Email confirmed for bgottshall@valdosta.edu.`; Save relabels to `Save email` disabled. |

Happy-path cost: one extra click (`Yes, save`).

---

## 4. Anonymous mode + dismissal memory

`anonymousNote` shows when `currentEmail` is null. The "Use anonymous mode" button calls `onGoAnonymous`. Returning anonymous users do **not** see the panel auto-open on every visit — each composite wrapper checks `readIdentityFloatDismissed()` before seeding `openPanel = 'identity'`, and calls `markIdentityFloatDismissed()` the first time the user closes the float.

### 4.1 Auto-open rules (first visit only)

The float auto-opens only when **all three** are true at mount:
1. The user has no attached email (`currentEmail` is null/anonymous).
2. `readIdentityFloatDismissed()` returns `false`.
3. The parent passes no explicit `open` prop that overrides.

On subsequent visits — after the user has closed the float once — the flag persists and anonymous users see the float in its collapsed state. The trigger button still reads `Anonymous` (muted color), so attachment remains one click away.

### 4.2 Helpers (shipped in `identity-client.ts`)

```ts
export const readIdentityFloatDismissed = (storage?: Storage): boolean
export const markIdentityFloatDismissed = (storage?: Storage): void
export const clearIdentityFloatDismissed = (storage?: Storage): void
```

Storage key: `review-games:identity-float-dismissed`. Value: `'true'` or absent. Per-origin (each app's localStorage is independent; in production, if all games share an origin, the flag carries across).

### 4.3 Consumer wiring

Every composite wrapper (CS `ProfileControls`, MATH 1111 / 1401 / ASTR `theme-toggle.tsx`) follows this pattern:

```tsx
// Initial open state — check dismiss flag before auto-opening
const [openPanel, setOpenPanel] = useState<OpenPanel>(() => {
  if (typeof window === 'undefined') return null
  if (isEmailLearnerId(getLearnerId())) return null
  if (readIdentityFloatDismissed()) return null
  return 'identity'
})

// onOpenChange — mark dismissed whenever the user closes
<IdentityFloat
  open={openPanel === 'identity'}
  onOpenChange={(next) => {
    setOpenPanel(next ? 'identity' : null)
    if (!next) markIdentityFloatDismissed()
  }}
  // ...
/>
```

### 4.4 When to call `clearIdentityFloatDismissed`

Rare. Only in these cases:
- **Tests**: reset between test cases.
- **Explicit "re-prompt" action**: a future settings UI might offer "show identity prompt again." Wire it to `clearIdentityFloatDismissed()`.

Never clear silently in response to a normal state change (sign-out, theme reset, etc.) — the user's dismiss signal should persist.

---

## 5. A11y (current)

Already handled by the shipped component. Recap for completeness:

- Container: `aria-label="Learner association"`
- Toggle: `aria-expanded` + dynamic `aria-label` (Close / Open learner association)
- Email input: `aria-label="Learner email"`
- Message: `role="status"` for post-action confirmation

Confirmation strip (§3.5) adds one more `role="group"` landmark. No other a11y changes.

---

## 6. Migration status + remaining steps

**Landed in the UX-cleanup pass** (already in `review-game-core/src/ui/identity-float.tsx`):

- ✅ Short default copy per §1 (`"Save email"`, `"Use anonymous mode"`, new short description / anonymous note).
- ✅ New `updateLabel` prop + state-aware label: `"Update email"` when `currentEmail` is attached and the draft differs.
- ✅ `<form>` wrapper with `onSubmit` preventing default, `type="submit"` on Save, `Enter`-to-save.
- ✅ `autoComplete="email"` + `name="email"` + `type="email"` on input.
- ✅ `Save` disabled when draft === currentEmail (no-op submit blocked).
- ✅ `Escape` + outside-click close the panel; focus returns to trigger.
- ✅ Dynamic `aria-label` on trigger includes current learner: `"Learner: {email|'Anonymous'}. {Open/Close} learner association."`
- ✅ `is-anonymous` class on trigger when no email attached — muted color cue.
- ✅ CS's override props dropped — defaults match.

**All mounts landed:**

| App | Mount path | Notes |
|---|---|---|
| MATH 1111 | [`components/theme-toggle.tsx`](../../../../math-1111-review-game/components/theme-toggle.tsx) — composite of `<ThemeSwitcher>` + `<IdentityFloat>`, rendered from `app/layout.tsx` inside `.app-topbar-shell` | auto-opens for anonymous; panels mutually exclusive |
| MATH 1401 | [`components/theme-toggle.tsx`](../../../../stats-exam-prep-game/components/theme-toggle.tsx) — same composite pattern | same |
| ASTR 1020K | [`components/theme-toggle.tsx`](../../../../astr-unit-1-review-game/components/theme-toggle.tsx) — composite, mounted in [`app/home-client.tsx`](../../../../astr-unit-1-review-game/app/home-client.tsx) | page-level (not layout); wires `legacy learner claim` during email save |
| CS 1301K | [`components/profile-controls.tsx`](../../../../cs-unit-1-review-game/components/profile-controls.tsx) — composite with `showIdentity` prop | quiz-shell passes `showIdentity={false}` to hide the identity float during sessions |

**Confirmation loop — shipped.** See §3 above and `review-game-core/src/ui/identity-client.ts` for the local-storage persistence helper (`readStoredEmailConfirmation` / `writeStoredEmailConfirmation`).

---

## 7. Cross-references

- Component file: [`review-game-core/src/ui/identity-float.tsx`](../../src/ui/identity-float.tsx)
- CS reference usage: [`cs-unit-1-review-game/components/profile-controls.tsx`](../../../cs-unit-1-review-game/components/profile-controls.tsx)
- Header audit findings: `header-audit.md` §3.4, §4 R4/R7
- Theme-switcher copy and states: `theme-switcher.md`
- Voice family: `metadata-voice.md`
