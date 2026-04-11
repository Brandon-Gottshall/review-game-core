/**
 * Seeded PRNG + Generator interface.
 *
 * Each game builds its own generators using the mulberry32 PRNG and these
 * helper functions. The core provides the plumbing (seeding, picking,
 * dedup, concept-dispatch); the game provides the template logic.
 */
import type { Question } from '../question/index.js';
/**
 * Mulberry32 — fast, seedable, good distribution. Returns a function
 * that yields the next float in [0, 1) on each call.
 */
export declare function mulberry32(seed: number): () => number;
/** Random integer in [min, max] (inclusive). */
export declare function randInt(rng: () => number, min: number, max: number): number;
/** Pick a uniformly random element from a non-empty array. */
export declare function pick<T>(rng: () => number, arr: readonly T[]): T;
/** Fisher-Yates shuffle in-place using the provided rng. */
export declare function shuffle<T>(rng: () => number, arr: T[]): T[];
/** Remove duplicates and the correct answer from a candidate distractor list. */
export declare function cleanDistractors(correct: string, candidates: string[]): string[];
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
export declare function generateForConcept<Q extends Question>(concept: string, generators: Generator<Q>[], usedSeeds: Set<number>): Q | null;
//# sourceMappingURL=index.d.ts.map