# 2026-04-19 Core Inclusion Meta-Plan

## Purpose

This plan folds the `20` ranked core-inclusion ideas from [`core-inclusion-ranking.md`](../core-inclusion-ranking.md) into one balanced execution strategy.

It is based on:

- the direct-thread synthesis in [`/Volumes/EmmaSSD/Development/Personal/VSU/review-games/docs/codex-thread-intent-index.md`](/Volumes/EmmaSSD/Development/Personal/VSU/review-games/docs/codex-thread-intent-index.md)
- the normalized ranking in [`../core-inclusion-ranking.md`](../core-inclusion-ranking.md)
- a rolling six-agent per-rank planning pass across all `20` ranks

The key rule for this plan is:

> Plan every ranked idea individually first, then only serialize the pieces that truly depend on one another.

## Planning Principles

1. `Core kernels first`
   The shared runtime and boundary contracts that other ideas depend on should stabilize before downstream docs/UI semantics are finalized.
2. `Docs and runtime are different kinds of work`
   Some items are core runtime/API work. Others are doctrine, site framing, or contributor guidance. They should not be forced into one linear queue.
3. `Boundary items should not block kernels`
   A boundary-only candidate can be planned early, but it should not delay core ownership work unless it reveals a missing seam.
4. `Local-only work should stay visible but off the critical path`
   Consumer-local copy, schedule topology, UX handoff, and release hygiene still matter, but they should not hold up core extraction.
5. `Second-consumer proof matters`
   A few items are not blocked by engineering complexity; they are blocked by not yet proving that a shared abstraction is truly shared.

## Resulting Lanes

| Lane | Goal | Ranks |
| --- | --- | --- |
| `A. Kernel` | Stabilize the core runtime and shared abstractions that other items depend on. | `1, 2, 3, 8, 9` |
| `B. Shared doctrine` | Turn thread-memory rules into canonical core docs/policies. | `4, 5, 6, 7, 10, 11` |
| `C. Boundary hardening` | Define thin shared seams without over-centralizing consumer behavior. | `12, 13, 15, 16` |
| `D. Consumer-local / process` | Keep important non-core work tracked without letting it pollute the core backlog. | `14, 17, 18, 19, 20` |

## Dependency Table

| Rank | Idea | Depends on | Why |
| --- | --- | --- | --- |
| `1` | Guided repetition / concept-first ladder | none | This is a base pedagogy contract. |
| `2` | Planning / goal abstraction separated from pedagogy | none | This is a separate core kernel and should not wait on item `1`. |
| `3` | Quiz workflow controller and session authority | none | The runtime seam already exists; it needs canonicalization and test hardening. |
| `4` | WF as the real product gate | none | It is shared doctrine and can be written immediately. |
| `5` | Per-question WF gate for experimental / LLM variants | `4`, `7`, `8` | It depends on WF doctrine, question-quality doctrine, and restore/invalidation behavior. |
| `6` | Progress/readiness truthfulness contract | `2` | The claims contract needs stable normalized progress semantics. |
| `7` | Question-authoring rubric and scaffold framing | `1` | It should inherit the ladder rather than invent its own. |
| `8` | Persisted-question invalidation when content changes | `3` | This is a restore/session seam. |
| `9` | Graph projection as a rebuildable read model | none | It is an independent kernel with its own boundary. |
| `10` | Core site / family framing | `1`, `2`, `4`, `11` | Final framing should reflect the stabilized family doctrine and mechanism inventory. |
| `11` | Migration vectors and mechanism inventory | `1`, `2`, `3` | The inventory is most useful after the core kernel boundaries are frozen. |
| `12` | Goal-coach / unit-launcher congruency semantics | `2`, `6` | It depends on planning vocabulary and truthful claims. |
| `13` | Reusable learner saved plans | `2` and second-consumer proof | The seam only becomes worth sharing if another consumer needs the same shape. |
| `14` | Cram/compression mode contract | `1`, `7` and second-consumer proof | It should not become shared until the base pedagogy and question-quality contract are stable and reuse is proven. |
| `15` | Section/objective progress rollups | `2`, `6` | The rollups should follow stable planning counts and truthfulness rules. |
| `16` | Source honesty / provenance visibility | `2`, optional `6` | At most a snapshot seam; must stay out of core behavior. |
| `17` | Course schedule / section topology | none in core | Consumer-local only. |
| `18` | External UX handoff / engineering-vs-UX split | none in core | Process guidance only. |
| `19` | Launcher copy and tone guides | none in core | Consumer-local copy work. |
| `20` | Release/deploy hygiene | none in core | Repo/process hygiene. |

## Execution Phases

### Phase 1: Freeze the kernels

This is the true critical path. These are the items that other lanes are likely to reference.

| Parallel lane | Work |
| --- | --- |
| `A1` | `1` Close guided repetition as the stable concept-first ladder contract. |
| `A2` | `2` Promote the planning spec into a stable deterministic kernel API. |
| `A3` | `3` Canonicalize quiz workflow controller + session authority and harden tests. |
| `A4` | `9` Freeze the graph projection/read-model boundary and typed query contracts. |
| `A5` | `4` Draft `wf-contract.md` in parallel with the kernel work. |

Phase 1 exit criteria:

- the ladder, planning, workflow/session, and graph boundaries are explicit
- `wf-contract.md` exists as the canonical shared rule
- no downstream item is blocked on “what does core own here?”

### Phase 2: Layer the shared doctrine on top

This phase turns the thread-level lessons into reusable policy and documentation.

| Parallel lane | Work | Notes |
| --- | --- | --- |
| `B1` | `7` Question-quality / scaffold-framing contract | Starts once `1` is stable. |
| `B2` | `6` Progress/readiness truthfulness contract | Claim inventory can start early; final contract should follow `2`. |
| `B3` | `8` Persisted-question invalidation contract | Starts once `3` is stable. |
| `B4` | `11` Migration vectors + mechanism inventory | Most useful once `1/2/3` are frozen. |
| `B5` | `10` Core site / family framing rewrite | IA/copy audit can start early; final language should trail `1/2/4/11`. |
| `B6` | `5` Per-question WF gate for experimental / LLM variants | Draft can start early; enforcement should trail `4`, `7`, and `8`. |

Phase 2 exit criteria:

- shared doctrine is no longer trapped in old threads
- the site/docs tell the same story as the runtime
- question quality, WF gating, and restore invalidation are aligned

### Phase 3: Harden the shared boundaries

These are useful seams, but they should remain thin and should not back-drive the kernels.

| Parallel lane | Work | Notes |
| --- | --- | --- |
| `C1` | `15` Section/objective rollup helpers | After `2` and `6`. |
| `C2` | `12` Goal-coach / unit-launcher congruency semantics | After `2` and `6`; may consume `15`. |
| `C3` | `16` Provenance/source-honesty boundary | Prefer docs/types only. |
| `C4` | `13` Saved-plan seam evaluation | Only promote if second-consumer reuse is real. |

Phase 3 exit criteria:

- boundary items have clear seams and non-goals
- none of them has quietly expanded into a consumer-owned domain

### Phase 4: Keep the local/process tail out of the core path

These items still need owners, but they should not block shared-core delivery.

| Parallel lane | Work | Notes |
| --- | --- | --- |
| `D1` | `17` Course schedule / section topology | Consumer-local. |
| `D2` | `19` Launcher copy and tone guides | Consumer-local. |
| `D3` | `18` Engineering/UX handoff guide | Contributor/process track. |
| `D4` | `20` Release/deploy hygiene checklist | Repo/process track. |
| `D5` | `14` Cram/compression contract evaluation | Defer until reuse beyond one consumer is proven. |

Phase 4 exit criteria:

- local/process work is assigned, documented, and deliberately non-blocking
- `14` is either explicitly deferred or justified by real second-consumer evidence

## Balanced Meta-Plan

### Immediate start set

Start these together:

- `1` guided repetition closure
- `2` planning kernel promotion
- `3` workflow/session canonicalization
- `4` WF contract doc
- `9` graph projection boundary

This is the maximum healthy parallelization at the start, because these five are high-value and mostly non-overlapping.

### Start early but do not finalize yet

These can begin as audits/inventories while Phase 1 is running:

- `6` claim inventory for readiness/progress truthfulness
- `10` site IA and copy audit
- `11` mechanism inventory taxonomy

They should not be finalized until the kernel boundaries are stable.

### Start immediately after the relevant kernel lands

- `7` immediately after `1`
- `8` immediately after `3`
- `5` after `4 + 7 + 8`
- `15` after `2 + 6`
- `12` after `2 + 6`
- `16` after `2`, optionally checked against `6`

### Explicit defer / “prove reuse first”

Do not let these silently enter the critical path:

- `13` reusable saved plans
- `14` cram/compression mode contract

They are not blocked by engineering; they are blocked by needing proof that the abstraction is truly shared.

## Suggested Ownership Split

| Owner track | Ranks |
| --- | --- |
| `Core runtime` | `1, 2, 3, 8, 9, 15` |
| `Core docs/policy` | `4, 5, 6, 7, 10, 11, 12, 16` |
| `Consumer apps` | `13, 14, 17, 19` |
| `Contributor/process` | `18, 20` |

## Fastest Responsible Order

If the goal is speed without dropping detail, the shortest sensible path is:

1. Ship/freeze `1, 2, 3, 4, 9`.
2. Immediately layer `7, 8, 6, 11`.
3. Once those settle, finalize `5` and `10`.
4. Then harden `15, 12, 16`.
5. Keep `13, 14, 17, 18, 19, 20` on a separate non-blocking track.

That gives you aggressive parallelization up front while keeping the true critical path narrow.

## Practical Consequence

Not all `20` ideas belong in the same delivery queue.

The balanced plan is:

- treat `1, 2, 3, 4, 9` as the shared-core foundation
- treat `5, 6, 7, 10, 11` as the doctrine layer
- treat `12, 13, 15, 16` as thin shared seams
- treat `14, 17, 18, 19, 20` as non-blocking local/process tracks unless reuse evidence changes

That preserves the detail from the per-rank planning pass while still collapsing it into an execution shape that can actually move quickly.
