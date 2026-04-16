import {
  buildGoalPhaseStates,
  buildInitialConceptSchedule,
  buildSessionStorageKey,
  buildWorkflowDebugRoute,
  compareShadowResult,
  createSchedulerPolicy,
  createSessionIdentity,
  createSessionSnapshot,
  evaluateGoalPlan,
  pickNextConceptId,
  applyConceptOutcome,
  type GoalPhaseSnapshot,
  type GoalPlan,
} from '@brandon-gottshall/review-game-core'

import type { ExamplePanelData } from '@/lib/types'

type DemoTrack = 'exam3' | 'final'

const planningPlan: GoalPlan<DemoTrack> = {
  id: 'demo-plan',
  label: 'Exam 3 then Final',
  phases: [
    {
      id: 'exam3-clean-sweep',
      label: 'Perfect Exam 3 first',
      trackId: 'exam3',
      deadlineLocalDate: '2026-04-18',
      deadlineBehavior: 'stay_primary_until_complete',
    },
    {
      id: 'final-breadth-sweep',
      label: 'Then hit the final',
      trackId: 'final',
      deadlineLocalDate: '2026-04-27',
      deadlineBehavior: 'advance_after_deadline',
    },
  ],
}

const planningSnapshots: GoalPhaseSnapshot<DemoTrack>[] = [
  {
    phaseId: 'exam3-clean-sweep',
    trackId: 'exam3',
    completedUnits: 8,
    totalUnits: 12,
  },
  {
    phaseId: 'final-breadth-sweep',
    trackId: 'final',
    completedUnits: 3,
    totalUnits: 14,
  },
]

export const examplePanels: Record<string, ExamplePanelData> = {
  'planning-goals': {
    label: 'Goal evaluation',
    description: 'The core turns count-based progress into recommendation state without knowing whether the units are concepts or sections.',
    input: {
      plan: planningPlan,
      snapshots: planningSnapshots,
      context: { localDate: '2026-04-16' },
    },
    output: evaluateGoalPlan(planningPlan, planningSnapshots, { localDate: '2026-04-16' }),
  },
  scheduler: (() => {
    const policy = createSchedulerPolicy({
      masteryTarget: 3,
      subskillIds: ['recognition', 'setup'],
    })
    const initial = buildInitialConceptSchedule(['factoring', 'graphing'], policy)
    const afterPass = applyConceptOutcome(initial, 'factoring', 'independent_correct', 1, { policy })
    return {
      label: 'Scheduler turn update',
      description: 'The scheduler spaces a concept after a clean pass, then picks the next eligible concept.',
      input: {
        policy,
        before: initial,
        action: {
          conceptId: 'factoring',
          outcome: 'independent_correct',
          currentTurn: 1,
        },
      },
      output: {
        afterPass,
        nextConceptAtTurn2: pickNextConceptId(afterPass, 2, { policy }),
      },
    } satisfies ExamplePanelData
  })(),
  'workflow-core': (() => {
    const identity = createSessionIdentity('demo-session', { learnerId: 'learner@example.edu' })
    const snapshot = createSessionSnapshot(identity, { stage: 'recognize', seen: 1 }, {
      route: '/quiz?exam=exam3',
      currentConceptId: 'factoring',
      currentQuestionId: 'q-1',
    })
    return {
      label: 'Session + debug contract',
      description: 'Workflow helpers keep storage keys and deterministic debug routes stable across consumer apps.',
      input: { identity, namespace: 'stats-exam-prep' },
      output: {
        storageKey: buildSessionStorageKey(
          { namespace: 'stats-exam-prep', includeLearnerId: true },
          identity,
        ),
        snapshot,
        wfRoute: buildWorkflowDebugRoute('/quiz', {
          wf: 1,
          route: 'support',
          concept: 'factoring',
          question: 'q-1',
          learner: 'learner@example.edu',
        }),
      },
    } satisfies ExamplePanelData
  })(),
  'wf-harness': {
    label: 'WF comparison helper',
    description: 'The query layer includes tiny utilities that help consumer repos compare primary and shadow runs deterministically.',
    input: {
      primary: { conceptId: 'factoring', match: true },
      shadow: { conceptId: 'factoring', match: true },
    },
    output: compareShadowResult(
      { conceptId: 'factoring', match: true },
      { conceptId: 'factoring', match: true },
    ),
  },
  'graph-subsystem': {
    label: 'Projection relationship shape',
    description: 'Graph contracts define canonical ladders, objectives, and artifacts without forcing the graph to own app state.',
    input: {
      objective: 'solve-quadratic-by-factoring',
      concept: 'factoring-quadratics',
      ladderSteps: ['recognition', 'setup', 'independent_proof'],
    },
    output: {
      projectionRows: [
        {
          objectiveId: 'solve-quadratic-by-factoring',
          gameConceptId: 'factoring-quadratics',
          ladderId: 'factoring-quadratics-core',
        },
      ],
    },
  },
  'question-generator-primitives': {
    label: 'Minimal content primitives',
    description: 'A consumer repo can keep question, concept, and generator contracts small while still driving prerequisite logic and deterministic variants.',
    input: {
      questionType: 'trace',
      conceptNode: { id: 'loops', requires: ['variables'] },
    },
    output: {
      generatedVariantSeed: 42,
      unlockedAfterPrereqs: ['loops', 'variables'],
    },
  },
}

export const getExamplePanel = (slug: string): ExamplePanelData => {
  const example = examplePanels[slug]
  if (!example) {
    throw new Error(`Missing example panel for feature ${slug}`)
  }
  return example
}
