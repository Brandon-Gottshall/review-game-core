# StateDot + StateLegend

Documents the shipped phase-state dot palette and its legend. Use these anywhere the learner sees per-concept, per-section, or per-exam mastery status.

**Components:** [`<StateDot>`, `<StateLegend>`](../../src/ui/state.tsx)
**Consumes:** `PhaseState`, `PHASE_STATE_ORDER`, `PHASE_STATE_LABELS` from `review-game-core/src/scheduler/phase-state.js` (canonical enum shipped by the parallel phase-extraction thread).

---

## 1. Phase-state vocabulary

Six states, in canonical order (from `PHASE_STATE_ORDER`):

| State | Label (from `PHASE_STATE_LABELS`) | Meaning |
|---|---|---|
| `not_started` | Not started | Learner has not attempted this concept yet |
| `learning` | Learning | Guided reps in progress; support level high |
| `practicing` | Practicing | Support fading; independent attempts beginning |
| `mastered` | Mastered | Hard-proof target met; retention bucket |
| `shaky` | Shaky | Recovery-light triggered after a hard miss |
| `tracked_in_quiz` | Tracked in quiz | Concept has session-level tracking but no independent evidence |

Do not invent variant phase names per app. If a new state is needed, propose it into `phase-state.ts` and this doc — never add a local enum.

---

## 2. `<StateDot>`

Shipped API:

```ts
type StateDotProps = {
  state: PhaseState
  size?: 'sm' | 'md' | 'lg'   // default: 'md'
  className?: string
  label?: string              // override the default aria/title label
}
```

### Sizes

| Size | Diameter | Use when |
|---|---|---|
| `sm` | `0.65rem` | Inside a `TopicRow` or other tight inline use |
| `md` | `0.8rem` (default) | Standalone row indicators, legend items |
| `lg` | `1rem` | Emphasis in a hero-level readiness badge |

### Colors (from [`theme.css`](../../theme.css) `:where(.rg-state-dot--{state})`)

| State | Light | Dark |
|---|---|---|
| `not_started` | `var(--rg-border)` (muted gray) | same token (auto dark) |
| `learning` | yellow-orange (`color-mix` of `--rg-warn` + orange) | same |
| `practicing` | `var(--rg-accent)` (brand teal) | `var(--rg-accent)` |
| `mastered` | `var(--rg-good)` | `var(--rg-good)` |
| `shaky` | `var(--rg-bad)` | `var(--rg-bad)` |
| `tracked_in_quiz` | `var(--rg-surface)` with `--rg-border` ring | same |

All tokens come from `theme.css`. Do not hard-code palette values in consumers.

### A11y

- Default `aria-label` comes from `PHASE_STATE_LABELS[state]`.
- Pass `label` to override when the surrounding text already names the state redundantly (avoid double-announcement).
- `title` attribute mirrors the aria-label — gives sighted users hover tooltips.

### Usage

```tsx
<StateDot state="practicing" />
<StateDot state={section.phase} size="sm" />
<StateDot state="mastered" label={`${topic.label}: mastered`} />
```

---

## 3. `<StateLegend>`

Drop-in legend that renders all six states in canonical order with labels. Shipped API:

```ts
type StateLegendProps = {
  className?: string
}
```

Renders as `.rg-card.rg-state-legend` with a `Phase legend` kicker and one `<StateDot>` + label per state. No configuration — purposefully opinionated so it's consistent across every game.

### Where to place it

On the landing page, above or near the expandable `<ExamRow>` / `<SectionRow>` / `<TopicRow>` hierarchy. Best placement: between the hero copy and the row list. One instance per page; do not repeat within the quiz.

### A11y

Container is `<div aria-label="What the phase dots mean">`. Dots inside are labeled; when a screen reader reads the legend, each item is announced as `"{color-dot} {label}"`.

### Overriding the palette in a branded theme

A custom theme (future, once `registeredThemes.length > 1`) can redefine the `--rg-state-dot--*` tokens via `[data-theme="{id}"]` in the preset. Do not branch the component for this — the CSS variable indirection is the extension point.

---

## 4. Non-goals

- **Do not** add a "complete" or "ready-to-prove" state in consumer apps. Mastered + retention is the terminal happy path.
- **Do not** attach click handlers to `<StateDot>`. It's a visual indicator; wrap it in a proper interactive element if filtering is needed.
- **Do not** apply the `is-{state}` family classes on arbitrary elements for coloring. Those classes exist on rows (`.rg-exam-row.is-mastered`, etc.) to drive row-level tint; don't repurpose them.

---

## 5. Cross-references

- Phase enum source: `review-game-core/src/scheduler/phase-state.ts`
- Row components that consume state for tint: `course-rows.md`
- Tokens: `tokens.md` §1.6 (panel backgrounds that pair with state), dots live in `theme.css` around lines 257–310
