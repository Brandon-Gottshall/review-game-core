import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FAILURE_GAP,
  DEFAULT_INDEPENDENT_GAPS,
  DEFAULT_MASTERY_TARGET,
  DEFAULT_SUPPORTED_GAP,
  applyConceptOutcome,
  applySupplementalConceptExposure,
  buildInitialConceptSchedule,
  createSchedulerPolicy,
  isConceptMastered,
  isRetentionDue,
  mergeConceptSchedule,
  pickNextConceptId,
  type ConceptScheduleMap,
  type ConceptScheduleState,
} from '../src/scheduler/index.js';
import {
  DEFAULT_MASTERY_TARGET as ROOT_DEFAULT_MASTERY_TARGET,
  applyConceptOutcome as applyConceptOutcomeFromRoot,
  buildInitialConceptSchedule as buildInitialConceptScheduleFromRoot,
  createSchedulerPolicy as createSchedulerPolicyFromRoot,
  pickNextConceptId as pickNextConceptIdFromRoot,
} from '../src/index.js';

const policy = createSchedulerPolicy({
  subskillIds: ['recognition', 'structure'] as const,
});

type ReviewSubskill = 'recognition' | 'structure';
type ReviewScheduleState = ConceptScheduleState<ReviewSubskill>;

const makeSchedule = (
  conceptId = 'alpha',
  overrides: Partial<ReviewScheduleState> = {}
): ReviewScheduleState => ({
  ...buildInitialConceptSchedule([conceptId], policy)[conceptId]!,
  ...overrides,
  conceptId: overrides.conceptId ?? conceptId,
});

describe('createSchedulerPolicy', () => {
  it('returns the default policy when no config is provided', () => {
    const resolved = createSchedulerPolicy();

    expect(resolved.masteryTarget).toBe(DEFAULT_MASTERY_TARGET);
    expect(resolved.independentGaps).toEqual(DEFAULT_INDEPENDENT_GAPS);
    expect(resolved.supportedGap).toBe(DEFAULT_SUPPORTED_GAP);
    expect(resolved.failureGap).toBe(DEFAULT_FAILURE_GAP);
    expect(resolved.subskillIds).toEqual([]);
  });

  it('throws for invalid policy config', () => {
    expect(() => createSchedulerPolicy({ masteryTarget: 0 })).toThrow();
    expect(() => createSchedulerPolicy({ independentGaps: [] })).toThrow();
    expect(() => createSchedulerPolicy({ failureGap: -1 })).toThrow();
  });
});

describe('buildInitialConceptSchedule', () => {
  it('seeds configured subskills and preserves concept order for tie-breaking', () => {
    const schedule = buildInitialConceptSchedule(['beta', 'alpha'], policy);
    const beta = schedule.beta!;

    expect(beta.nextEligibleTurn).toBe(1);
    expect(beta.subskillStats.recognition.attempts).toBe(0);
    expect(beta.subskillStats.structure.misses).toBe(0);
    expect(pickNextConceptId(schedule, 1, { policy })).toBe('beta');
  });
});

describe('mergeConceptSchedule', () => {
  it('sanitizes malformed data, drops orphan concepts, and backfills retention state', () => {
    const merged = mergeConceptSchedule(['alpha'], {
      alpha: {
        independentPassCount: 4,
        supportedPassCount: 'bad',
        nextEligibleTurn: 12,
        lastSeenTurn: 7,
        attempts: 5,
        supplementalExposureCount: 2,
        assistedCount: -1,
        skippedCount: 1,
        recentStruggleCount: 3,
        recoveryDue: true,
        lastOutcome: 'independent_correct',
        subskillStats: {
          recognition: {
            attempts: 3,
            cleanPasses: 2,
            supportedPasses: 0,
            misses: 1,
            lastMissedTurn: 6,
          },
          custom: {
            attempts: 1,
            cleanPasses: 0,
            supportedPasses: 1,
            misses: 0,
            lastMissedTurn: null,
          },
        },
      },
      ghost: {
        independentPassCount: 99,
      },
    }, policy);
    const alpha = merged.alpha!;
    const custom = alpha.subskillStats.custom!;

    expect(alpha.mastered).toBe(true);
    expect(alpha.retentionCheckEligibleTurn).toBe(12);
    expect(alpha.retentionCheckPassed).toBe(false);
    expect(alpha.supportedPassCount).toBe(0);
    expect(alpha.assistedCount).toBe(0);
    expect(alpha.subskillStats.recognition.cleanPasses).toBe(2);
    expect(alpha.subskillStats.structure.attempts).toBe(0);
    expect(custom.supportedPasses).toBe(1);
    expect('ghost' in merged).toBe(false);
  });
});

describe('applyConceptOutcome', () => {
  it('spaces independent passes across first, second, and later successes', () => {
    const base = buildInitialConceptSchedule(['alpha'], policy);
    const first = applyConceptOutcome(base, 'alpha', 'independent_correct', 1, { policy });
    const second = applyConceptOutcome(first, 'alpha', 'independent_correct', 4, { policy });
    const third = applyConceptOutcome(second, 'alpha', 'independent_correct', 10, { policy });
    const fourth = applyConceptOutcome(third, 'alpha', 'independent_correct', 19, { policy });
    const firstAlpha = first.alpha!;
    const secondAlpha = second.alpha!;
    const thirdAlpha = third.alpha!;
    const fourthAlpha = fourth.alpha!;

    expect(firstAlpha.independentPassCount).toBe(1);
    expect(firstAlpha.nextEligibleTurn).toBe(4);
    expect(secondAlpha.independentPassCount).toBe(2);
    expect(secondAlpha.nextEligibleTurn).toBe(10);
    expect(thirdAlpha.independentPassCount).toBe(3);
    expect(thirdAlpha.mastered).toBe(true);
    expect(thirdAlpha.nextEligibleTurn).toBe(19);
    expect(fourthAlpha.independentPassCount).toBe(4);
    expect(fourthAlpha.nextEligibleTurn).toBe(28);
  });

  it('marks retention due at mastery and passes it on a later independent solve', () => {
    const base = buildInitialConceptSchedule(['alpha'], policy);
    const first = applyConceptOutcome(base, 'alpha', 'independent_correct', 1, { policy });
    const second = applyConceptOutcome(first, 'alpha', 'independent_correct', 4, { policy });
    const third = applyConceptOutcome(second, 'alpha', 'independent_correct', 10, { policy });
    const retained = applyConceptOutcome(third, 'alpha', 'independent_correct', 19, { policy });
    const thirdAlpha = third.alpha!;
    const retainedAlpha = retained.alpha!;

    expect(isRetentionDue(thirdAlpha, 18, { ...policy })).toBe(false);
    expect(isRetentionDue(thirdAlpha, 19, { ...policy })).toBe(true);
    expect(retainedAlpha.retentionCheckPassed).toBe(true);
  });

  it('keeps independent count unchanged for supported solves while forcing recovery', () => {
    const base = {
      alpha: makeSchedule('alpha', {
        independentPassCount: 2,
        nextEligibleTurn: 12,
      }),
    } satisfies ConceptScheduleMap<ReviewSubskill>;
    const progressed = applyConceptOutcome(base, 'alpha', 'supported_correct', 5, { policy });
    const alpha = progressed.alpha!;

    expect(alpha.independentPassCount).toBe(2);
    expect(alpha.supportedPassCount).toBe(1);
    expect(alpha.recoveryDue).toBe(true);
    expect(alpha.recentStruggleCount).toBe(1);
    expect(alpha.nextEligibleTurn).toBe(7);
  });

  it('keeps independent count unchanged for assisted and skipped outcomes', () => {
    const base = {
      alpha: makeSchedule('alpha', {
        independentPassCount: 1,
        nextEligibleTurn: 15,
      }),
    } satisfies ConceptScheduleMap<ReviewSubskill>;
    const assisted = applyConceptOutcome(base, 'alpha', 'assisted', 6, { policy });
    const skipped = applyConceptOutcome(assisted, 'alpha', 'skipped', 8, { policy });
    const assistedAlpha = assisted.alpha!;
    const skippedAlpha = skipped.alpha!;

    expect(assistedAlpha.independentPassCount).toBe(1);
    expect(assistedAlpha.assistedCount).toBe(1);
    expect(assistedAlpha.nextEligibleTurn).toBe(8);
    expect(skippedAlpha.independentPassCount).toBe(1);
    expect(skippedAlpha.skippedCount).toBe(1);
    expect(skippedAlpha.recoveryDue).toBe(true);
  });

  it('accumulates subskill updates on outcome application', () => {
    const base = buildInitialConceptSchedule(['alpha'], policy);
    const progressed = applyConceptOutcome(base, 'alpha', 'supported_correct', 2, {
      policy,
      subskillUpdates: [
        {
          subskill: 'structure',
          attempts: 2,
          cleanPasses: 0,
          supportedPasses: 1,
          misses: 1,
          lastMissedTurn: 2,
        },
      ],
    });
    const alpha = progressed.alpha!;

    expect(alpha.subskillStats.structure.attempts).toBe(2);
    expect(alpha.subskillStats.structure.supportedPasses).toBe(1);
    expect(alpha.subskillStats.structure.misses).toBe(1);
    expect(alpha.subskillStats.structure.lastMissedTurn).toBe(2);
  });

  it('returns the original map when the concept id is unknown', () => {
    const base = buildInitialConceptSchedule(['alpha'], policy);

    expect(applyConceptOutcome(base, 'missing', 'skipped', 1, { policy })).toBe(base);
  });
});

describe('applySupplementalConceptExposure', () => {
  it('pulls clean supplemental exposure less aggressively than non-clean exposure', () => {
    const base = {
      alpha: makeSchedule('alpha', {
        nextEligibleTurn: 12,
      }),
    } satisfies ConceptScheduleMap<ReviewSubskill>;
    const clean = applySupplementalConceptExposure(base, 'alpha', 5, {
      policy,
      wasClean: true,
    });
    const notClean = applySupplementalConceptExposure(base, 'alpha', 5, {
      policy,
      wasClean: false,
    });
    const cleanAlpha = clean.alpha!;
    const notCleanAlpha = notClean.alpha!;

    expect(cleanAlpha.nextEligibleTurn).toBe(7);
    expect(notCleanAlpha.nextEligibleTurn).toBe(6);
    expect(cleanAlpha.lastOutcome).toBeNull();
    expect(notCleanAlpha.independentPassCount).toBe(0);
  });

  it('accumulates subskill updates without changing the main outcome state', () => {
    const base = buildInitialConceptSchedule(['alpha'], policy);
    const progressed = applySupplementalConceptExposure(base, 'alpha', 4, {
      policy,
      subskillUpdates: [
        {
          subskill: 'recognition',
          attempts: 1,
          cleanPasses: 1,
          supportedPasses: 0,
          misses: 0,
          lastMissedTurn: null,
        },
      ],
    });
    const alpha = progressed.alpha!;

    expect(alpha.supplementalExposureCount).toBe(1);
    expect(alpha.subskillStats.recognition.cleanPasses).toBe(1);
    expect(alpha.lastOutcome).toBeNull();
  });
});

describe('pickNextConceptId', () => {
  it('prioritizes recovery-due concepts before other due concepts', () => {
    const schedule = {
      alpha: makeSchedule('alpha', {
        conceptId: 'alpha',
        recoveryDue: true,
        nextEligibleTurn: 5,
      }),
      beta: makeSchedule('beta', {
        nextEligibleTurn: 5,
      }),
    } satisfies ConceptScheduleMap<ReviewSubskill>;

    expect(pickNextConceptId(schedule, 5, { policy })).toBe('alpha');
  });

  it('limits selection to the due pool when any eligible concepts are due', () => {
    const schedule = {
      alpha: makeSchedule('alpha', {
        nextEligibleTurn: 9,
      }),
      beta: makeSchedule('beta', {
        nextEligibleTurn: 3,
      }),
    } satisfies ConceptScheduleMap<ReviewSubskill>;

    expect(pickNextConceptId(schedule, 3, { policy })).toBe('beta');
  });

  it('honors the eligibility callback and returns an empty string when nothing is eligible', () => {
    const schedule = buildInitialConceptSchedule(['alpha', 'beta'], policy);

    expect(pickNextConceptId(schedule, 1, {
      policy,
      isEligible: (conceptId) => conceptId === 'beta',
    })).toBe('beta');

    expect(pickNextConceptId(schedule, 1, {
      policy,
      isEligible: () => false,
    })).toBe('');
  });
});

describe('isConceptMastered', () => {
  it('uses the policy mastery target instead of the cached boolean alone', () => {
    const customPolicy = createSchedulerPolicy<ReviewSubskill>({
      masteryTarget: 2,
      subskillIds: ['recognition', 'structure'],
    });
    const concept = makeSchedule('alpha', {
      independentPassCount: 2,
      mastered: false,
    });

    expect(isConceptMastered(concept, customPolicy)).toBe(true);
  });
});

describe('root exports', () => {
  it('re-exports the scheduler API from the package root', () => {
    expect(createSchedulerPolicyFromRoot().masteryTarget).toBe(ROOT_DEFAULT_MASTERY_TARGET);
    expect(typeof buildInitialConceptScheduleFromRoot).toBe('function');
    expect(typeof applyConceptOutcomeFromRoot).toBe('function');
    expect(typeof pickNextConceptIdFromRoot).toBe('function');
  });
});
