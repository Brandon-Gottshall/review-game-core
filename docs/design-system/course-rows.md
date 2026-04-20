# ExamRow / SectionRow / TopicRow + CourseHierarchyRows

Expandable three-level course-hierarchy surface. Shipped in [`review-game-core/src/ui/course-rows.tsx`](../../src/ui/course-rows.tsx).

Canonical shape consumed: `CourseHierarchy` (`exam → section → topic`) from `review-game-core/src/concept/hierarchy.ts`. Readiness data consumed: `ReadinessScore` from `review-game-core/src/readiness/index.ts`.

---

## 1. The three components

| Component | Tag | Role | Expandable? |
|---|---|---|---|
| `<ExamRow>` | `<article>` | Top-level exam / unit | ✓ — reveals its sections |
| `<SectionRow>` | `<li>` inside `<ul>` | Mid-level section | ✓ — reveals its topics |
| `<TopicRow>` | `<li>` inside `<ul>` | Leaf topic | no |

Plus `<CourseHierarchyRows>`, a convenience wrapper that renders an entire `CourseHierarchy` with shared readiness and expand/collapse state.

---

## 2. Shipped APIs

### `<TopicRow>`

```ts
type TopicRowProps = {
  topic: TopicNode
  readiness?: ReadinessScore
}
```

Renders a `<StateDot size="sm">` + `topic.label` + phase-state meta label. Non-interactive.

### `<SectionRow>`

```ts
type SectionRowProps = {
  section: SectionNode
  readiness?: ReadinessScore
  topicReadiness?: Record<string, ReadinessScore | undefined>
  expanded?: boolean
  onToggle?: () => void
  renderAction?: ReactNode   // right-side action slot
}
```

Collapsed: a toggle button (caret + state dot + title + "{mastered}/{total} topics mastered" meta) plus optional `renderAction`.
Expanded: ordered list of `<TopicRow>` children.

Uses the `data-rg-rowtoggle="true"` attribute on the toggle so the shared arrow-key helper in `utils.ts` routes keyboard navigation between sibling toggles.

### `<ExamRow>`

```ts
type ExamRowProps = {
  exam: ExamNode
  readiness?: ReadinessScore
  sectionReadiness?: Record<string, ReadinessScore | undefined>
  topicReadiness?: Record<string, ReadinessScore | undefined>
  expanded?: boolean
  expandedSectionId?: string | null
  onToggle?: () => void
  onToggleSection?: (sectionId: string) => void
  renderExamAction?: ReactNode
  renderSectionAction?: (section: SectionNode) => ReactNode
  now?: Date   // default: new Date()
}
```

Collapsed: toggle (caret + title + "N% ready · M/T sections mastered" meta + optional deadline chip).
Expanded: optional `renderExamAction` slot, then a list of `<SectionRow>` children with `data-rg-rowlist="true"` on the list wrapper (enables keyboard navigation inside the exam).

### `<CourseHierarchyRows>`

```ts
type CourseHierarchyRowsProps = {
  hierarchy: CourseHierarchy
  readinessById?: Record<string, ReadinessScore | undefined>
  expandedExamId?: string | null
  expandedSectionId?: string | null
  onToggleExam?: (examId: string) => void
  onToggleSection?: (sectionId: string) => void
}
```

Renders a `<section aria-label="Course readiness hierarchy">` with one `<ExamRow>` per `hierarchy.units`. Best default for landing pages that want the whole tree.

---

## 3. Visual treatment

Each row carries one of the six phase-state classes (`.is-not_started`, `.is-learning`, `.is-practicing`, `.is-mastered`, `.is-shaky`, `.is-tracked_in_quiz`) plus `.is-expanded` when open. The preset (`theme.css`) tints the card border and background per state.

### Expansion caret

- `▸` (collapsed) / `▾` (expanded), `aria-hidden="true"`, precedes the state dot.
- Pure text glyphs — no icon font.

### Action slots

- `renderExamAction` — right-aligned inside `.rg-exam-row__actions`. Use for the primary CTA (Launch prep, Resume, etc.).
- `renderSectionAction` — right-aligned inside `.rg-section-row__action`. Use for secondary CTAs (Quick prep 10 min, Reinforce).

Consumers own the CTA copy and click handler. The row doesn't assume any action label or behavior.

---

## 4. Interaction

### Click

- Click the toggle to expand / collapse. Controlled via `expanded` + `onToggle` props.
- Only one section can be expanded per exam in `<ExamRow>` (`expandedSectionId` is a single id, not a set). If the product needs multi-open, the parent can track a set and pass the expanded state per section.

### Keyboard

WAI-ARIA TreeView pattern (partial — Up/Down stay within-level rather than visible-order, per shipped design):

- `Tab` enters the first toggle in the `data-rg-rowlist` group.
- `ArrowDown` / `ArrowUp` move focus between sibling toggles within the same `data-rg-rowlist`.
- `ArrowRight` on a **collapsed** row expands it; on an **already expanded** row descends to the first child toggle.
- `ArrowLeft` on an **expanded** row collapses it; on a **collapsed** row ascends to the parent toggle (no-op at root).
- `Home` / `End` jump to the first / last toggle in the nearest `data-rg-rowtree` root.
- `Enter` / `Space` toggles the focused row (native button behavior).
- `Escape` does not close rows — rows are persistent navigation, not dialogs.

The outer `<CourseHierarchyRows>` section carries `data-rg-rowtree="true"` so Home/End and tree-wide queries resolve. Each list at every level carries `data-rg-rowlist="true"` so within-level Up/Down works.

Verified via [`tests/course-rows.test.tsx`](../../tests/course-rows.test.tsx) — 8 cases covering expand, collapse, descend, ascend, sibling nav, Home, End, and root-boundary no-op.

---

## 5. A11y

- Toggles use `aria-expanded={expanded}`.
- State dots inside rows consume `<StateDot>`, which labels the state (see `state-legend.md`).
- The `<section aria-label="Course readiness hierarchy">` at the root gives screen readers a landmark.

Per-row landmark noise is intentional: `<article>` for exams (standalone readable unit), `<li>` for sections/topics (part of a list). Screen readers announce count ("3 of 4 sections") automatically via the `<ul>` they're inside.

---

## 6. Placement

- Landing page main: inside the hero-adjacent content column. One `<CourseHierarchyRows>` instance.
- Do not render in quiz-shell — scope overload for an in-session learner.
- Do not wrap in an extra `<section>` at consumer level — `<CourseHierarchyRows>` already is one.

---

## 7. Copy rules

- Exam meta (collapsed): `"{N}% ready · {M}/{T} sections mastered"` — preset copy; do not localize per app.
- Section meta (collapsed): `"{M}/{T} topics mastered"` — same.
- Deadline chip (when available): formatted via `formatIsoDate` + `formatRelativeDay`.
- Topic meta: `PHASE_STATE_LABELS[state]`.

If a game needs different language (e.g., "units" instead of "sections"), change `SectionNode.label` upstream in course data — not in this component.

---

## 8. Consumer example

```tsx
import { CourseHierarchyRows } from '@brandon-gottshall/review-game-core/ui'
import { courseHierarchy } from '@/lib/course-hierarchy'
import { useReadiness } from '@/lib/readiness-hook'

export function LandingRows() {
  const [expandedExam, setExpandedExam] = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const readinessById = useReadiness()

  return (
    <CourseHierarchyRows
      hierarchy={courseHierarchy}
      readinessById={readinessById}
      expandedExamId={expandedExam}
      expandedSectionId={expandedSection}
      onToggleExam={(id) => {
        setExpandedExam(prev => prev === id ? null : id)
        setExpandedSection(null)
      }}
      onToggleSection={(id) => {
        setExpandedSection(prev => prev === id ? null : id)
      }}
    />
  )
}
```

For customized action slots, use `<ExamRow>` directly with `renderExamAction` + `renderSectionAction`.

---

## 9. Non-goals

- **Do not** add drag-to-reorder. Course hierarchy is authoritative and static per game.
- **Do not** make `<TopicRow>` interactive by default. If a consumer needs "click a topic to launch a micro-quiz", wrap the topic label at the consumer level.
- **Do not** compute readiness inside rows. Pass in `readiness` props; the scheduler owns the computation (see `review-game-core/src/readiness/`).

---

## 10. Cross-references

- Hierarchy shape: `review-game-core/src/concept/hierarchy.ts`
- Readiness shape: `review-game-core/src/readiness/index.ts`
- Phase-state vocabulary: `state-legend.md`
- Deadline strip sibling surface: `deadline-strip.md`
- Cram-mode banner that sits above rows during an active session: `cram-mode.md`
