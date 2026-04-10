import { describe, it, expect } from 'vitest';
import {
  type ConceptTree,
  type MasteryData,
  MASTERY_THRESHOLD,
  getConceptMastery,
  isConceptUnlocked,
  getUnlockedQuestionIds,
  getMasteredConcepts,
  getNextUnlockedConcepts,
  calculateTreeProgress,
  populateConceptQuestions,
} from '../src/concept/index.js';

const tree: ConceptTree = [
  { id: 'a', name: 'A', description: '', prerequisites: [],    questionIds: ['a1','a2'] },
  { id: 'b', name: 'B', description: '', prerequisites: ['a'], questionIds: ['b1','b2'] },
  { id: 'c', name: 'C', description: '', prerequisites: ['b'], questionIds: ['c1'] },
];

describe('getConceptMastery', () => {
  it('returns 0 when no attempts', () => {
    expect(getConceptMastery('a', ['a1','a2'], {})).toBe(0);
  });
  it('returns 0 for empty question list', () => {
    expect(getConceptMastery('x', [], { a1: { correct: 1, total: 1 } })).toBe(0);
  });
  it('computes fraction correct across attempts', () => {
    const m: MasteryData = { a1: { correct: 3, total: 4 }, a2: { correct: 1, total: 2 } };
    expect(getConceptMastery('a', ['a1','a2'], m)).toBeCloseTo(4 / 6);
  });
});

describe('isConceptUnlocked', () => {
  it('roots are always unlocked', () => {
    expect(isConceptUnlocked('a', tree, {})).toBe(true);
  });
  it('locked until prereq meets threshold', () => {
    expect(isConceptUnlocked('b', tree, {})).toBe(false);
    const m: MasteryData = { a1: { correct: 7, total: 10 }, a2: { correct: 7, total: 10 } };
    expect(isConceptUnlocked('b', tree, m)).toBe(true);
  });
  it('custom threshold is honored', () => {
    const m: MasteryData = { a1: { correct: 5, total: 10 }, a2: { correct: 5, total: 10 } };
    expect(isConceptUnlocked('b', tree, m)).toBe(false);
    expect(isConceptUnlocked('b', tree, m, 0.5)).toBe(true);
  });
  it('missing concept returns false', () => {
    expect(isConceptUnlocked('zz', tree, {})).toBe(false);
  });
});

describe('getUnlockedQuestionIds', () => {
  it('includes root question ids even without attempts', () => {
    expect(getUnlockedQuestionIds(tree, {})).toEqual(['a1','a2']);
  });
  it('chains unlocks as mastery propagates', () => {
    const m: MasteryData = {
      a1: { correct: 1, total: 1 }, a2: { correct: 1, total: 1 },
      b1: { correct: 1, total: 1 }, b2: { correct: 1, total: 1 },
    };
    expect(getUnlockedQuestionIds(tree, m)).toEqual(['a1','a2','b1','b2','c1']);
  });
});

describe('getMasteredConcepts', () => {
  it('returns ids meeting threshold', () => {
    const m: MasteryData = {
      a1: { correct: 1, total: 1 }, a2: { correct: 1, total: 1 },
    };
    expect(getMasteredConcepts(tree, m)).toEqual(['a']);
  });
});

describe('getNextUnlockedConcepts', () => {
  it('returns unlocked-but-not-mastered concepts', () => {
    expect(getNextUnlockedConcepts(tree, {}).map(c => c.id)).toEqual(['a']);
  });
});

describe('calculateTreeProgress', () => {
  it('buckets all concepts', () => {
    const progress = calculateTreeProgress(tree, {});
    expect(progress.totalConcepts).toBe(3);
    expect(progress.masteredConcepts).toBe(0);
    expect(progress.unlockedConcepts).toBe(1);
    expect(progress.lockedConcepts).toBe(2);
  });
  it('computes percentComplete from mastered count', () => {
    const m: MasteryData = {
      a1: { correct: 1, total: 1 }, a2: { correct: 1, total: 1 },
    };
    const p = calculateTreeProgress(tree, m);
    expect(p.masteredConcepts).toBe(1);
    expect(p.percentComplete).toBeCloseTo(100 / 3);
  });
});

describe('populateConceptQuestions', () => {
  it('maps by explicit concept field', () => {
    const bare: ConceptTree = [
      { id: 'a', name: 'A', description: '', prerequisites: [], questionIds: [] },
      { id: 'b', name: 'B', description: '', prerequisites: [], questionIds: [] },
    ];
    const pool = [
      { id: 'q1', concept: 'a' },
      { id: 'q2', concept: 'a' },
      { id: 'q3', concept: 'b' },
      { id: 'q4', concept: 'nowhere' },
    ];
    const populated = populateConceptQuestions(bare, pool);
    expect(populated[0]!.questionIds).toEqual(['q1','q2']);
    expect(populated[1]!.questionIds).toEqual(['q3']);
  });
});

describe('MASTERY_THRESHOLD', () => {
  it('is 0.7', () => {
    expect(MASTERY_THRESHOLD).toBe(0.7);
  });
});
