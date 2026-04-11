/**
 * Concept tree primitives — prerequisite-gated skill tree for review games.
 *
 * Core responsibilities:
 *   - Shape of a ConceptNode
 *   - Mastery math (fraction correct across a concept's questions)
 *   - Unlock logic (all prerequisites must be mastered)
 *   - Populate-from-pool helper
 *
 * The 0.7 mastery threshold is the default used by cs1301-review-game; games
 * that want a different value can call the lower-level functions and compare
 * against their own constant, or shadow MASTERY_THRESHOLD locally.
 */
/** Per-question attempt counter used to compute mastery. */
export interface MasteryRecord {
    correct: number;
    total: number;
}
/** Keyed by question id. */
export type MasteryData = Record<string, MasteryRecord>;
/** A single node in the concept DAG. */
export interface ConceptNode {
    /** Stable unique identifier. */
    id: string;
    /** Display name. */
    name: string;
    /** One-line human description. */
    description: string;
    /** ConceptNode.id values that must be mastered before this unlocks. */
    prerequisites: string[];
    /** Populated by populateConceptQuestions from the question pool. */
    questionIds: string[];
    /** Optional chapter/unit grouping. */
    chapter?: number;
    /** Optional x% layout position (0-100) for skill-tree rendering. */
    x?: number;
    /** Optional y% layout position (0-100) for skill-tree rendering. */
    y?: number;
}
export type ConceptTree = ConceptNode[];
/** Default mastery threshold (70%) used by cs1301-review-game. */
export declare const MASTERY_THRESHOLD = 0.7;
/**
 * Fraction-correct across all attempts on a concept's questions.
 * Returns 0 when there are no attempts yet.
 */
export declare function getConceptMastery(_conceptId: string, questionIds: string[], masteryData: MasteryData): number;
/**
 * A concept unlocks once every prerequisite is at or above the threshold.
 * Root concepts (no prerequisites) are always unlocked.
 */
export declare function isConceptUnlocked(conceptId: string, tree: ConceptTree, masteryData: MasteryData, threshold?: number): boolean;
/** Flatten all question ids from every currently-unlocked concept. */
export declare function getUnlockedQuestionIds(tree: ConceptTree, masteryData: MasteryData, threshold?: number): string[];
/** Ids of concepts at or above the threshold. */
export declare function getMasteredConcepts(tree: ConceptTree, masteryData: MasteryData, threshold?: number): string[];
/** Concepts that are unlocked but not yet mastered — what to study next. */
export declare function getNextUnlockedConcepts(tree: ConceptTree, masteryData: MasteryData, threshold?: number): ConceptNode[];
/** Overall progress summary. */
export interface TreeProgress {
    totalConcepts: number;
    masteredConcepts: number;
    unlockedConcepts: number;
    lockedConcepts: number;
    percentComplete: number;
}
export declare function calculateTreeProgress(tree: ConceptTree, masteryData: MasteryData, threshold?: number): TreeProgress;
/** Minimal shape needed by populateConceptQuestions. */
export interface QuestionForMapping {
    id: string;
    concept: string;
}
/**
 * Wire a question pool into a concept tree by matching `q.concept` to
 * `ConceptNode.id`. Returns a new tree with `questionIds` populated.
 *
 * Questions whose `concept` doesn't match any node are silently dropped —
 * the WF harness catches those.
 */
export declare function populateConceptQuestions(tree: ConceptTree, questions: QuestionForMapping[]): ConceptTree;
//# sourceMappingURL=index.d.ts.map