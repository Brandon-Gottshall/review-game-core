# Accessibility Baseline

Current a11y posture + concrete gap list for the two reference apps, plus the canonical patterns every shared UI component must meet. The fork agent's `review-game-core/ui` components inherit these rules.

**Scope:** hero + landing widgets (identity float, goal float, next-up card, goal planner). Quiz-client a11y is tracked separately in `quiz-chrome-typography.md` and the fork agent's D-16 / D-17 extractions.

---

## 1. Current posture

### 1.1 What's already labeled well

Both MATH 1111 and MATH 1401:

- `<main>` implicit landmark present.
- Hero headline is a proper `<h1>`.
- Identity float container: `aria-label="Learner association"` (1111 [page.tsx:322](../../../../math-1111-review-game/app/page.tsx#L322), 1401 [page.tsx:663](../../../../stats-exam-prep-game/app/page.tsx#L663)).
- Identity float toggle button: `aria-expanded` bound to state (1111 [page.tsx:326–327](../../../../math-1111-review-game/app/page.tsx#L326), 1401 [page.tsx:667–668](../../../../stats-exam-prep-game/app/page.tsx#L667)).
- Email input: `aria-label="Learner email"` on both apps.
- Status feedback: `role="status" aria-live="polite"` on `.identity-float-feedback` in 1111; equivalent pattern in 1401.
- Cards with explicit labels: 1401's `.nextUpCard` has `aria-label="Recommended next track"` ([page.tsx:533](../../../../stats-exam-prep-game/app/page.tsx#L533)).
- 1111's readiness ladder: `aria-label="Readiness by test"` + `aria-label="What the dots mean"` on the state legend.
- Decorative glyphs (state-dot, toggle caret, icon unicode): `aria-hidden="true"`.

### 1.2 Global conventions to keep

- Decorative icons always `aria-hidden="true"`.
- Controls with text-content labels do not duplicate via `aria-label` — visible text is the label.
- Live-region feedback (`role="status" aria-live="polite"`) for post-action confirmations.
- `aria-expanded` on every disclosure button.

---

## 2. Gap list (fix in in-app polish item #9)

Each gap below is small and targeted. Paths are relative to the repo root.

| # | App | Selector / element | File:line | Gap | Fix |
|---|---|---|---|---|---|
| 1 | 1111 | `.identity-float-toggle` button | [math-1111-review-game/app/page.tsx:325](../../../../math-1111-review-game/app/page.tsx#L325) | Button has no `aria-label`; screen reader only hears the visible text ("Anonymous" or email). Open/close semantics unclear. | Add dynamic `aria-label={identityOpen ? 'Close learner association' : 'Open learner association'}` |
| 2 | 1401 | `.identityFloatToggle` button | [stats-exam-prep-game/app/page.tsx:666](../../../../stats-exam-prep-game/app/page.tsx#L666) | Same as 1111. | Same fix with 1401's state variable name. |
| 3 | 1111 | Hero `.next-up-hero` section (lines 463 and 475 render this twice based on state) | [math-1111-review-game/app/page.tsx:463](../../../../math-1111-review-game/app/page.tsx#L463), [:475](../../../../math-1111-review-game/app/page.tsx#L475) | Section has `data-testid` but no `aria-label`. The "Next up" heading is inside but the section wrapper is unlabeled. | Add `aria-label="Recommended next quiz"` to both call sites. |
| 4 | 1111 | Goal planner `.next-up-hero.goal-planner-card` | [math-1111-review-game/app/page.tsx:524](../../../../math-1111-review-game/app/page.tsx#L524) | Section unlabeled. | Add `aria-label="Goal planner"`. |
| 5 | 1401 | Goal float `.goalFloat` container | [stats-exam-prep-game/app/page.tsx:719](../../../../stats-exam-prep-game/app/page.tsx#L719) | Container is a `<div>`, not a `<section>`, and has no `aria-label`. The existing `aria-expanded` on the inner button works but the container has no announced identity. | Add `aria-label="Goal plan quick access"` on the container (or change to `<section>` and label). Start with `aria-label` only — keep tag change for the fork agent's extraction. |

---

## 3. Canonical patterns for shared components

The fork agent's `review-game-core/ui` components ship these patterns by default.

### 3.1 Disclosure buttons (floats, drawers, expandable rows)

```tsx
<button
  type="button"
  aria-expanded={isOpen}
  aria-controls={panelId}
  aria-label={isOpen ? `Close ${label}` : `Open ${label}`}
>
  {/* trigger content */}
</button>
<div id={panelId} role="region" aria-label={label} hidden={!isOpen}>
  {/* panel content */}
</div>
```

Applies to: `<IdentityFloat>` (D-17), `<GoalPlanner>` drawer (D-18), `<ExamRow>` / `<SectionRow>` / `<TopicRow>` toggles (D-14), `<ThemeSwitcher>` trigger (D-12).

### 3.2 Sections and regions

Every self-contained "card" that a screen-reader user might want to skip or navigate to directly gets either a semantic element (`<section>`, `<nav>`, `<aside>`) with an `aria-label` or `aria-labelledby`, or a `<div role="region" aria-label="...">`.

### 3.3 Form inputs

Every `<input>` has a label relationship — either a wrapping `<label>` with visible text, or `aria-labelledby`, or (as last resort) `aria-label`. No bare inputs.

### 3.4 Live regions

Post-action confirmations (save, error, recover) use `role="status" aria-live="polite"` on a container that persists across renders. Errors that demand attention use `role="alert"` (`aria-live="assertive"` implicit).

### 3.5 Keyboard patterns (shipped defaults)

Every interactive control in `review-game-core/src/ui` follows one of these patterns. New components should too.

**Panel disclosures** (`<ThemeSwitcher>`, `<IdentityFloat>`):
- `Enter`/`Space` on trigger opens/closes
- `Escape` closes and returns focus to the trigger (blocked during confirmation-pending states — see `identity-float.md §3.5`)
- Outside-click closes
- `aria-expanded` bound to state; trigger carries dynamic `aria-label` including current value

**Radio groups** (`<ThemeSwitcher>` theme-family + color-scheme chips):
- Single tab stop: selected chip has `tabIndex={0}`, rest have `tabIndex={-1}`
- `ArrowLeft` / `ArrowRight` / `ArrowUp` / `ArrowDown` move focus + commit selection (selection-follows-focus)
- `Home` / `End` jump to first / last chip + commit
- Navigation wraps at both ends
- Shared helper: `handleRadioGroupKeyDown` at the top of `theme-switcher.tsx`

**Forms with a primary action** (`<IdentityFloat>`, `<GoalPlannerCard>`):
- Wrap fields + primary action in `<form onSubmit={handler}>`
- Primary button uses `type="submit"` — `Enter` in any input submits
- Secondary button (clear, cancel, anonymous) uses `type="button"`
- Submit handler calls `event.preventDefault()` + the consumer callback

**Expandable rows** (`<ExamRow>`, `<SectionRow>`, WAI-ARIA TreeView partial adoption):
- `Enter` / `Space` on toggle — native button behavior
- `ArrowDown` / `ArrowUp` within a `data-rg-rowlist` group move focus to the sibling toggle
- `ArrowRight` expands a collapsed row; on an already-expanded row descends to the first child toggle
- `ArrowLeft` collapses an expanded row; on a collapsed row ascends to the parent toggle (no-op at root)
- `Home` / `End` jump to the first / last toggle in the nearest `data-rg-rowtree` root
- Single-tab-stop semantics (WAI-ARIA TreeView "activedescendant"): **not** adopted — every toggle remains tab-stoppable so Tab-through-all keyboards users are not forced into arrow-key navigation
- Shared helper: `handleTreeKeyDown` at the top of `course-rows.tsx`

**Simple disclosures** (`<SessionProgressCard>`):
- `Enter` / `Space` toggles; no `Escape` (it's a persistent disclosure, not a dialog)
- Tab moves past on natural DOM order
- Toggle carries `aria-expanded` + `aria-controls` pointing at the body's `id` (generated via `useId`) so screen readers announce the disclosure relationship explicitly

### 3.6 Focus-visible

Per `focus-states.md`. Every interactive control must have a visible focus indicator that passes WCAG 2.4.7. No `outline: none` without an explicit replacement treatment.

---

## 4. Out of scope for this baseline

- Color-contrast audits beyond the `--learning-panel-heading` check in `tokens.md` §2 — these are done per-component against the preset.
- Motion sensitivity (`prefers-reduced-motion`) — no component currently uses animations that require a reduced-motion variant; revisit when motion-heavy components ship.
- Internationalization — copy is currently English-only; a11y patterns don't change but string direction would.

---

## 5. Verification for the in-app polish

Per user's global WF doctrine:

- **Unit check:** after applying each fix in §2, query the a11y tree via `preview_eval`:
  ```js
  document.querySelector('[class*="identity-float-toggle"]').ariaLabel
  ```
  Expected: non-null, dynamic based on open state.

- **WF check:** a low-context agent opens each app, uses the tab key to reach each floating widget, and reports whether the screen-reader name announces the control's purpose (e.g., "Open learner association, collapsed, button"). Fail if the announcement is just "button" or the visible text without a label indicating purpose.
