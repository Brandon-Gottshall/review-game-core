export type QuizEnginePhase = 'routing' | 'question' | 'staged-answer' | 'support' | 'recovery' | 'complete';
export interface QuizEngineQuestion {
    id: string;
    concept: string;
    type: string;
    stageCount?: number;
    supportsRecovery?: boolean;
}
export interface QuizEngineConfig<TQuestion extends QuizEngineQuestion = QuizEngineQuestion> {
    questions: readonly TQuestion[];
    defaultStageCount?: number;
    allowSupport?: boolean;
    allowRecovery?: boolean;
    routeQuestionId?: (route: string) => string | null;
    stageCountForQuestion?: (question: TQuestion) => number | undefined;
}
export interface QuizEngineState<TQuestion extends QuizEngineQuestion = QuizEngineQuestion> {
    phase: QuizEnginePhase;
    route: string | null;
    currentConcept: string | null;
    currentQuestionId: string | null;
    currentQuestion: TQuestion | null;
    stageIndex: number;
    stageCount: number;
    stagedAnswers: string[];
    supportCount: number;
    recoveryCount: number;
    completedQuestionIds: string[];
    lastOutcome: 'idle' | 'routed' | 'answered' | 'supported' | 'recovered' | 'completed' | 'reset';
    complete: boolean;
}
export interface QuizEngineAction<TQuestion extends QuizEngineQuestion = QuizEngineQuestion> {
    type: 'route' | 'select-question' | 'sync-question-state' | 'advance-stage' | 'support' | 'recovery' | 'complete' | 'reset';
    route?: string;
    question?: TQuestion;
    questionId?: string;
    conceptId?: string;
    answer?: string;
    stageCount?: number;
    stageIndex?: number;
    completedQuestionId?: string;
    currentQuestion?: TQuestion | null;
    stageAnswers?: readonly string[];
    complete?: boolean;
    supportActive?: boolean;
    recoveryActive?: boolean;
    outcome?: QuizEngineState<TQuestion>['lastOutcome'];
}
export declare function createQuizEngineState<TQuestion extends QuizEngineQuestion = QuizEngineQuestion>(snapshot?: Partial<QuizEngineState<TQuestion>>): QuizEngineState<TQuestion>;
export declare function routeQuizEngine<TQuestion extends QuizEngineQuestion = QuizEngineQuestion>(state: QuizEngineState<TQuestion>, route: string, config?: Pick<QuizEngineConfig<TQuestion>, 'routeQuestionId' | 'questions' | 'stageCountForQuestion'>): QuizEngineState<TQuestion>;
export declare function selectQuizQuestion<TQuestion extends QuizEngineQuestion = QuizEngineQuestion>(state: QuizEngineState<TQuestion>, question: TQuestion, config?: Pick<QuizEngineConfig<TQuestion>, 'stageCountForQuestion' | 'defaultStageCount'>): QuizEngineState<TQuestion>;
export declare function advanceQuizStage<TQuestion extends QuizEngineQuestion = QuizEngineQuestion>(state: QuizEngineState<TQuestion>, answer: string, options?: {
    stageIndex?: number;
    stageCount?: number;
    completeWhenLastStage?: boolean;
}): QuizEngineState<TQuestion>;
export declare function syncQuizEngineQuestionState<TQuestion extends QuizEngineQuestion = QuizEngineQuestion>(state: QuizEngineState<TQuestion>, options?: {
    route?: string | null;
    question?: TQuestion | null;
    stageIndex?: number;
    stageCount?: number;
    stagedAnswers?: readonly string[];
    supportActive?: boolean;
    recoveryActive?: boolean;
    complete?: boolean;
    outcome?: QuizEngineState<TQuestion>['lastOutcome'];
    completedQuestionId?: string | null;
}): QuizEngineState<TQuestion>;
export declare function enterSupportState<TQuestion extends QuizEngineQuestion = QuizEngineQuestion>(state: QuizEngineState<TQuestion>): QuizEngineState<TQuestion>;
export declare function enterRecoveryState<TQuestion extends QuizEngineQuestion = QuizEngineQuestion>(state: QuizEngineState<TQuestion>): QuizEngineState<TQuestion>;
export declare function completeQuizQuestion<TQuestion extends QuizEngineQuestion = QuizEngineQuestion>(state: QuizEngineState<TQuestion>, completedQuestionId?: string): QuizEngineState<TQuestion>;
export declare function resetQuizEngine<TQuestion extends QuizEngineQuestion = QuizEngineQuestion>(snapshot?: Partial<QuizEngineState<TQuestion>>): QuizEngineState<TQuestion>;
export declare function reduceQuizEngine<TQuestion extends QuizEngineQuestion = QuizEngineQuestion>(state: QuizEngineState<TQuestion>, action: QuizEngineAction<TQuestion>, config?: QuizEngineConfig<TQuestion>): QuizEngineState<TQuestion>;
//# sourceMappingURL=quiz-engine.d.ts.map