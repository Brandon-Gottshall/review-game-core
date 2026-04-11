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
 * Narrow a `Question<string>` to a specific game-type union at runtime.
 * Useful when filtering heterogeneous pools without type predicates.
 */
export function isQuestionOfType(q, type) {
    return q.type === type;
}
//# sourceMappingURL=index.js.map