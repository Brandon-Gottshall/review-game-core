# DeadlineStrip

Footer band showing the next assessment date for each exam/unit. Shipped in [`review-game-core/src/ui/deadline-strip.tsx`](../../src/ui/deadline-strip.tsx).

---

## 1. Purpose

Give learners a persistent, glanceable view of upcoming assessments without forcing them to open a calendar or a per-unit detail. Placed at the bottom of the landing page, pinned under the row hierarchy.

Consumes `ExamNode.assessmentDates[]` from the canonical course hierarchy (`review-game-core/src/concept/hierarchy.ts`).

---

## 2. Shipped API

```ts
type DeadlineStripProps = {
  units: readonly ExamNode[]
  now?: Date              // default: new Date()
  className?: string
}
```

For each unit, the strip resolves the **next assessment** via this rule:

1. Sort `assessmentDates` ascending by `.date`.
2. Pick the first entry at or after `now`.
3. Fall back to the most recent entry if none are upcoming.
4. If the unit has no assessment dates, render `"No assessment date"`.

---

## 3. Variants (tone classes from `getDeadlineTone`)

| Tone | Trigger | Visual intent |
|---|---|---|
| `is-upcoming` | Date is in the future | Default — muted border, neutral text |
| `is-today` | Relative date = `"Today"` | Accent border, emphasized text |
| `is-past` | Relative date ends with `"ago"` or is `"Yesterday"` | Warning border, muted text |

These are applied as class modifiers on `.rg-deadline-strip__item`. Theme preset (`theme.css`) provides the per-tone styling; do not re-style from consumer CSS.

---

## 4. Layout

Renders as a `<footer aria-label="Upcoming assessment dates">` with `.rg-card .rg-deadline-strip`. Internal structure:

```
[ Exam 1  │ Mar 15 · In 3 days  ]
[ Exam 2  │ Apr 10 · In 29 days ]
[ Exam 3  │ May 6  · Today      ]
[ Final   │ No assessment date  ]
```

One row per unit. The label is left-aligned, the meta (date + relative time) is right-aligned via `.rg-deadline-strip__item { justify-content: space-between }`.

### Responsive

Single-column on mobile (the row's flex layout accommodates stacking via existing chip wrap). Do not override — the preset handles it.

---

## 5. A11y

- Container `<footer>` with `aria-label` gives it a navigable landmark.
- Each item announces "Exam 1, Mar 15, In 3 days" when focused/read via screen-reader linear order.
- No interactive elements in the strip itself (glanceable only). If a consumer wants the strip to link to exam detail, wrap each `.rg-deadline-strip__item` in a Link externally — don't add click handlers to the strip.

---

## 6. Placement

- Landing page: pinned at the end of the main content, after the row hierarchy.
- Quiz chrome: do not render — learners inside a session shouldn't be distracted by the next deadline.

---

## 7. Copy rules

- Label: from `unit.label` — no decoration.
- Meta when a date exists: `"{formatted-date} · {relative-day}"` (e.g., `"Mar 15 · In 3 days"`).
- Relative labels come from `formatRelativeDay` in `utils.ts`:
  - `Today`, `Tomorrow`, `Yesterday`, `In N days`, `N days ago`.
- Empty state: `"No assessment date"` — single sentence, do not wordsmith per app.

---

## 8. Consumer example

```tsx
import { DeadlineStrip } from '@brandon-gottshall/review-game-core/ui'
import { courseHierarchy } from '@/lib/course-hierarchy'

<DeadlineStrip units={courseHierarchy.units} />
```

For WF testing, pass a deterministic `now` prop so the tone classes are stable:

```tsx
<DeadlineStrip units={courseHierarchy.units} now={new Date('2026-04-19')} />
```

---

## 9. Non-goals

- **Do not** add a "N days until" countdown that updates live. Relative date refreshes on render; that's sufficient.
- **Do not** filter out past assessments automatically. The fallback to the most recent entry intentionally shows "3 days ago" so the learner can see they missed it.
- **Do not** add a calendar-link export. Out of scope; revisit if product needs it.

---

## 10. Cross-references

- Data model: `review-game-core/src/concept/hierarchy.ts` (`ExamNode.assessmentDates`)
- Format helpers: `review-game-core/src/ui/utils.ts` (`formatIsoDate`, `formatRelativeDay`)
- Tokens: `theme.css` `.rg-deadline-strip__item.is-{past|today|upcoming}`
- Row hierarchy context: `course-rows.md`
