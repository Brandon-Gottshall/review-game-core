/**
 * Seeded PRNG + Generator interface.
 *
 * Each game builds its own generators using the mulberry32 PRNG and these
 * helper functions. The core provides the plumbing (seeding, picking,
 * dedup, concept-dispatch); the game provides the template logic.
 */

import type { Question } from '../question/index.js';

// ─── mulberry32 PRNG ─────────────────────────────────────────

/**
 * Mulberry32 — fast, seedable, good distribution. Returns a function
 * that yields the next float in [0, 1) on each call.
 */
export function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Random integer in [min, max] (inclusive). */
export function randInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Pick a uniformly random element from a non-empty array. */
export function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

/** Fisher-Yates shuffle in-place using the provided rng. */
export function shuffle<T>(rng: () => number, arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/** Remove duplicates and the correct answer from a candidate distractor list. */
export function cleanDistractors(correct: string, candidates: string[]): string[] {
  const seen = new Set<string>([correct]);
  const result: string[] = [];
  for (const c of candidates) {
    if (!seen.has(c)) {
      seen.add(c);
      result.push(c);
    }
  }
  return result;
}

// ─── Generator interface ─────────────────────────────────────

/**
 * A template-based question generator. Games implement these with domain
 * knowledge (Java snippets, astronomy formulae, etc.) and register them
 * as an array the WF harness validates.
 *
 * @typeParam Q - The game's narrowed Question type.
 */
export interface Generator<Q extends Question = Question> {
  /** Unique generator id (used for determinism assertions). */
  id: string;
  /** ConceptNode.id this generator covers. */
  concept: string;
  /** Question type it emits. */
  type: string;
  /** Given a 32-bit seed, produce a deterministic question. */
  generate: (seed: number) => Q;
}

/**
 * Generate a random question for a given concept, avoiding seed collisions.
 * Returns null if no generator covers this concept or seeds are exhausted.
 */
export function generateForConcept<Q extends Question>(
  concept: string,
  generators: Generator<Q>[],
  usedSeeds: Set<number>
): Q | null {
  const matching = generators.filter(g => g.concept === concept);
  if (matching.length === 0) return null;

  const gen = matching[Math.floor(Math.random() * matching.length)]!;

  for (let attempt = 0; attempt < 100; attempt++) {
    const seed = Math.floor(Math.random() * 2147483647);
    if (!usedSeeds.has(seed)) {
      usedSeeds.add(seed);
      return gen.generate(seed);
    }
  }
  return null;
}
