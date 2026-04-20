# CramBanner + CramTimer

Surface for an active cram-mode session — time-boxed breadth sweep, typically 10/20/30 minutes. Shipped in [`review-game-core/src/ui/cram.tsx`](../../src/ui/cram.tsx).

Consumes `CramSession` from `review-game-core/src/workflow/cram-mode.ts`.

---

## 1. Shipped APIs

### `<CramTimer>`

```ts
type CramTimerProps = {
  session: CramSession
  className?: string
}
```

Displays remaining time as `M:SS`, ticking every 1s via `setInterval`. Stops when `session.state === 'complete'` or `session.endsAt` is unset. When complete, renders the word `Complete` in place of the time.

### `<CramBanner>`

```ts
type CramBannerProps = {
  session: CramSession
  examLabel: string           // e.g., "Exam 3 Prep"
  coveredCount?: number       // optional progress numerator
  totalCount?: number         // optional progress denominator
  description?: string | null // optional sub-copy under the heading
  className?: string
}
```

Renders as a `<section aria-label="Cram session">` with:
- Left column: `Cram mode` kicker, `<h3>` with `examLabel`, optional description, optional `{covered}/{total} concepts covered` line.
- Right column: duration chip (`{minutes} min`) + `<CramTimer>`.

---

## 2. States (from `CramSession.state`)

| State | `tickCramSession` trigger | Visual | Behavior |
|---|---|---|---|
| `idle` | Session created but not started | Normal `.rg-card` styling; timer would read `0:00` until started (`startedAt`/`endsAt` populated) | Hide the timer or show "Ready" — consumer's call. The banner itself still renders. |
| `running` | `now < endsAt` | Default accent treatment | Timer counts down. |
| `urgent` | `endsAt - now ≤ CRAM_URGENT_THRESHOLD_MS` (currently 2 min) | `.is-urgent` class adds warn-border + pulse via `cram-pulse` keyframe | Timer text takes `--rg-warn` color; pulse animation draws the eye. |
| `complete` | `now ≥ endsAt` | `.is-complete` class mutes color and replaces timer with `Complete` | Timer stops ticking. Banner stays visible so the learner can review completion. |

State transitions are computed by `tickCramSession(session, now)` — pure function, no side effects. Banner recomputes on every render; the timer recomputes on its own `setInterval` cadence.

---

## 3. Visual treatment

All styling lives in `theme.css` under `.rg-cram-banner` and `.rg-cram-timer`. Specific tokens:

| Class | Tokens |
|---|---|
| `.rg-cram-banner` | `.rg-card` base + section padding |
| `.rg-cram-banner.is-urgent` | `border-color: var(--rg-warn)`, pulsing via `cram-pulse` keyframe |
| `.rg-cram-banner.is-complete` | muted background, `--rg-muted` text |
| `.rg-cram-timer` | monospace numerals, large enough to read at distance |
| `.rg-cram-timer.is-urgent` | `color: var(--rg-warn)`, pulsing |
| `.rg-cram-timer.is-complete` | `color: var(--rg-muted)` |

### Duration chip

A `.rg-chip` in the right column shows the total session duration (e.g., "20 min"). Static — does not animate. Gives context so the timer countdown is interpretable ("3:42 remaining out of 20").

### Animation note

The `cram-pulse` keyframe runs at 2s duration, alternating opacity 1 ↔ 0.5. Tune via `theme.css` if motion feels too aggressive. Respect `prefers-reduced-motion` in a future pass (currently does not gate).

---

## 4. A11y

- Banner `<section aria-label="Cram session">` provides a named landmark.
- Timer carries `aria-label={\`${formatRemaining(remainingMs)} remaining\`}`; screen readers announce the live remaining time on focus or via live-region consumers.
- For a screen-reader-only live announcement during `urgent` state, wrap `<CramBanner>` with a `<div role="status" aria-live="polite">` at the consumer level and push a message ("Under 2 minutes remain.") when the transition occurs. The component doesn't do this automatically because the cadence should be per-game.

---

## 5. Placement

- **Landing page, during an active cram session**: render above the row hierarchy so the learner sees countdown + target coverage while browsing concepts.
- **Quiz shell, during a cram session**: render in the header band above the question. Duration chip + timer only (consider a compact variant later if needed — not shipped yet).
- **After completion**: leave the banner visible for ~10s then fade or dismiss at the consumer level. Do not auto-dismiss inside the component.

---

## 6. Copy rules

- Kicker: `Cram mode` — always. Do not translate per app.
- Heading: `examLabel` from consumer — matches the user's actual target (e.g., `"Exam 3 Prep"`, `"Final Exam Cram"`).
- Description: optional one-liner. Keep short; this is a status banner, not a hero card.
- Progress: `{covered}/{total} concepts covered` — keep "concepts" terminology; do not swap for "topics" etc. It aligns with the underlying concept-tree shape.
- Complete state: the word `Complete` replaces the timer. No exclamation, no emoji.

---

## 7. Consumer example

```tsx
import { CramBanner, isUrgentCramSession } from '@brandon-gottshall/review-game-core/ui'
import { startCramSession } from '@brandon-gottshall/review-game-core/workflow/cram'

const session = startCramSession({
  examId: 'exam3',
  durationMs: 20 * 60 * 1000,
  now: new Date(),
})

<CramBanner
  session={session}
  examLabel="Exam 3 Prep"
  coveredCount={7}
  totalCount={18}
  description="Sampling distributions, confidence intervals, hypothesis tests"
/>
```

For a just-duration variant (no progress counts), omit `coveredCount` / `totalCount`.

---

## 8. Non-goals

- **Do not** add a "pause" button. Cram is a time box — pausing dilutes the behavioral pressure that the mode is meant to create.
- **Do not** show a post-completion score inside the banner. Completion semantics are a session-engine concern; route the learner to a dedicated results surface.
- **Do not** let consumers extend the session mid-flight. If product wants "+5 minutes", add a proper `extendCramSession` action in `workflow/cram-mode.ts` and surface it as a separate button — don't bolt it into the banner prop surface.

---

## 9. Cross-references

- State machine: `review-game-core/src/workflow/cram-mode.ts`
- Session engine integration: fork-spec A-6
- Landing layout placement: `course-rows.md` §6
- Tokens for urgent/complete states: `theme.css` `.rg-cram-*` rules
