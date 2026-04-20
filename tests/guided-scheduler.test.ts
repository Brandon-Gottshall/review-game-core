import { describe, expect, it } from 'vitest';
import {
  HARD_ATTEMPT_LIMIT,
  HARD_FAILURE_RECOVERY_LIGHTS,
  HARD_REP_TARGET,
  LIGHT_REP_TARGET,
  applyGuidedConceptOutcome,
  applySupplementalGuidedConceptExposure,
  buildInitialGuidedConceptProgress,
  createSchedulerPolicy,
  getConceptRepetitionPlan,
  getConceptSelectionReason,
  getConceptStateBadge,
  getPreferredSubskillsForConceptSelection,
  getWeakestSubskills,
  isRetentionDue,
  mergeGuidedConceptProgress,
  normalizeSelectionReason,
  pickNextGuidedConceptId,
  type GuidedConceptProgressMap,
  type GuidedConceptProgressState,
} from '../src/scheduler/index.js';
import {
  HARD_ATTEMPT_LIMIT as ROOT_HARD_ATTEMPT_LIMIT,
  getConceptRepetitionPlan as getConceptRepetitionPlanFromRoot,
} from '../src/index.js';

type ReviewSubskill =
  | 'recognition'
  | 'structure'
  | 'sanity'
  | 'syntax'
  | 'computation'
  | 'interpretation';

const policy = createSchedulerPolicy<ReviewSubskill>({
  masteryTarget: 3,
  independentGaps: [2, 5, 8],
  supportedGap: 1,
  failureGap: 1,
  subskillIds: ['recognition', 'structure', 'sanity', 'syntax', 'computation', 'interpretation'],
});

const makeConcept = (
  conceptId = 'alpha',
  overrides: Partial<GuidedConceptProgressState<ReviewSubskill>> = {}
): GuidedConceptProgressState<ReviewSubskill> => ({
  ...buildInitialGuidedConceptProgress<ReviewSubskill>([conceptId], policy)[conceptId]!,
  ...overrides,
  conceptId: overrides.conceptId ?? conceptId,
});

const getConcept = (
  progressMap: GuidedConceptProgressMap<ReviewSubskill>,
  conceptId = 'alpha'
): GuidedConceptProgressState<ReviewSubskill> => {
  const concept = progressMap[conceptId];
  expect(concept).toBeDefined();
  return concept!;
};

describe('buildInitialGuidedConceptProgress', () => {
  it('starts concepts at the first light rep with no guided state recorded', () => {
    const progress = buildInitialGuidedConceptProgress<ReviewSubskill>(['alpha', 'beta'], policy);
    const alpha = getConcept(progress);

    expect(alpha.lightPassCount).toBe(0);
    expect(alpha.hardPassCount).toBe(0);
    expect(alpha.recoveryLightRemaining).toBe(0);
    expect(alpha.recoverySupportMode).toBe('none');
    expect(getConceptRepetitionPlan(alpha)).toEqual({
      repPhase: 'light',
      repIndex: 1,
      supportMode: 'none',
      hardAttemptLimit: null,
    });
  });
});

describe('mergeGuidedConceptProgress', () => {
  it('preserves explicit guided fields when stored', () => {
    const merged = mergeGuidedConceptProgress<ReviewSubskill>(['alpha'], {
      alpha: {
        independentPassCount: 1,
        supportedPassCount: 2,
        lightPassCount: 4,
        hardPassCount: 1,
        recoveryLightRemaining: 2,
        recoverySupportMode: 'support-concept-recovery',
      },
    }, policy);
    const alpha = getConcept(merged);

    expect(alpha.lightPassCount).toBe(4);
    expect(alpha.hardPassCount).toBe(1);
    expect(alpha.recoveryLightRemaining).toBe(2);
    expect(alpha.recoverySupportMode).toBe('support-concept-recovery');
  });

  it('backfills guided fields from legacy schedule evidence when explicit fields are missing', () => {
    const merged = mergeGuidedConceptProgress<ReviewSubskill>(['alpha'], {
      alpha: {
        independentPassCount: 0,
        supportedPassCount: 1,
        attempts: 2,
        supplementalExposureCount: 1,
      },
    }, policy);
    const alpha = getConcept(merged);

    expect(alpha.lightPassCount).toBe(2);
    expect(alpha.hardPassCount).toBe(0);
    expect(alpha.recoveryLightRemaining).toBe(0);
    expect(alpha.recoverySupportMode).toBe('none');
  });
});

describe('getConceptRepetitionPlan', () => {
  it('moves from light reps into hard reps after four light clears', () => {
    const base = buildInitialGuidedConceptProgress<ReviewSubskill>(['alpha'], policy);
    const lightOne = applyGuidedConceptOutcome(base, 'alpha', 'independent_correct', 1, { policy, phase: 'light' });
    const lightTwo = applyGuidedConceptOutcome(lightOne, 'alpha', 'independent_correct', 2, { policy, phase: 'light' });
    const lightThree = applyGuidedConceptOutcome(lightTwo, 'alpha', 'independent_correct', 3, { policy, phase: 'light' });
    const lightFour = applyGuidedConceptOutcome(lightThree, 'alpha', 'independent_correct', 4, { policy, phase: 'light' });
    const alpha = getConcept(lightFour);

    expect(getConceptRepetitionPlan(alpha)).toEqual({
      repPhase: 'hard',
      repIndex: 5,
      supportMode: 'none',
      hardAttemptLimit: HARD_ATTEMPT_LIMIT,
    });
    expect(getConceptRepetitionPlanFromRoot(alpha).hardAttemptLimit).toBe(ROOT_HARD_ATTEMPT_LIMIT);
  });
});

describe('applyGuidedConceptOutcome', () => {
  it('advances light reps without awarding proof credit', () => {
    const base = buildInitialGuidedConceptProgress<ReviewSubskill>(['alpha'], policy);
    const progressed = applyGuidedConceptOutcome(base, 'alpha', 'supported_correct', 2, {
      policy,
      phase: 'light',
    });
    const alpha = getConcept(progressed);

    expect(alpha.independentPassCount).toBe(0);
    expect(alpha.supportedPassCount).toBe(1);
    expect(alpha.lightPassCount).toBe(1);
    expect(alpha.recoveryDue).toBe(false);
  });

  it('awards proof only on hard independent solves and sets retention after mastery', () => {
    const base = buildInitialGuidedConceptProgress<ReviewSubskill>(['alpha'], policy);
    const lightOne = applyGuidedConceptOutcome(base, 'alpha', 'independent_correct', 1, { policy, phase: 'light' });
    const lightTwo = applyGuidedConceptOutcome(lightOne, 'alpha', 'independent_correct', 2, { policy, phase: 'light' });
    const lightThree = applyGuidedConceptOutcome(lightTwo, 'alpha', 'independent_correct', 3, { policy, phase: 'light' });
    const lightFour = applyGuidedConceptOutcome(lightThree, 'alpha', 'independent_correct', 4, { policy, phase: 'light' });
    const hardOne = applyGuidedConceptOutcome(lightFour, 'alpha', 'independent_correct', 5, { policy, phase: 'hard' });
    const hardTwo = applyGuidedConceptOutcome(hardOne, 'alpha', 'independent_correct', 8, { policy, phase: 'hard' });
    const hardThree = applyGuidedConceptOutcome(hardTwo, 'alpha', 'independent_correct', 14, { policy, phase: 'hard' });
    const alphaAfterHardOne = getConcept(hardOne);
    const alphaAfterHardTwo = getConcept(hardTwo);
    const alphaAfterHardThree = getConcept(hardThree);

    expect(alphaAfterHardOne.independentPassCount).toBe(1);
    expect(alphaAfterHardOne.hardPassCount).toBe(1);
    expect(alphaAfterHardTwo.hardPassCount).toBe(HARD_REP_TARGET);
    expect(alphaAfterHardThree.mastered).toBe(true);
    expect(alphaAfterHardThree.retentionCheckPassed).toBe(false);
    expect(alphaAfterHardThree.retentionCheckEligibleTurn).toBe(23);
    expect(isRetentionDue(alphaAfterHardThree, 23, policy)).toBe(true);
  });

  it('queues two recovery-light reps after a hard miss', () => {
    const ready = makeConcept('alpha', {
      lightPassCount: LIGHT_REP_TARGET,
      hardPassCount: 1,
      independentPassCount: 1,
      nextEligibleTurn: 8,
    });
    const progress = { alpha: ready } satisfies GuidedConceptProgressMap<ReviewSubskill>;
    const failed = applyGuidedConceptOutcome(progress, 'alpha', 'assisted', 8, {
      policy,
      phase: 'hard',
      recoverySupportMode: 'same-concept-recovery',
    });
    const alpha = getConcept(failed);

    expect(alpha.recoveryDue).toBe(true);
    expect(alpha.recoveryLightRemaining).toBe(HARD_FAILURE_RECOVERY_LIGHTS);
    expect(alpha.recoverySupportMode).toBe('same-concept-recovery');
    expect(getConceptRepetitionPlan(alpha)).toEqual({
      repPhase: 'recovery-light',
      repIndex: 3,
      supportMode: 'same-concept-recovery',
      hardAttemptLimit: null,
    });
  });

  it('keeps phase fields unchanged during supplemental exposure pulls', () => {
    const progress = {
      alpha: makeConcept('alpha', {
        lightPassCount: 4,
        hardPassCount: 1,
        nextEligibleTurn: 12,
      }),
    } satisfies GuidedConceptProgressMap<ReviewSubskill>;
    const next = applySupplementalGuidedConceptExposure(progress, 'alpha', 5, {
      wasClean: false,
    });
    const alpha = getConcept(next);

    expect(alpha.lightPassCount).toBe(4);
    expect(alpha.hardPassCount).toBe(1);
    expect(alpha.nextEligibleTurn).toBe(6);
  });
});

describe('selection helpers', () => {
  it('prioritizes recognition and structure on new concepts', () => {
    const concept = makeConcept('alpha');

    expect(getPreferredSubskillsForConceptSelection(concept, 1)).toEqual(['recognition', 'structure']);
    expect(getConceptSelectionReason(concept, 1, ['recognition', 'structure'])).toBe('new_concept');
  });

  it('sorts weakest subskills and guided picker by recovery then repetition depth', () => {
    const progress = {
      alpha: makeConcept('alpha', {
        recoveryDue: true,
        lightPassCount: 4,
        hardPassCount: 1,
        nextEligibleTurn: 5,
        subskillStats: {
          recognition: { attempts: 1, cleanPasses: 0, supportedPasses: 0, misses: 1, lastMissedTurn: 1 },
          structure: { attempts: 1, cleanPasses: 0, supportedPasses: 0, misses: 2, lastMissedTurn: 1 },
          sanity: { attempts: 0, cleanPasses: 0, supportedPasses: 0, misses: 0, lastMissedTurn: null },
          syntax: { attempts: 1, cleanPasses: 1, supportedPasses: 0, misses: 0, lastMissedTurn: null },
          computation: { attempts: 1, cleanPasses: 1, supportedPasses: 0, misses: 0, lastMissedTurn: null },
          interpretation: { attempts: 0, cleanPasses: 0, supportedPasses: 0, misses: 0, lastMissedTurn: null },
        },
      }),
      beta: makeConcept('beta', {
        nextEligibleTurn: 5,
      }),
    } satisfies GuidedConceptProgressMap<ReviewSubskill>;
    const alpha = getConcept(progress);

    expect(getWeakestSubskills(alpha, 2)).toEqual(['structure', 'recognition']);
    expect(pickNextGuidedConceptId(progress, 5, { policy })).toBe('alpha');
  });

  it('normalizes legacy reason strings into the guided vocabulary', () => {
    expect(normalizeSelectionReason(undefined)).toBe('guided_mastery');
    expect(normalizeSelectionReason('scheduled_review')).toBe('guided_mastery');
    expect(normalizeSelectionReason('spaced_review')).toBe('guided_mastery');
    expect(normalizeSelectionReason('recovery_due:structure')).toBe('recovery_due');
    expect(normalizeSelectionReason('weakest_subskill:syntax')).toBe('weakest_subskill:syntax');
  });

  it('derives state badges from recovery, retention, and mastery', () => {
    expect(getConceptStateBadge(undefined, 1)).toBe('Emerging');
    expect(getConceptStateBadge(makeConcept('alpha', { recoveryDue: true }), 1)).toBe('Recovery due');
    expect(getConceptStateBadge(makeConcept('alpha', {
      mastered: true,
      independentPassCount: 3,
      retentionCheckEligibleTurn: 4,
      retentionCheckPassed: false,
    }), 4)).toBe('Retention due');
  });
});
