export type QuizEnginePhase =
  | 'routing'
  | 'question'
  | 'staged-answer'
  | 'support'
  | 'recovery'
  | 'complete';

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
  type:
    | 'route'
    | 'select-question'
    | 'sync-question-state'
    | 'advance-stage'
    | 'support'
    | 'recovery'
    | 'complete'
    | 'reset';
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

function readStageCount(question: QuizEngineQuestion | null, fallback = 1): number {
  const stageCount = question?.stageCount ?? fallback;
  return Number.isInteger(stageCount) && stageCount > 0 ? stageCount : fallback;
}

function deriveQuizEnginePhase(options: {
  question: QuizEngineQuestion | null;
  stageIndex: number;
  stagedAnswers: readonly string[];
  supportActive?: boolean;
  recoveryActive?: boolean;
  complete?: boolean;
}): QuizEnginePhase {
  if (options.complete) return 'complete';
  if (options.recoveryActive) return 'recovery';
  if (options.supportActive) return 'support';
  if (!options.question) return 'routing';
  if (options.stageIndex > 0 || options.stagedAnswers.length > 0) return 'staged-answer';
  return 'question';
}

export function createQuizEngineState<TQuestion extends QuizEngineQuestion = QuizEngineQuestion>(
  snapshot: Partial<QuizEngineState<TQuestion>> = {}
): QuizEngineState<TQuestion> {
  return {
    phase: snapshot.phase ?? 'routing',
    route: snapshot.route ?? null,
    currentConcept: snapshot.currentConcept ?? null,
    currentQuestionId: snapshot.currentQuestionId ?? null,
    currentQuestion: snapshot.currentQuestion ?? null,
    stageIndex: snapshot.stageIndex ?? 0,
    stageCount: snapshot.stageCount ?? readStageCount(snapshot.currentQuestion ?? null, 1),
    stagedAnswers: [...(snapshot.stagedAnswers ?? [])],
    supportCount: snapshot.supportCount ?? 0,
    recoveryCount: snapshot.recoveryCount ?? 0,
    completedQuestionIds: [...(snapshot.completedQuestionIds ?? [])],
    lastOutcome: snapshot.lastOutcome ?? 'idle',
    complete: snapshot.complete ?? false,
  };
}

export function routeQuizEngine<TQuestion extends QuizEngineQuestion = QuizEngineQuestion>(
  state: QuizEngineState<TQuestion>,
  route: string,
  config: Pick<QuizEngineConfig<TQuestion>, 'routeQuestionId' | 'questions' | 'stageCountForQuestion'> = {
    questions: [],
  }
): QuizEngineState<TQuestion> {
  const currentQuestionId = config.routeQuestionId?.(route) ?? null;
  const currentQuestion = config.questions.find(question => question.id === currentQuestionId) ?? null;

  return {
    ...state,
    phase: 'routing',
    route,
    currentQuestionId,
    currentConcept: currentQuestion?.concept ?? null,
    currentQuestion,
    stageIndex: 0,
    stageCount: config.stageCountForQuestion?.(currentQuestion as TQuestion) ?? readStageCount(currentQuestion, 1),
    stagedAnswers: [],
    lastOutcome: 'routed',
    complete: false,
  };
}

export function selectQuizQuestion<TQuestion extends QuizEngineQuestion = QuizEngineQuestion>(
  state: QuizEngineState<TQuestion>,
  question: TQuestion,
  config: Pick<QuizEngineConfig<TQuestion>, 'stageCountForQuestion' | 'defaultStageCount'> = {}
): QuizEngineState<TQuestion> {
  return {
    ...state,
    phase: 'question',
    currentQuestionId: question.id,
    currentConcept: question.concept,
    currentQuestion: question,
    stageIndex: 0,
    stageCount:
      config.stageCountForQuestion?.(question)
      ?? question.stageCount
      ?? config.defaultStageCount
      ?? 1,
    stagedAnswers: [],
    lastOutcome: 'routed',
    complete: false,
  };
}

export function advanceQuizStage<TQuestion extends QuizEngineQuestion = QuizEngineQuestion>(
  state: QuizEngineState<TQuestion>,
  answer: string,
  options: {
    stageIndex?: number;
    stageCount?: number;
    completeWhenLastStage?: boolean;
  } = {}
): QuizEngineState<TQuestion> {
  const nextStageIndex = options.stageIndex ?? state.stageIndex + 1;
  const stageCount = options.stageCount ?? state.stageCount;
  const stagedAnswers = [...state.stagedAnswers, answer];
  const isFinalStage = nextStageIndex >= Math.max(stageCount - 1, 0);

  return {
    ...state,
    phase: isFinalStage ? 'question' : 'staged-answer',
    stageIndex: nextStageIndex,
    stageCount,
    stagedAnswers,
    lastOutcome: 'answered',
    complete: options.completeWhenLastStage ? isFinalStage : state.complete,
  };
}

export function syncQuizEngineQuestionState<TQuestion extends QuizEngineQuestion = QuizEngineQuestion>(
  state: QuizEngineState<TQuestion>,
  options: {
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
  } = {}
): QuizEngineState<TQuestion> {
  const question = options.question ?? state.currentQuestion ?? null;
  const stageIndex = options.stageIndex ?? state.stageIndex;
  const stageCount = options.stageCount ?? readStageCount(question, state.stageCount || 1);
  const stagedAnswers = [...(options.stagedAnswers ?? state.stagedAnswers)];
  const completedQuestionId = options.completedQuestionId ?? (options.complete ? question?.id ?? null : null);
  const completedQuestionIds = completedQuestionId
    ? Array.from(new Set([...state.completedQuestionIds, completedQuestionId]))
    : [...state.completedQuestionIds];

  return {
    ...state,
    route: options.route ?? state.route,
    currentQuestion: question,
    currentQuestionId: question?.id ?? null,
    currentConcept: question?.concept ?? null,
    stageIndex,
    stageCount,
    stagedAnswers,
    phase: deriveQuizEnginePhase({
      question,
      stageIndex,
      stagedAnswers,
      supportActive: options.supportActive,
      recoveryActive: options.recoveryActive,
      complete: options.complete,
    }),
    completedQuestionIds,
    lastOutcome: options.outcome ?? state.lastOutcome,
    complete: options.complete ?? false,
  };
}

export function enterSupportState<TQuestion extends QuizEngineQuestion = QuizEngineQuestion>(
  state: QuizEngineState<TQuestion>
): QuizEngineState<TQuestion> {
  return {
    ...state,
    phase: 'support',
    supportCount: state.supportCount + 1,
    lastOutcome: 'supported',
  };
}

export function enterRecoveryState<TQuestion extends QuizEngineQuestion = QuizEngineQuestion>(
  state: QuizEngineState<TQuestion>
): QuizEngineState<TQuestion> {
  return {
    ...state,
    phase: 'recovery',
    recoveryCount: state.recoveryCount + 1,
    lastOutcome: 'recovered',
  };
}

export function completeQuizQuestion<TQuestion extends QuizEngineQuestion = QuizEngineQuestion>(
  state: QuizEngineState<TQuestion>,
  completedQuestionId: string = state.currentQuestionId ?? ''
): QuizEngineState<TQuestion> {
  const completedQuestionIds = completedQuestionId
    ? Array.from(new Set([...state.completedQuestionIds, completedQuestionId]))
    : [...state.completedQuestionIds];

  return {
    ...state,
    phase: 'complete',
    completedQuestionIds,
    lastOutcome: 'completed',
    complete: true,
  };
}

export function resetQuizEngine<TQuestion extends QuizEngineQuestion = QuizEngineQuestion>(
  snapshot: Partial<QuizEngineState<TQuestion>> = {}
): QuizEngineState<TQuestion> {
  return createQuizEngineState<TQuestion>({
    ...snapshot,
    phase: 'routing',
    route: null,
    currentConcept: null,
    currentQuestionId: null,
    currentQuestion: null,
    stageIndex: 0,
    stagedAnswers: [],
    supportCount: 0,
    recoveryCount: 0,
    completedQuestionIds: [],
    lastOutcome: 'reset',
    complete: false,
  });
}

export function reduceQuizEngine<TQuestion extends QuizEngineQuestion = QuizEngineQuestion>(
  state: QuizEngineState<TQuestion>,
  action: QuizEngineAction<TQuestion>,
  config: QuizEngineConfig<TQuestion> = { questions: [] }
): QuizEngineState<TQuestion> {
  switch (action.type) {
    case 'route':
      return routeQuizEngine(state, action.route ?? '', config);
    case 'select-question':
      return action.question ? selectQuizQuestion(state, action.question, config) : state;
    case 'sync-question-state':
      return syncQuizEngineQuestionState(state, {
        route: action.route,
        question: action.currentQuestion ?? action.question ?? null,
        stageIndex: action.stageIndex,
        stageCount: action.stageCount,
        stagedAnswers: action.stageAnswers,
        supportActive: action.supportActive,
        recoveryActive: action.recoveryActive,
        complete: action.complete,
        outcome: action.outcome,
        completedQuestionId: action.completedQuestionId,
      });
    case 'advance-stage':
      return typeof action.answer === 'string'
        ? advanceQuizStage(state, action.answer, {
          stageIndex: action.stageIndex,
          stageCount: action.stageCount,
          completeWhenLastStage: action.complete,
        })
        : state;
    case 'support':
      return enterSupportState(state);
    case 'recovery':
      return enterRecoveryState(state);
    case 'complete':
      return completeQuizQuestion(state, action.completedQuestionId ?? action.questionId ?? state.currentQuestionId ?? '');
    case 'reset':
      return resetQuizEngine(state);
    default:
      return state;
  }
}
