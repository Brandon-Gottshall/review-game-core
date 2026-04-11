/**
 * Seeded PRNG + Generator interface.
 *
 * Each game builds its own generators using the mulberry32 PRNG and these
 * helper functions. The core provides the plumbing (seeding, picking,
 * dedup, concept-dispatch); the game provides the template logic.
 */
// ─── mulberry32 PRNG ─────────────────────────────────────────
/**
 * Mulberry32 — fast, seedable, good distribution. Returns a function
 * that yields the next float in [0, 1) on each call.
 */
export function mulberry32(seed) {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
/** Random integer in [min, max] (inclusive). */
export function randInt(rng, min, max) {
    return min + Math.floor(rng() * (max - min + 1));
}
/** Pick a uniformly random element from a non-empty array. */
export function pick(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
}
/** Fisher-Yates shuffle in-place using the provided rng. */
export function shuffle(rng, arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}
/** Remove duplicates and the correct answer from a candidate distractor list. */
export function cleanDistractors(correct, candidates) {
    const seen = new Set([correct]);
    const result = [];
    for (const c of candidates) {
        if (!seen.has(c)) {
            seen.add(c);
            result.push(c);
        }
    }
    return result;
}
/**
 * Generate a random question for a given concept, avoiding seed collisions.
 * Returns null if no generator covers this concept or seeds are exhausted.
 */
export function generateForConcept(concept, generators, usedSeeds) {
    const matching = generators.filter(g => g.concept === concept);
    if (matching.length === 0)
        return null;
    const gen = matching[Math.floor(Math.random() * matching.length)];
    for (let attempt = 0; attempt < 100; attempt++) {
        const seed = Math.floor(Math.random() * 2147483647);
        if (!usedSeeds.has(seed)) {
            usedSeeds.add(seed);
            return gen.generate(seed);
        }
    }
    return null;
}
//# sourceMappingURL=index.js.map