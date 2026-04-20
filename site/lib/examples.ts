import {
  applyConceptOutcome,
  applyGuidedConceptOutcome,
  applyWorkflowInterventionMetadata,
  aggregateReadiness,
  buildGoalPhaseStates,
  buildInitialConceptSchedule,
  buildInitialGuidedConceptProgress,
  buildSessionStorageKey,
  buildWorkflowDebugRoute,
  buildWorkflowInterventionExposureRecord,
  buildWorkflowInterventionResolutionKey,
  compareSessionSnapshotContentIdentity,
  computeReadiness,
  createSchedulerPolicy,
  createSessionIdentity,
  createSessionSnapshot,
  evaluateGoalPlan,
  getConceptRepetitionPlan,
  pickNextConceptId,
  pickNextGuidedConceptId,
  resolveRandomizedWorkflowInterventionArm,
  setSessionSnapshotContentIdentity,
  type ConceptNode,
  type GoalPhaseSnapshot,
  type GoalPlan,
  type Question,
} from '@brandon-gottshall/review-game-core'
import {
  validateConceptConsistency,
  type WFHarnessConfig,
} from '@brandon-gottshall/review-game-core/wf-harness/validators'

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
  'wf-harness': (() => {
    const questionPool: readonly Question<'multiple_choice'>[] = [
      {
        id: 'q1',
        type: 'multiple_choice',
        concept: 'factoring',
        question: 'Factor x^2 - 1.',
        correctAnswer: '(x-1)(x+1)',
      },
      {
        id: 'q1',
        type: 'multiple_choice',
        concept: 'orphan',
        question: 'Duplicate id with unknown concept.',
        correctAnswer: 'x',
      },
    ]
    const conceptTree: readonly ConceptNode[] = [
      {
        id: 'factoring',
        name: 'Factoring',
        description: 'Factor quadratics of the form x^2 + bx + c.',
        prerequisites: [],
        questionIds: ['q1'],
      },
    ]
    const config: WFHarnessConfig<'multiple_choice'> = {
      registeredTypes: ['multiple_choice'],
      renderInteractiveCases: [],
      interactivePayloadMap: {},
      questionPool,
      conceptTree,
      generators: [],
    }
    return {
      label: 'WF harness validation',
      description: 'The harness flags duplicate IDs and concepts missing from the tree before browser regression runs.',
      input: { questionPool, conceptTree },
      output: validateConceptConsistency(config),
    } satisfies ExamplePanelData
  })(),
  'guided-repetition': (() => {
    const policy = createSchedulerPolicy({
      masteryTarget: 4,
      subskillIds: ['recognition', 'setup'],
    })
    const initial = buildInitialGuidedConceptProgress(['factoring'], policy)
    const afterLightSweep = [1, 2, 3, 4].reduce(
      (acc, turn) => applyGuidedConceptOutcome(acc, 'factoring', 'independent_correct', turn, { policy }),
      initial,
    )
    const afterHardStumble = applyGuidedConceptOutcome(
      afterLightSweep,
      'factoring',
      'assisted',
      5,
      { policy },
    )
    return {
      label: 'Rep-phase ladder',
      description: 'Four clean lights clear the light phase; an assisted hard attempt opens recovery-lights with a same-concept detour.',
      input: {
        before: initial.factoring,
        actions: [
          { turn: 1, outcome: 'independent_correct' },
          { turn: 2, outcome: 'independent_correct' },
          { turn: 3, outcome: 'independent_correct' },
          { turn: 4, outcome: 'independent_correct' },
          { turn: 5, outcome: 'assisted' },
        ],
      },
      output: {
        afterLightSweep: {
          state: afterLightSweep.factoring,
          plan: getConceptRepetitionPlan(afterLightSweep.factoring),
        },
        afterHardStumble: {
          state: afterHardStumble.factoring,
          plan: getConceptRepetitionPlan(afterHardStumble.factoring),
          nextConceptAtTurn6: pickNextGuidedConceptId(afterHardStumble, 6, { policy }),
        },
      },
    } satisfies ExamplePanelData
  })(),
  'readiness-truthfulness': (() => {
    const recognition = computeReadiness(
      {
        unitId: 'factoring:recognition',
        phase: 'practicing',
        attempts: [
          { correct: true, occurredAt: '2026-04-15T12:00:00Z' },
          { correct: true, occurredAt: '2026-04-16T12:00:00Z' },
          { correct: false, occurredAt: '2026-04-17T12:00:00Z' },
        ],
        lastPracticedAt: '2026-04-17T12:00:00Z',
        dueAt: '2026-04-19T12:00:00Z',
      },
      new Date('2026-04-18T09:00:00Z'),
    )
    const setup = computeReadiness(
      {
        unitId: 'factoring:setup',
        phase: 'mastered',
        attempts: [
          { correct: true, occurredAt: '2026-04-12T12:00:00Z' },
          { correct: true, occurredAt: '2026-04-14T12:00:00Z' },
        ],
        lastPracticedAt: '2026-04-14T12:00:00Z',
        dueAt: '2026-04-22T12:00:00Z',
      },
      new Date('2026-04-18T09:00:00Z'),
    )
    return {
      label: 'Readiness rollup',
      description: 'Each unit gets a coarse 0–100 score plus phase; aggregateReadiness rolls children up without pretending to be an assessment instrument.',
      input: { children: [recognition, setup] },
      output: {
        recognition,
        setup,
        aggregate: aggregateReadiness([recognition, setup]),
      },
    } satisfies ExamplePanelData
  })(),
  'content-identity-restore': (() => {
    const identity = createSessionIdentity('demo-restore', { learnerId: 'learner@example.edu' })
    const stored = setSessionSnapshotContentIdentity(
      createSessionSnapshot(identity, { stage: 'recognize' }, { currentQuestionId: 'q-1' }),
      { questionId: 'q-1', contentId: 'factoring.q-1', contentVersion: 3 },
    )
    const matchesCurrent = compareSessionSnapshotContentIdentity(stored, {
      questionId: 'q-1',
      contentId: 'factoring.q-1',
      contentVersion: 3,
    })
    const driftedCurrent = compareSessionSnapshotContentIdentity(stored, {
      questionId: 'q-1',
      contentId: 'factoring.q-1',
      contentVersion: 4,
    })
    return {
      label: 'Persisted vs current content identity',
      description: 'The session stamps a content identity on persist; on restore the consumer can ask the core whether authored content drifted.',
      input: {
        persisted: stored.metadata.contentIdentity,
        currentVariants: {
          matches: { questionId: 'q-1', contentId: 'factoring.q-1', contentVersion: 3 },
          drifted: { questionId: 'q-1', contentId: 'factoring.q-1', contentVersion: 4 },
        },
      },
      output: {
        matchesCurrent,
        driftedCurrent,
      },
    } satisfies ExamplePanelData
  })(),
  'workflow-interventions': (() => {
    const resolutionKey = buildWorkflowInterventionResolutionKey({
      sessionId: 'sess-42',
      currentTurn: 7,
      sourceQuestionId: 'factoring-q1',
      conceptId: 'factoring',
      targetLayer: 'support',
    })
    const arm = resolveRandomizedWorkflowInterventionArm('llm-support-v1', resolutionKey)
    const exposure = buildWorkflowInterventionExposureRecord(
      {
        learnerId: 'learner@example.edu',
        sessionId: 'sess-42',
        experimentKey: 'llm-support-v1',
        cohortMode: 'randomized',
        resolutionKey,
        conceptId: 'factoring',
        sourceQuestionId: 'factoring-q1',
        servedQuestionIdByArm: {
          control: 'factoring-q1',
          treatment: 'factoring-q1:llm-a',
        },
        unitId: 'unit-3',
        sectionId: 'section-3a',
        targetLayer: 'support',
        interventionKind: 'llm-support',
      },
      {
        exposureId: 'exp-0001',
        createdAt: '2026-04-18T12:30:00Z',
      },
    )
    const stamped = applyWorkflowInterventionMetadata(
      { id: exposure.servedQuestionId, sourceQuestionId: 'factoring-q1' },
      {
        experimentKey: exposure.experimentKey,
        experimentArm: exposure.resolvedArm,
        exposureId: exposure.exposureId,
        sourceQuestionId: exposure.sourceQuestionId,
        questionOrigin: 'llm-generated',
        interventionKind: exposure.interventionKind,
      },
    )
    return {
      label: 'Gated experiment exposure',
      description: 'Same turn + same source question produce the same resolution key and arm; served questions carry experiment metadata that WF can gate on.',
      input: {
        resolution: {
          sessionId: 'sess-42',
          currentTurn: 7,
          sourceQuestionId: 'factoring-q1',
          conceptId: 'factoring',
          targetLayer: 'support',
        },
        experimentKey: 'llm-support-v1',
      },
      output: {
        resolutionKey,
        arm,
        exposure,
        servedQuestion: stamped,
      },
    } satisfies ExamplePanelData
  })(),
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
