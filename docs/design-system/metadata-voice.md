# Metadata Voice + `buildGameMetadata()` Helper

Canonical `<title>` and `<meta description>` voice for every review game, plus the shape of the helper that enforces it. The fork agent implements this as deliverable E-19.

**Decision locked:** all four apps unify on the "Concept Mastery" pattern established by MATH 1111. ASTR's "Stellar Study" and CS's "Java Cram" branded titles retire.

---

## 1. Voice

### 1.1 Title pattern

```
{COURSE_CODE} {Subject} — Concept Mastery
```

Examples (resolved per app):

| App | Resolved title |
|---|---|
| math-1111-review-game | `MATH 1111 College Algebra — Concept Mastery` |
| stats-exam-prep-game | `MATH 1401 Statistics — Concept Mastery` |
| astr-unit-1-review-game | `ASTR 1020K Astronomy — Concept Mastery` |
| cs-unit-1-review-game | `CS 1301 Intro Java — Concept Mastery` |

Rules:
- `COURSE_CODE` is the registrar course number (uppercase, with program prefix).
- `Subject` is the course's conversational subject name in title case (not the registrar long form). "College Algebra", "Statistics", "Astronomy", "Intro Java".
- The em-dash (`—`, U+2014) is the only separator. Not a pipe, not a colon, not a hyphen.
- No trailing period.

### 1.2 Description pattern

```
Guided concept mastery for {COURSE_CODE} — learn, prove, and retain every {scope}.
```

Examples:

| App | Resolved description |
|---|---|
| math-1111-review-game | `Guided concept mastery for MATH 1111 — learn, prove, and retain every section.` |
| stats-exam-prep-game | `Guided concept mastery for MATH 1401 — learn, prove, and retain every topic across all four exam tracks.` |
| astr-unit-1-review-game | `Guided concept mastery for ASTR 1020K — learn, prove, and retain every concept in Unit 1.` |
| cs-unit-1-review-game | `Guided concept mastery for CS 1301 — learn, prove, and retain every concept in Unit 1.` |

Rules:
- Starts with `Guided concept mastery for {COURSE_CODE}`.
- Hinge is the em-dash followed by the triad `learn, prove, and retain`. This phrase is load-bearing — do not substitute synonyms.
- Ends with `every {scope}.` Scope is a short noun phrase matching the app's actual coverage: `section`, `topic across all four exam tracks`, `concept in Unit 1`, etc.
- Always ends with a period.
- Keep under ~160 characters where reasonable (SERP truncation target).

### 1.3 Voice principles

- **Learning-first, not exam-first.** "Concept mastery" beats "exam prep game" — see `product-framing.md` for why.
- **Active triad "learn, prove, and retain"** maps to the canonical guided-repetition ladder (Recognize → Structure → Prove → Retain).
- **No brand names.** "Stellar Study", "Java Cram", and future branded nicknames stay out of metadata. If a brand becomes useful, it belongs in marketing surfaces, not the `<title>`.
- **No emojis, no pipes, no mixed-case artifacts** (no "ExAm PrEp", no mid-sentence caps).

---

## 2. API — `buildGameMetadata()`

**Location:** `review-game-core/src/theme/index.ts` (re-exported from package root).

**Shipped signature:**

```ts
import type { Metadata } from 'next'

export type GameFraming = {
  /** Registrar course number, uppercase with program prefix. E.g., "MATH 1111", "ASTR 1020K". */
  course: string
  /** Optional conversational subject name, title case. E.g., "College Algebra", "Intro Java". */
  subject?: string
}

export function buildGameMetadata(framing: GameFraming): Metadata
```

**Shipped implementation (what `theme/index.ts` currently produces):**

```ts
export function buildGameMetadata({ course, subject }: GameFraming): Metadata {
  const courseLabel = [course, subject].filter(Boolean).join(' ')
  return {
    title: `${courseLabel} — Concept Mastery`,
    description: `Guided concept mastery for ${course} — learn, prove, and retain every topic.`,
    icons: { icon: '/icon.svg' },
  }
}
```

**Consumer usage** in each app's `app/layout.tsx` (MATH 1401 is already live on this):

```ts
import { buildGameMetadata } from '@brandon-gottshall/review-game-core'

export const metadata = buildGameMetadata({
  course: 'MATH 1401',
  subject: 'Statistics',
})
```

### 2.1 Scope parameter — resolved

The earlier draft of this spec included a `scope` parameter so each app could tune the description (`every section` / `every topic across all four exam tracks` / `every concept in Unit 1`). The shipped API dropped `scope` and uses a single generic tail (`every topic`). This is **accepted** for now — two reasons:

- **Specificity loss is small.** "every topic" reads sensibly for all four games. A learner lands on the page and sees "learn, prove, and retain every topic" — they will not miss the "across all four exam tracks" specificity most of the time.
- **SERP impact is marginal.** Title drives click-through more than description; title is unchanged.

**Possible future evolution:** add `scope` back as an optional param with `'topic'` as the default. That would let 1401 say "topic across all four exam tracks" without breaking MATH 1111's current output. Zero-regression extension — revisit if description specificity becomes important.

---

## 3. Per-app migration — all four landed

All four apps now call `buildGameMetadata({ course, subject })` from `app/layout.tsx`. Plain string drift is no longer possible.

| App | `layout.tsx` call | Resolved title |
|---|---|---|
| math-1111-review-game | `buildGameMetadata({ course: 'MATH 1111', subject: 'College Algebra' })` | `MATH 1111 College Algebra — Concept Mastery` |
| stats-exam-prep-game | `buildGameMetadata({ course: 'MATH 1401', subject: 'Statistics' })` | `MATH 1401 Statistics — Concept Mastery` |
| astr-unit-1-review-game | `buildGameMetadata({ course: 'ASTR 1020K', subject: 'Astronomy' })` | `ASTR 1020K Astronomy — Concept Mastery` |
| cs-unit-1-review-game | `buildGameMetadata({ course: 'CS 1301', subject: 'Introduction to Java' })` | `CS 1301 Introduction to Java — Concept Mastery` |

Note on CS: `subject: 'Introduction to Java'` landed (vs earlier spec of `'Intro Java'`). Both read cleanly; no correction needed.

---

## 4. What the helper does NOT own

- Icon assets (per-app; helper's `icons` prop is opt-in).
- Open Graph / Twitter card metadata — out of scope for this spec. Add later if needed.
- Viewport / theme-color — stays per-app (1401 sets `themeColor: '#0a0a1a'`; that's an app-level concern).
- `generator` field — if Next still emits one, it remains; the helper does not set it.

---

## 5. Tests

The helper is pure. Vitest snapshot for each app's framing input → confirms the resolved title and description match §1.

```ts
describe('buildGameMetadata', () => {
  it('formats the MATH 1111 framing', () => {
    expect(buildGameMetadata({ course: 'MATH 1111', subject: 'College Algebra' }))
      .toMatchObject({
        title: 'MATH 1111 College Algebra — Concept Mastery',
        description: 'Guided concept mastery for MATH 1111 — learn, prove, and retain every topic.',
        icons: { icon: '/icon.svg' },
      })
  })
  // ... MATH 1401 Statistics, ASTR 1020K Astronomy, CS 1301K Intro Java
})
```

---

## 6. Cross-references

- Voice rationale: `review-game-core/docs/product-framing.md` (§"Naming guidance for consumer apps")
- Helper location: `review-game-core/src/theme/index.ts` — re-exported from package root
- Shipped consumer: [stats-exam-prep-game/app/layout.tsx](../../../../stats-exam-prep-game/app/layout.tsx)
