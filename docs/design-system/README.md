# `review-game-core` Design System

Shared design artifacts for every review game built on `review-game-core`. These docs are consumed by in-app developers and the fork agent's Tailwind preset / shared-UI package.

## What lives here

### Tokens + base treatments

| Doc | Purpose |
|---|---|
| [`tokens.md`](./tokens.md) | Color, typography, spacing, radius, shadow, motion tokens. Source of truth for the Tailwind preset at [`review-game-core/theme.css`](../../theme.css). |
| [`focus-states.md`](./focus-states.md) | Canonical focus / hover / pressed behavior. Matches the unified `:focus-visible` treatment shipped in the preset. |
| [`rollout-alignment.md`](./rollout-alignment.md) | Diff between the spec and the shipped preset — naming renames, accepted simplifications, long-tail tokens still to port. |

### Components

| Doc | Shipped component(s) |
|---|---|
| [`identity-float.md`](./identity-float.md) | `<IdentityFloat>` — email-tied learner identity control + confirmation-loop spec |
| [`theme-switcher.md`](./theme-switcher.md) | `<ThemeSwitcher>` — theme-family + color-scheme picker (§12 amendment documents the chip radiogroup replacing the native `<select>`) |
| [`state-legend.md`](./state-legend.md) | `<StateDot>` + `<StateLegend>` — six-state phase-state palette + legend |
| [`deadline-strip.md`](./deadline-strip.md) | `<DeadlineStrip>` — assessment-date footer with past/today/upcoming tones |
| [`course-rows.md`](./course-rows.md) | `<ExamRow>` / `<SectionRow>` / `<TopicRow>` / `<CourseHierarchyRows>` — expandable three-level course hierarchy |
| [`cram-mode.md`](./cram-mode.md) | `<CramBanner>` + `<CramTimer>` — active cram-session surface with urgent/complete states |

### Voice + accessibility

| Doc | Purpose |
|---|---|
| [`metadata-voice.md`](./metadata-voice.md) | Unified "Concept Mastery" `<title>` / `<meta description>` voice + shipped `buildGameMetadata()` helper |
| [`a11y-baseline.md`](./a11y-baseline.md) | Canonical ARIA patterns for shared components + historical gap list (now closed in core/src/ui) |
| [`quiz-chrome-typography.md`](./quiz-chrome-typography.md) | Typography reference for quiz shell, panels, steps, choices |

### Operational

| Doc | Purpose |
|---|---|
| [`header-audit.md`](./header-audit.md) | Cross-app topbar audit. Current build state + remaining gaps (IdentityFloat mounts in MATH/ASTR, ASTR `<html>` hydration fix, CS quiz-shell density trim) |

## Who consumes this

- **Fork agent** — Tailwind preset and core/src/ui components read the tokens, state vocabulary, and migration tables here.
- **In-app developers** — reference any of these when mounting shared components or adding escape-hatch CSS in a per-app `globals.css`.
- **Shared UI components** (`review-game-core/src/ui`) — every new component must honor the tokens, focus rules, and a11y patterns here.

## Cross-cutting context

- `../product-framing.md` — why "Concept Mastery" framing drives the metadata voice.
- `../guided-repetition-policy.md` — defines the canonical Recognize → Structure → Prove → Retain ladder behind the "learn, prove, and retain" phrasing.
- `review-game-core/src/scheduler/phase-state.ts` — the canonical `PhaseState` enum that drives every state-aware component (`<StateDot>`, `<StateLegend>`, row tinting).
- `review-game-core/theme.css` — the Tailwind v4 preset realizing `tokens.md` and `focus-states.md`.

## Voice

Match the sibling docs in this directory — plain prose, tables where they help, imperative for rules, rationale for decisions. No marketing tone.
