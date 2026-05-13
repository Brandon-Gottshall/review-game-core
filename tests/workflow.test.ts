import { describe, expect, it } from 'vitest';

import {
  buildPersistenceKey,
  createMemoryPersistenceAdapter,
  createPersistenceRecord,
  hydratePersistedValue,
  isPersistenceRecord,
} from '../src/workflow/persistence.js';
import {
  buildSessionStorageKey,
  clearSessionSnapshotContentIdentity,
  compareSessionSnapshotContentIdentity,
  createSessionIdentity,
  createSessionSnapshot,
  readSessionSnapshotContentIdentity,
  normalizeSessionSnapshot,
  resetSessionSnapshot,
  setSessionSnapshotContentIdentity,
  isSessionSnapshot,
} from '../src/workflow/session.js';
import {
  advanceQuizStage,
  completeQuizQuestion,
  createQuizEngineState,
  createQuizEngineSnapshot,
  enterRecoveryState,
  enterSupportState,
  reduceQuizEngine,
  restoreQuizEngineState,
  routeQuizEngine,
  resetQuizEngine,
  selectQuizQuestion,
  syncQuizEngineQuestionState,
} from '../src/workflow/quiz-engine.js';
import {
  buildWorkflowDebugQuery,
  buildWorkflowDebugRoute,
  isWorkflowDebugEnabled,
  normalizeWorkflowDebugState,
  parseWorkflowDebugParams,
} from '../src/workflow/debug.js';
import {
  getMissingRendererTypes,
  listRegisteredRendererTypes,
  registerQuestionRenderer,
  resolveQuestionRenderer,
  type QuestionRendererRegistry,
} from '../src/workflow/rendering.js';

describe('workflow/session', () => {
  it('builds, normalizes, and resets snapshots with stable storage keys', () => {
    const identity = createSessionIdentity('session-1', {
      learnerId: 'learner-1',
      anonymousId: 'anon-1',
    });

    const snapshot = createSessionSnapshot(
      identity,
      { progress: 2 },
      {
        route: '/quiz',
        currentConceptId: 'loops',
        currentQuestionId: 'q-1',
        metadata: { source: 'browser' },
        now: '2026-04-12T12:00:00.000Z',
      }
    );

    expect(isSessionSnapshot(snapshot)).toBe(true);
    expect(
      buildSessionStorageKey(
        {
          namespace: 'wf',
          prefix: 'review-game',
          includeLearnerId: true,
          includeAnonymousId: true,
        },
        identity
      )
    ).toBe('review-game:wf:session-1:learner-1:anon-1');

    const normalized = normalizeSessionSnapshot(
      { ...snapshot, route: null } as unknown,
      identity,
      { route: '/restore', now: '2026-04-12T12:01:00.000Z' }
    );

    expect(normalized.route).toBe('/restore');
    expect(normalized.currentQuestionId).toBe('q-1');
    expect(normalized.metadata).toEqual({ source: 'browser' });

    const reset = resetSessionSnapshot(snapshot, {
      route: null,
      currentConceptId: null,
      currentQuestionId: null,
      complete: false,
      state: { progress: 0 },
      now: '2026-04-12T12:02:00.000Z',
    });

    expect(reset.route).toBeNull();
    expect(reset.currentQuestionId).toBeNull();
    expect(reset.state).toEqual({ progress: 0 });
    expect(reset.updatedAt).toBe('2026-04-12T12:02:00.000Z');
  });

  it('normalizes unknown restore input into a valid snapshot envelope', () => {
    const identity = createSessionIdentity('session-2', {
      learnerId: 'Student@Example.com',
    });

    const restored = normalizeSessionSnapshot(
      { state: { progress: 7 } },
      identity,
      {
        route: '/quiz?wf=1',
        currentConceptId: 'functions',
        currentQuestionId: 'q-restore',
        metadata: { source: 'restore' },
        now: '2026-04-12T13:00:00.000Z',
      }
    );

    expect(restored.sessionId).toBe('session-2');
    expect(restored.learnerId).toBe('Student@Example.com');
    expect(restored.route).toBe('/quiz?wf=1');
    expect(restored.currentConceptId).toBe('functions');
    expect(restored.currentQuestionId).toBe('q-restore');
    expect(restored.metadata).toEqual({ source: 'restore' });
    expect(restored.state).toEqual({ progress: 7 });
    expect(isSessionSnapshot(restored)).toBe(true);
  });

  it('stores and clears canonical content identity markers inside snapshot metadata', () => {
    const identity = createSessionIdentity('session-3');
    const snapshot = createSessionSnapshot(
      identity,
      { progress: 1 },
      {
        currentQuestionId: 'q-identity',
        metadata: { source: 'browser' },
      }
    );

    const stamped = setSessionSnapshotContentIdentity(snapshot, {
      contentId: 'trace-variables:q-identity',
      contentVersion: '2026-04-19-a',
    });

    expect(readSessionSnapshotContentIdentity(stamped)).toEqual({
      questionId: 'q-identity',
      contentId: 'trace-variables:q-identity',
      contentVersion: '2026-04-19-a',
    });
    expect(stamped.metadata).toEqual({
      source: 'browser',
      contentIdentity: {
        questionId: 'q-identity',
        contentId: 'trace-variables:q-identity',
        contentVersion: '2026-04-19-a',
      },
    });
    expect(isSessionSnapshot(stamped)).toBe(true);

    const cleared = clearSessionSnapshotContentIdentity(stamped);

    expect(readSessionSnapshotContentIdentity(cleared)).toEqual({
      questionId: 'q-identity',
      contentId: null,
      contentVersion: null,
    });
    expect(cleared.metadata).toEqual({ source: 'browser' });
    expect(isSessionSnapshot(cleared)).toBe(true);
  });

  it('reports explicit content drift separately from legacy unknown fields', () => {
    const identity = createSessionIdentity('session-4');
    const stamped = setSessionSnapshotContentIdentity(
      createSessionSnapshot(identity, { progress: 2 }, { currentQuestionId: 'q-restore' }),
      {
        contentId: 'multiple-choice:q-restore',
        contentVersion: 'v1',
      }
    );

    const drifted = compareSessionSnapshotContentIdentity(stamped, {
      questionId: 'q-restore',
      contentId: 'multiple-choice:q-restore',
      contentVersion: 'v2',
    });

    expect(drifted.matches).toBe(false);
    expect(drifted.mismatchFields).toEqual(['contentVersion']);
    expect(drifted.unknownFields).toEqual([]);

    const legacy = createSessionSnapshot(
      identity,
      { progress: 3 },
      { currentQuestionId: 'q-legacy' }
    );
    const unverifiable = compareSessionSnapshotContentIdentity(legacy, {
      questionId: 'q-legacy',
      contentId: 'free-response:q-legacy',
      contentVersion: 'hash-2',
    });

    expect(unverifiable.matches).toBe(true);
    expect(unverifiable.mismatchFields).toEqual([]);
    expect(unverifiable.unknownFields).toEqual(['contentId', 'contentVersion']);
  });
});

describe('workflow/persistence', () => {
  it('builds keys and supports a memory adapter round-trip', async () => {
    expect(buildPersistenceKey({ namespace: 'review-game', sessionId: 'session-1', suffix: 'snapshot' })).toBe(
      'review-game:session-1:snapshot'
    );

    const adapter = createMemoryPersistenceAdapter<{ step: number }>({
      existing: { step: 1 },
    });

    expect(adapter.read('existing')).toEqual({ step: 1 });
    adapter.write(createPersistenceRecord('next', { step: 2 }, { savedAt: '2026-04-12T12:00:00.000Z' }));
    expect(adapter.dump()).toEqual({
      existing: { step: 1 },
      next: { step: 2 },
    });

    adapter.remove('existing');
    expect(adapter.read('existing')).toBeNull();
    expect(isPersistenceRecord(createPersistenceRecord('key', { step: 3 }))).toBe(true);
    await expect(hydratePersistedValue({ step: 4 }, async value => ({ ...value, step: value.step + 1 }))).resolves.toEqual({
      step: 5,
    });
  });
});

describe('workflow/debug', () => {
  it('parses workflow flags and builds deterministic debug routes', () => {
    const params = parseWorkflowDebugParams('?wf=1&seed=42&concept=loops&question=q-1&restore=true&support=no');
    const state = normalizeWorkflowDebugState(params);

    expect(isWorkflowDebugEnabled(params)).toBe(true);
    expect(state.seed).toBe(42);
    expect(state.concept).toBe('loops');
    expect(state.restore).toBe(true);
    expect(state.support).toBe(false);
    expect(buildWorkflowDebugQuery(params)).toContain('wf=1');
    expect(buildWorkflowDebugRoute('/quiz', params)).toBe(
      '/quiz?wf=1&seed=42&concept=loops&question=q-1&restore=true&support=no'
    );
  });
});

describe('workflow/quiz-engine', () => {
  it('serializes and restores quiz-engine authority without a currentQuestion payload', () => {
    const question = {
      id: 'q-snapshot',
      concept: 'functions',
      type: 'free_response',
      stageCount: 4,
    };
    const selected = selectQuizQuestion(createQuizEngineState(), question, { defaultStageCount: 4 });
    const staged = syncQuizEngineQuestionState(selected, {
      route: '/quiz?exam=n1&section=P.1',
      question,
      stageIndex: 2,
      stageCount: 4,
      stagedAnswers: ['recognize', 'structure'],
      supportActive: true,
      outcome: 'supported',
    });

    const snapshot = createQuizEngineSnapshot(staged);
    const restored = restoreQuizEngineState(snapshot, {
      question,
      route: '/quiz?exam=n1&section=P.1&learnerId=student%40example.com',
    });

    expect(snapshot).toEqual({
      phase: 'support',
      route: '/quiz?exam=n1&section=P.1',
      currentConcept: 'functions',
      currentQuestionId: 'q-snapshot',
      stageIndex: 2,
      stageCount: 4,
      stagedAnswers: ['recognize', 'structure'],
      supportCount: 0,
      recoveryCount: 0,
      completedQuestionIds: [],
      lastOutcome: 'supported',
      complete: false,
    });
    expect(restored.phase).toBe('support');
    expect(restored.route).toBe('/quiz?exam=n1&section=P.1&learnerId=student%40example.com');
    expect(restored.currentQuestion).toEqual(question);
    expect(restored.stageIndex).toBe(2);
    expect(restored.stageCount).toBe(4);
    expect(restored.stagedAnswers).toEqual(['recognize', 'structure']);
    expect(restored.lastOutcome).toBe('supported');
  });

  it('restores legacy partial workflow records by falling back to a valid engine state', () => {
    const question = {
      id: 'q-legacy-workflow',
      concept: 'linear-equations',
      type: 'multiple_choice',
      stageCount: 3,
    };
    const fallback = syncQuizEngineQuestionState(createQuizEngineState<typeof question>(), {
      route: '/quiz?exam=n2&section=1.2',
      question,
      stageIndex: 1,
      stageCount: 3,
      stagedAnswers: ['setup'],
      outcome: 'answered',
    });

    const restored = restoreQuizEngineState(
      {
        phase: 'recovery',
        stageIndex: 99,
        stageCount: 0,
        stagedAnswers: ['setup', 3, null] as unknown as string[],
        lastOutcome: 'unknown' as never,
        complete: false,
      },
      {
        question,
        fallback,
      }
    );

    expect(restored.phase).toBe('recovery');
    expect(restored.currentQuestionId).toBe('q-legacy-workflow');
    expect(restored.currentConcept).toBe('linear-equations');
    expect(restored.stageCount).toBe(3);
    expect(restored.stageIndex).toBe(2);
    expect(restored.stagedAnswers).toEqual(['setup']);
    expect(restored.lastOutcome).toBe('answered');
  });

  it('routes, stages, supports, recovers, and completes deterministically', () => {
    const question = {
      id: 'q-1',
      concept: 'loops',
      type: 'trace_variables',
      stageCount: 3,
    };

    const routed = routeQuizEngine(
      createQuizEngineState(),
      '/quiz?question=q-1',
      {
        questions: [question],
        routeQuestionId: route => (route.includes('question=q-1') ? 'q-1' : null),
      }
    );

    expect(routed.currentQuestionId).toBe('q-1');
    expect(routed.currentConcept).toBe('loops');

    const selected = selectQuizQuestion(routed, question, { defaultStageCount: 3 });
    const staged = advanceQuizStage(selected, 'answer-1', { completeWhenLastStage: true });
    const supported = enterSupportState(staged);
    const recovered = enterRecoveryState(supported);
    const completed = completeQuizQuestion(recovered, question.id);
    const reset = resetQuizEngine(completed);

    expect(staged.phase).toBe('staged-answer');
    expect(staged.stageIndex).toBe(1);
    expect(supported.supportCount).toBe(1);
    expect(recovered.recoveryCount).toBe(1);
    expect(completed.complete).toBe(true);
    expect(completed.completedQuestionIds).toEqual(['q-1']);
    expect(reset.phase).toBe('routing');
    expect(reset.complete).toBe(false);
  });

  it('syncs restored question state and reducer actions without losing counters', () => {
    const question = {
      id: 'q-2',
      concept: 'conditions',
      type: 'multiple_choice',
      stageCount: 2,
    };

    const selected = reduceQuizEngine(
      createQuizEngineState(),
      {
        type: 'select-question',
        question,
      },
      {
        questions: [question],
        defaultStageCount: 2,
      }
    );

    const staged = reduceQuizEngine(selected, {
      type: 'sync-question-state',
      question,
      stageIndex: 1,
      stageAnswers: ['A'],
      outcome: 'answered',
    });
    const supported = reduceQuizEngine(staged, { type: 'support' });
    const restored = syncQuizEngineQuestionState(supported, {
      question,
      stageIndex: 1,
      stagedAnswers: ['A'],
      supportActive: true,
      outcome: 'supported',
    });
    const recovered = reduceQuizEngine(restored, { type: 'recovery' });
    const completed = reduceQuizEngine(recovered, {
      type: 'sync-question-state',
      question,
      stageIndex: 1,
      stageAnswers: ['A', 'B'],
      complete: true,
      outcome: 'completed',
    });

    expect(selected.phase).toBe('question');
    expect(staged.phase).toBe('staged-answer');
    expect(staged.stageIndex).toBe(1);
    expect(supported.supportCount).toBe(1);
    expect(restored.phase).toBe('support');
    expect(recovered.recoveryCount).toBe(1);
    expect(completed.phase).toBe('complete');
    expect(completed.completedQuestionIds).toEqual(['q-2']);
  });

  it('deduplicates completed question ids during sync and preserves routing state', () => {
    const question = {
      id: 'q-3',
      concept: 'functions',
      type: 'free_response',
      stageCount: 1,
    };

    const initial = createQuizEngineState({
      route: '/quiz?question=q-3',
      currentQuestion: question,
      currentQuestionId: question.id,
      currentConcept: question.concept,
      completedQuestionIds: ['q-3'],
      lastOutcome: 'answered',
    });

    const synced = syncQuizEngineQuestionState(initial, {
      route: '/quiz?wf=1&question=q-3',
      question,
      stageIndex: 0,
      stagedAnswers: ['final'],
      complete: true,
      completedQuestionId: 'q-3',
      outcome: 'completed',
    });

    expect(synced.phase).toBe('complete');
    expect(synced.route).toBe('/quiz?wf=1&question=q-3');
    expect(synced.completedQuestionIds).toEqual(['q-3']);
    expect(synced.complete).toBe(true);
    expect(synced.lastOutcome).toBe('completed');
  });
});

describe('workflow/rendering', () => {
  it('resolves renderer registries and reports missing types', () => {
    const registry = registerQuestionRenderer<
      'trace_variables' | 'predict_output',
      string
    >(
      {} as QuestionRendererRegistry<'trace_variables' | 'predict_output', string>,
      {
        type: 'trace_variables',
        renderer: 'TraceRenderer',
      }
    );

    expect(resolveQuestionRenderer(registry, 'trace_variables')).toBe('TraceRenderer');
    expect(
      getMissingRendererTypes(['trace_variables', 'predict_output'] as const, registry)
    ).toEqual([
      'predict_output',
    ]);
    expect(listRegisteredRendererTypes(registry)).toEqual(['trace_variables']);
  });
});
