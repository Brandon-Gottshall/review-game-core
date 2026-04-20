# Focus, Hover, and Pressed States

Canonical interaction-state spec for every review game. As shipped in [`review-game-core/theme.css`](../../theme.css).

**Consumers:** the Tailwind preset, shared UI components, any escape-hatch per-app CSS that still styles interactives.

---

## 1. Unified `:focus-visible` rule

The preset applies one rule to every focused element — outline **and** box-shadow together, rather than switching treatment by control category:

```css
:focus-visible {
  outline: 2px solid var(--rg-accent);
  outline-offset: 3px;
  box-shadow: 0 0 0 4px var(--rg-focus-ring);
}
```

This supersedes the earlier draft's hybrid (outline for inputs, box-shadow for interactive surfaces). The unified treatment:
- Is simpler (one rule, no category decision)
- Reads as at-least-as-visible on every control type
- Matches WCAG 2.4.7 for every focusable element by default

`--rg-focus-ring` alpha values (from `tokens.md` §1.10):
- Light: `rgba(14, 122, 114, 0.22)`
- Dark: `rgba(83, 200, 187, 0.28)`

---

## 2. Hover

Existing `:hover` rules on `.rg-card`, `.rg-chip`, and component-specific selectors shift `border-color` to `var(--rg-accent)` and apply `var(--shadow-elevation-1)`. Keep them. The `:focus-visible` rule adds the ring on top; hover alone keeps the softer border shift.

---

## 3. Active / pressed

Currently the preset does not ship an explicit `:active` state. Interactive elements animate `transform` / `border-color` / `box-shadow` on hover → focus, and the transition settles back into the resting state when the user releases.

If a future pass wants a visible "pressed" state, add:

```css
:where(button, .rg-chip, .rg-card)[data-pressed]:not([aria-disabled="true"]),
:where(button, .rg-chip, .rg-card):active {
  transform: translateY(0);
  box-shadow: none;
  border-color: var(--rg-accent);
}
```

Not shipping today — no strong demand and the transition-on-release already reads as acknowledgement.

---

## 4. Disabled

```css
button:disabled,
input:disabled,
[aria-disabled="true"] {
  opacity: 0.56;
  cursor: not-allowed;
}
```

Disabled controls retain focus rings — they are still focusable via keyboard for context, and the ring tells the user where they are even when interaction is blocked.

---

## 5. Motion

Transitions on interactive surfaces use `var(--duration-fast) var(--ease-standard)` for transform / border / box-shadow changes. Body + broad theme transitions use `var(--duration-base) var(--ease-standard)` for background / color. See `tokens.md` §7.

---

## 6. Component-specific notes

### Form inputs (`input`, `textarea`, `select`)

Baseline `:focus-visible` from §1 applies. Inputs additionally shift `border-color` to `var(--rg-accent)` on focus (existing rule in theme.css), giving a two-layer indicator (ring + border).

### `<ThemeSwitcher>` / `<IdentityFloat>` triggers

Panel-opening buttons use the baseline `:focus-visible` ring. When `aria-expanded="true"`, no extra treatment — the open panel itself is the confirmation. Escape closes the panel and returns focus to the trigger (implemented in both components).

### Chip groups (`role="radiogroup"` with `role="radio"` children)

- Arrow keys move focus within the group and commit selection in one action (radiogroup semantics).
- Focused chip gets the baseline ring; selected chip uses `.is-selected` styling (accent background).
- Two chips can visually coexist as focused-but-not-selected for a moment during keyboard navigation — the ring distinguishes.

### Expandable rows (`<ExamRow>`, `<SectionRow>`)

Toggle buttons use the baseline ring. Arrow keys navigate siblings via `data-rg-rowlist` / `data-rg-rowtoggle` markers (see `course-rows.md` §4).

---

## 7. Historical note

An earlier draft of this spec proposed a hybrid: outline-based ring for form inputs, box-shadow-based ring for interactive surfaces. The shipped preset unified both into a single rule that layers outline + box-shadow. The unified approach is simpler and at-least-as-accessible. This doc is aligned to the shipped behavior; the hybrid is archived in `rollout-alignment.md` §5 for history.

---

## 8. Verification

- WCAG 2.4.7 (Focus Visible): `:focus-visible` applied to every focusable element; contrast of `--rg-accent` vs `--rg-surface` / `--rg-background` passes AA in both themes.
- Keyboard-only flow: tab through any surface in any app; every reachable control shows a visible ring.
- Disabled controls: tab lands on them; ring is visible even though interaction is blocked.
