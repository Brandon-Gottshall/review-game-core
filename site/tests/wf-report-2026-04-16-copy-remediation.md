# WF Report — 2026-04-16 (post copy remediation)

Entry URL: `http://127.0.0.1:3211/`

Persona: engineer evaluating whether `review-game-core` is a usable shared package.

This report certifies the site after the copy remediation pass. The previous report for this date (`wf-report-2026-04-16.md`) remains untouched as a timestamped record of the pre-remediation site.

## Checklist Results

| Item | Outcome | Visible Path Taken | Notes |
| --- | --- | --- | --- |
| Entry | pass | `/` | The hero copy identifies the package as "Route the learner. Stage the proof. Schedule the return." and the body names the learning loop. |
| Mechanism | pass | `/` | The first spotlight names all six phases of the quiz engine (routing, question, staged-answer, support, recovery, complete). The hero body states "three independent passes." Both are recoverable from one screen. |
| Routing | pass | `/` -> `/docs` via `Read the docs` | The docs entry point is discoverable from the home hero. |
| Task Progression | pass | `/docs` -> `/docs/planning-goals` | The planning docs page is discoverable from the docs index and sidebar. |
| Interpretation | pass | `/docs/planning-goals` -> `/showcase/features/planning-goals` | The feature page explains what the planning abstraction does and includes a real consumer adapter example. The source snippet now extends through `evaluateGoalPlan`, so the reader sees behavior, not just types. |
| Interpretation | pass | `/docs/workflow-core` | The quiz engine section now precedes session and debug helpers. The six-phase bulleted list appears above the session/debug subsections. |
| Interpretation | pass | `/showcase/features/wf-harness` | The worked example calls `validateConceptConsistency` and renders `ValidationResult[]` output showing duplicate-ID and orphan-concept failures. The page's subsystem and its example now match. |
| Routing | pass | `/docs/planning-goals` -> `/showcase/features/planning-goals` | The in-page link reaches the feature without hidden routes. |
| Completion | pass | `/showcase/features/planning-goals` -> `/docs/installation` | The installation path is reachable from docs navigation. |

## Confusion / Friction

- None observed in this pass. The home copy now reads as mechanism-first, and the stated mechanism matches what the feature pages demonstrate.
- The feature-showcase heading is now "Every module has a live example," which is terser than the prior "Every major module gets an example page."

## Load-Bearing Assertions

The browser spec now asserts on three mechanism claims that will fail if the site drifts back to catalog framing:

- `/route the learner/i` — the hero verb triplet
- `/six phases/i` — the engine claim
- `/three independent passes/i` — the scheduler claim

## Evidence

- Screenshots to capture locally in `/tmp/review-game-core-site-wf/`:
  - `01-home.png` — hero + six-phase spotlight + module grid
  - `02-workflow-core-doc.png` — quiz engine section above session/debug
  - `03-wf-harness-feature.png` — validator output in the example panel
  - `04-planning-feature.png` — extended source snippet showing `evaluateGoalPlan`
  - `05-quick-start-doc.png` — updated `CourseQuestionType` with clarifying comment
