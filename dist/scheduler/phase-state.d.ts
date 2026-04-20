export type PhaseState = 'not_started' | 'learning' | 'practicing' | 'mastered' | 'shaky' | 'tracked_in_quiz';
export type PhaseSignal = 'start' | 'practice' | 'master' | 'struggle' | 'track' | 'reset';
export declare const PHASE_STATE_ORDER: PhaseState[];
export declare const PHASE_STATE_LABELS: Record<PhaseState, string>;
export declare const nextPhaseState: (current: PhaseState, signal: PhaseSignal) => PhaseState;
//# sourceMappingURL=phase-state.d.ts.map