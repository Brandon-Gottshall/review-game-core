# Quiz Chrome Typography

Typography reference for the quiz UI — breadcrumb, session-progress-summary, tutor-step prompts and labels, and the shared panels. These values are already aligned across `math-1111-review-game` and `stats-exam-prep-game`; this doc formalizes them so the fork agent's `<SessionProgressCard>` (D-16) and any future quiz-shell extractions ship identical treatments.

**Consumers:** the Tailwind preset, shared quiz-chrome components.

---

## 1. Quiz shell

| Role | Selector | Token | Value |
|---|---|---|---|
| Card background | `.quiz-card` | `--card-gradient` | light/dark per `tokens.md` §1.2 |
| Card border | `.quiz-card` | `--border` | `--border` |
| Card radius | `.quiz-card` | `radius-2xl` | `18px` |
| Card padding | `.quiz-card` | — | `24px 20px` (mobile: `18px 14px`) |
| Breadcrumb font-size | `.quiz-breadcrumb` | — | `0.92rem` |
| Breadcrumb color | `.quiz-breadcrumb` | `--muted` | `--muted` |
| Breadcrumb link color | `.quiz-breadcrumb-link` | `--accent-2` | `--accent-2` |
| Breadcrumb current color | `.quiz-breadcrumb-current` | `--text` | `--text`, `font-weight: 500` |
| Breadcrumb separator color | `.quiz-breadcrumb-separator` | `--muted` | `--muted` |

---

## 2. Session progress

| Role | Selector | Value |
|---|---|---|
| Summary | `.session-progress-summary` | `15px`, margin `0 0 4px` |
| Goal hint | `.session-goal-hint` | `0.9rem`, color `--muted`, margin `0` |
| Card (expandable) | `.session-progress-card` | radius `14px`, padding `16px 18px` |

When `<SessionProgressCard>` (fork agent D-16) ships, these rules collapse to utility-class equivalents on the preset.

---

## 3. Tutor panels

| Role | Selector | Value |
|---|---|---|
| Panel background | `.tutor-panel` | `--tutor-panel-bg` |
| Panel border | `.tutor-panel` | `--tutor-panel-border` |
| Panel heading color | `.tutor-panel h2`, `.tutor-heading` | `--tutor-heading-color` |
| Step prompt | `.tutor-step-prompt` | `1.08rem`, line-height `1.55` |
| Step label | `.tutor-step-label` | `13px`, letter-spacing `0.04em`, `font-weight: 700`, uppercase |

---

## 4. Stage / signal / walkthrough panels

| Panel | Selectors | Background token | Border token | Heading token |
|---|---|---|---|---|
| Stage | `.stage-panel`, `.stage-panel h2` | `--stage-panel-bg` | `--stage-panel-border` | `--stage-panel-heading` |
| Signal | `.signal-panel`, `.signal-panel h2` | `--signal-panel-bg` | `--signal-panel-border` | `--signal-heading-color` |
| Walkthrough | `.walkthrough`, `.walkthrough h2` | `--walkthrough-bg` | `--walkthrough-border` | `--walkthrough-heading` |
| Learning | `.learning-panel`, `.learning-panel h2` | `--learning-panel-bg` | `--learning-panel-border` | `--learning-panel-heading` (see `tokens.md` §2) |

Shared heading rule: `font-size: 14px`, uppercase, `letter-spacing: 0.04em`, `font-weight: 700`.

---

## 5. Step / choice / walkthrough controls

Rendered during multi-step quiz flows. Colors below come directly from `tokens.md` §1.7.

| Role | Selector | Notes |
|---|---|---|
| Step (default) | `.step` | `background: --step-bg`, `border: 1px solid --step-border` |
| Step active | `.step-active` | `border-color: --step-active-border`, `box-shadow: --step-active-shadow` |
| Step correct | `.step-correct` | `background: --step-correct-bg`, `border-color: --step-correct-border` |
| Step revealed | `.step-revealed` | `background: --step-revealed-bg`, `border-color: --step-revealed-border` |
| Step label | `.step-label` | `color: --step-label-color`, `13px`, uppercase, `letter-spacing: 0.04em` |
| Step kind | `.step-kind` | `color: --step-kind-color`, `13px`, `font-weight: 700` |
| Choice (default) | `.choice` | `background: --choice-bg`, `border: 1px solid --choice-border` |
| Choice selected | `.choice-selected` | `background: --choice-selected-bg`, `border-color: --choice-selected-border`, `color: --choice-selected-text` |

---

## 6. Inline / code

| Role | Selector | Value |
|---|---|---|
| Inline code | `.inline-code` | `background: --inline-code-bg`, `radius: 6px`, font-family: `"Menlo", "Consolas", monospace` |
| Ordered-data chip | `.ordered-chip` | `background: --ordered-chip-bg`, `border: 1px solid --ordered-chip-border` |

---

## 7. Migration note

These values are already aligned across 1111 and 1401. Once the Tailwind preset ships (fork agent B-8), every rule above becomes a utility-class composition. Scoped CSS modules in 1401's `page.module.css` that duplicate these values are replaced. Escape-hatch CSS in each app's `globals.css` stays under 300 lines per the fork-spec acceptance criteria.

---

## 8. Cross-references

- Color tokens: `tokens.md`
- Focus rings on interactive step/choice controls: `focus-states.md` §3.2
- A11y patterns for panels and expandable rows: `a11y-baseline.md` §3
