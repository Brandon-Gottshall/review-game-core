import { describe, it, expect } from 'vitest';
import {
  mulberry32,
  randInt,
  pick,
  shuffle,
  cleanDistractors,
  generateForConcept,
  type Generator,
} from '../src/generator/index.js';
import type { Question } from '../src/question/index.js';

describe('mulberry32', () => {
  it('same seed produces identical sequence', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = Array.from({ length: 20 }, () => a());
    const seqB = Array.from({ length: 20 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it('different seeds produce different sequences', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    const valA = a();
    const valB = b();
    expect(valA).not.toBe(valB);
  });

  it('produces values in [0, 1)', () => {
    const rng = mulberry32(123);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('randInt', () => {
  it('stays within [min, max] inclusive', () => {
    const rng = mulberry32(99);
    for (let i = 0; i < 200; i++) {
      const v = randInt(rng, 5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(10);
    }
  });
});

describe('pick', () => {
  it('returns an element from the array', () => {
    const rng = mulberry32(7);
    const arr = ['a', 'b', 'c'];
    for (let i = 0; i < 50; i++) {
      expect(arr).toContain(pick(rng, arr));
    }
  });
});

describe('shuffle', () => {
  it('deterministic with same seed', () => {
    const a = mulberry32(55);
    const b = mulberry32(55);
    const arr1 = [1, 2, 3, 4, 5, 6, 7, 8];
    const arr2 = [1, 2, 3, 4, 5, 6, 7, 8];
    shuffle(a, arr1);
    shuffle(b, arr2);
    expect(arr1).toEqual(arr2);
  });

  it('preserves all elements', () => {
    const rng = mulberry32(88);
    const arr = [1, 2, 3, 4, 5];
    shuffle(rng, arr);
    expect(arr.sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('cleanDistractors', () => {
  it('removes duplicates and the correct answer', () => {
    expect(cleanDistractors('a', ['a', 'b', 'b', 'c'])).toEqual(['b', 'c']);
  });
});

describe('generateForConcept', () => {
  const fakeGen: Generator = {
    id: 'test-gen',
    concept: 'math',
    type: 'predict_output',
    generate: (seed: number): Question => ({
      id: `gen-math-${seed}`,
      concept: 'math',
      type: 'predict_output',
      question: `What is ${seed}?`,
      correctAnswer: String(seed),
    }),
  };

  it('returns a question for a matching concept', () => {
    const q = generateForConcept('math', [fakeGen], new Set());
    expect(q).not.toBeNull();
    expect(q!.concept).toBe('math');
  });

  it('returns null when no generator matches', () => {
    expect(generateForConcept('unknown', [fakeGen], new Set())).toBeNull();
  });

  it('adds the seed to usedSeeds', () => {
    const used = new Set<number>();
    generateForConcept('math', [fakeGen], used);
    expect(used.size).toBe(1);
  });
});
