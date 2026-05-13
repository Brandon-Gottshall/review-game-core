function readStageCount(question, fallback = 1) {
    const stageCount = question?.stageCount ?? fallback;
    return Number.isInteger(stageCount) && stageCount > 0 ? stageCount : fallback;
}
function deriveQuizEnginePhase(options) {
    if (options.complete)
        return 'complete';
    if (options.recoveryActive)
        return 'recovery';
    if (options.supportActive)
        return 'support';
    if (!options.question)
        return 'routing';
    if (options.stageIndex > 0 || options.stagedAnswers.length > 0)
        return 'staged-answer';
    return 'question';
}
export function createQuizEngineState(snapshot = {}) {
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
const QUIZ_ENGINE_PHASES = new Set([
    'routing',
    'question',
    'staged-answer',
    'support',
    'recovery',
    'complete',
]);
const QUIZ_ENGINE_LAST_OUTCOMES = new Set([
    'idle',
    'routed',
    'answered',
    'supported',
    'recovered',
    'completed',
    'reset',
]);
function readNonNegativeInteger(value, fallback) {
    return Number.isInteger(value) && Number(value) >= 0 ? Number(value) : fallback;
}
function readPositiveInteger(value, fallback) {
    return Number.isInteger(value) && Number(value) > 0 ? Number(value) : fallback;
}
function readStringList(value, fallback = []) {
    return Array.isArray(value)
        ? value.filter((entry) => typeof entry === 'string')
        : [...fallback];
}
function readNullableString(value, fallback = null) {
    return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}
function readQuizEnginePhase(value, fallback) {
    return typeof value === 'string' && QUIZ_ENGINE_PHASES.has(value)
        ? value
        : fallback;
}
function readLastOutcome(value, fallback) {
    return typeof value === 'string' && QUIZ_ENGINE_LAST_OUTCOMES.has(value)
        ? value
        : fallback;
}
export function createQuizEngineSnapshot(state) {
    return {
        phase: state.phase,
        route: state.route,
        currentConcept: state.currentConcept,
        currentQuestionId: state.currentQuestionId,
        stageIndex: state.stageIndex,
        stageCount: state.stageCount,
        stagedAnswers: [...state.stagedAnswers],
        supportCount: state.supportCount,
        recoveryCount: state.recoveryCount,
        completedQuestionIds: [...state.completedQuestionIds],
        lastOutcome: state.lastOutcome,
        complete: state.complete,
    };
}
export function restoreQuizEngineState(snapshot, options = {}) {
    const fallback = createQuizEngineState(options.fallback ?? {});
    const question = options.question ?? fallback.currentQuestion ?? null;
    const fallbackStageCount = readStageCount(question, readPositiveInteger(fallback.stageCount, 1));
    const stageCount = readPositiveInteger(snapshot?.stageCount, fallbackStageCount);
    const maxStageIndex = Math.max(stageCount - 1, 0);
    const fallbackStageIndex = readNonNegativeInteger(fallback.stageIndex, 0);
    const stageIndex = Math.min(readNonNegativeInteger(snapshot?.stageIndex, fallbackStageIndex), maxStageIndex);
    const stagedAnswers = readStringList(snapshot?.stagedAnswers, fallback.stagedAnswers);
    const complete = typeof snapshot?.complete === 'boolean' ? snapshot.complete : fallback.complete;
    const fallbackPhase = deriveQuizEnginePhase({
        question,
        stageIndex,
        stagedAnswers,
        supportActive: fallback.phase === 'support',
        recoveryActive: fallback.phase === 'recovery',
        complete,
    });
    const route = 'route' in options
        ? readNullableString(options.route, null)
        : readNullableString(snapshot?.route, fallback.route);
    return {
        ...fallback,
        phase: complete ? 'complete' : readQuizEnginePhase(snapshot?.phase, fallbackPhase),
        route,
        currentConcept: question?.concept ?? readNullableString(snapshot?.currentConcept, fallback.currentConcept),
        currentQuestionId: question?.id ?? readNullableString(snapshot?.currentQuestionId, fallback.currentQuestionId),
        currentQuestion: question,
        stageIndex,
        stageCount,
        stagedAnswers,
        supportCount: readNonNegativeInteger(snapshot?.supportCount, readNonNegativeInteger(fallback.supportCount, 0)),
        recoveryCount: readNonNegativeInteger(snapshot?.recoveryCount, readNonNegativeInteger(fallback.recoveryCount, 0)),
        completedQuestionIds: Array.from(new Set(readStringList(snapshot?.completedQuestionIds, fallback.completedQuestionIds))),
        lastOutcome: readLastOutcome(snapshot?.lastOutcome, fallback.lastOutcome),
        complete,
    };
}
export function routeQuizEngine(state, route, config = {
    questions: [],
}) {
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
        stageCount: config.stageCountForQuestion?.(currentQuestion) ?? readStageCount(currentQuestion, 1),
        stagedAnswers: [],
        lastOutcome: 'routed',
        complete: false,
    };
}
export function selectQuizQuestion(state, question, config = {}) {
    return {
        ...state,
        phase: 'question',
        currentQuestionId: question.id,
        currentConcept: question.concept,
        currentQuestion: question,
        stageIndex: 0,
        stageCount: config.stageCountForQuestion?.(question)
            ?? question.stageCount
            ?? config.defaultStageCount
            ?? 1,
        stagedAnswers: [],
        lastOutcome: 'routed',
        complete: false,
    };
}
export function advanceQuizStage(state, answer, options = {}) {
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
export function syncQuizEngineQuestionState(state, options = {}) {
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
export function enterSupportState(state) {
    return {
        ...state,
        phase: 'support',
        supportCount: state.supportCount + 1,
        lastOutcome: 'supported',
    };
}
export function enterRecoveryState(state) {
    return {
        ...state,
        phase: 'recovery',
        recoveryCount: state.recoveryCount + 1,
        lastOutcome: 'recovered',
    };
}
export function completeQuizQuestion(state, completedQuestionId = state.currentQuestionId ?? '') {
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
export function resetQuizEngine(snapshot = {}) {
    return createQuizEngineState({
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
export function reduceQuizEngine(state, action, config = { questions: [] }) {
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
//# sourceMappingURL=quiz-engine.js.map