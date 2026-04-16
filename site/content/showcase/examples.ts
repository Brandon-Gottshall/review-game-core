import type { ShowcaseExample } from '@/lib/types'

export const showcaseExamples: ShowcaseExample[] = [
  {
    slug: 'stats-goal-coach',
    title: 'Exam-track goal coach in stats',
    summary: 'The stats launcher turns concept progress into a clear next-track recommendation without embedding learner planning into the core itself.',
    consumer: 'stats-exam-prep-game',
    modulesUsed: ['goal', 'scheduler', 'workflow'],
    outcome: 'The launcher can pivot from Exam 3 to the final sweep while keeping grade math and learner bootstrap logic app-owned.',
    sourceLinks: [
      {
        label: 'stats-exam-prep-game/lib/study-goal.ts',
        consumerSnippetId: 'stats-study-goal-plan',
      },
      {
        label: 'stats-exam-prep-game/app/page.tsx',
        consumerSnippetId: 'stats-launcher-home',
      },
    ],
  },
  {
    slug: 'math1111-unit-dashboard',
    title: 'Section-native study brief in Math 1111',
    summary: 'Math1111 converts section completion and deadline windows into a unit recommendation while keeping course policy, sources, and learner identity out of the core.',
    consumer: 'math-1111-review-game',
    modulesUsed: ['goal', 'workflow', 'graph contracts'],
    outcome: 'A learner lands on the right unit, sees whether it is current or catch-up, and can launch guided or cram paths from the app shell.',
    sourceLinks: [
      {
        label: 'math-1111-review-game/lib/study-goal.ts',
        consumerSnippetId: 'math1111-study-goal-dashboard',
      },
      {
        label: 'math-1111-review-game/app/page.tsx',
        consumerSnippetId: 'math1111-home-launcher',
      },
    ],
  },
  {
    slug: 'wf-contract-layer',
    title: 'WF contract validation in the core',
    summary: 'The shared WF harness keeps type coverage, payload shape, concept consistency, and scheduler expectations testable before browser-level regression or low-context WF passes.',
    consumer: 'core',
    modulesUsed: ['wf-harness', 'scheduler', 'question', 'generator'],
    outcome: 'Consumer repos can prove static well-formedness quickly, then spend browser time on true workflow discovery rather than contract drift.',
    sourceLinks: [
      {
        label: 'review-game-core/src/wf-harness/validators.ts',
        path: 'src/wf-harness/validators.ts',
      },
    ],
  },
]
