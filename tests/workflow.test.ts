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
  createSessionIdentity,
  createSessionSnapshot,
  normalizeSessionSnapshot,
  resetSessionSnapshot,
  isSessionSnapshot,
} from '../src/workflow/session.js';
import {
  advanceQuizStage,
  completeQuizQuestion,
  createQuizEngineState,
  enterRecoveryState,
  enterSupportState,
  routeQuizEngine,
  resetQuizEngine,
  selectQuizQuestion,
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
