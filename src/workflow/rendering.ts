export type QuestionRenderer<TQuestion extends { type: string }, TOutput = unknown> = (
  question: TQuestion
) => TOutput;

export type QuestionRendererRegistry<
  TType extends string = string,
  TRenderer = QuestionRenderer<{ type: TType }, unknown>
> = Partial<Record<TType, TRenderer>>;

export interface QuestionRendererEntry<TType extends string = string, TRenderer = unknown> {
  type: TType;
  renderer: TRenderer;
}

export function resolveQuestionRenderer<TType extends string, TRenderer>(
  registry: QuestionRendererRegistry<TType, TRenderer>,
  type: TType
): TRenderer | null {
  return registry[type] ?? null;
}

export function registerQuestionRenderer<TType extends string, TRenderer>(
  registry: QuestionRendererRegistry<TType, TRenderer>,
  entry: QuestionRendererEntry<TType, TRenderer>
): QuestionRendererRegistry<TType, TRenderer> {
  return {
    ...registry,
    [entry.type]: entry.renderer,
  };
}

export function getMissingRendererTypes<TType extends string>(
  requiredTypes: readonly TType[],
  registry: QuestionRendererRegistry<TType, unknown>
): TType[] {
  return requiredTypes.filter(type => registry[type] == null);
}

export function listRegisteredRendererTypes<TType extends string>(
  registry: QuestionRendererRegistry<TType, unknown>
): TType[] {
  return Object.keys(registry).filter((type): type is TType => registry[type as TType] != null);
}
