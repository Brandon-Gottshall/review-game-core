/**
 * Base question types — generic over a game-specific question-type union.
 *
 * Consumers define their own string-literal union and narrow:
 *
 *   type CSQuestionType = 'vocabulary' | 'trace_variables' | 'predict_output' | ...;
 *   interface CSInteractiveData extends InteractiveData {
 *     variantData?: { code: string; finalValues: Record<string, string | number> };
 *     outputData?:  { code: string; expectedOutput: string };
 *   }
 *   type CSQuestion = Question<CSQuestionType> & { interactive?: CSInteractiveData };
 *
 * The core never enumerates any game's types.
 */
/**
 * Open payload bag for per-question interactive renderer data.
 * Games extend this via intersection; the only conventional key is `code`.
 */
export interface InteractiveData {
    /** Optional raw source code snippet the question references. */
    code?: string;
    /** Games are free to add their own payload keys. */
    [key: string]: unknown;
}
/**
 * Generic review-game question.
 *
 * @typeParam TType - String-literal union of the game's question types.
 */
export interface Question<TType extends string = string> {
    /** Stable unique identifier within the question pool. */
    id: string;
    /** FK to ConceptNode.id in the game's concept tree. */
    concept: string;
    /** Game-specific question type discriminator. */
    type: TType;
    /** Prompt text shown to the student. */
    question: string;
    /** The authoritative correct answer (string-serialized). */
    correctAnswer: string;
    /** Optional wrong answers for MCQ-style rendering. */
    distractors?: string[];
    /** Optional post-answer explanation. */
    explanation?: string;
    /** Optional supporting bullet points. */
    keyFacts?: string[];
    /** Optional formula / code snippet associated with the question. */
    formula?: string;
    /** Optional payload for interactive renderers. */
    interactive?: InteractiveData;
    /** Optional chapter/unit grouping — used for reporting, not logic. */
    chapter?: number;
    /** Optional sub-section identifier. */
    section?: string;
}
/**
 * Narrow a `Question<string>` to a specific game-type union at runtime.
 * Useful when filtering heterogeneous pools without type predicates.
 */
export declare function isQuestionOfType<TType extends string>(q: Question<string>, type: TType): q is Question<TType>;
//# sourceMappingURL=index.d.ts.map