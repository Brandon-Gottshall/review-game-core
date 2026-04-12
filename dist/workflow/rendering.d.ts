export type QuestionRenderer<TQuestion extends {
    type: string;
}, TOutput = unknown> = (question: TQuestion) => TOutput;
export type QuestionRendererRegistry<TType extends string = string, TRenderer = QuestionRenderer<{
    type: TType;
}, unknown>> = Partial<Record<TType, TRenderer>>;
export interface QuestionRendererEntry<TType extends string = string, TRenderer = unknown> {
    type: TType;
    renderer: TRenderer;
}
export declare function resolveQuestionRenderer<TType extends string, TRenderer>(registry: QuestionRendererRegistry<TType, TRenderer>, type: TType): TRenderer | null;
export declare function registerQuestionRenderer<TType extends string, TRenderer>(registry: QuestionRendererRegistry<TType, TRenderer>, entry: QuestionRendererEntry<TType, TRenderer>): QuestionRendererRegistry<TType, TRenderer>;
export declare function getMissingRendererTypes<TType extends string>(requiredTypes: readonly TType[], registry: QuestionRendererRegistry<TType, unknown>): TType[];
export declare function listRegisteredRendererTypes<TType extends string>(registry: QuestionRendererRegistry<TType, unknown>): TType[];
//# sourceMappingURL=rendering.d.ts.map