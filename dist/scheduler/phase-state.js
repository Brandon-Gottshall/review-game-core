export const PHASE_STATE_ORDER = [
    'not_started',
    'learning',
    'practicing',
    'mastered',
    'shaky',
    'tracked_in_quiz',
];
export const PHASE_STATE_LABELS = {
    not_started: 'Not started',
    learning: 'Learning',
    practicing: 'Practicing',
    mastered: 'Mastered',
    shaky: 'Shaky',
    tracked_in_quiz: 'Tracked in quiz',
};
const TRANSITIONS = {
    not_started: {
        start: 'learning',
        practice: 'learning',
        master: 'mastered',
        struggle: 'shaky',
        track: 'tracked_in_quiz',
        reset: 'not_started',
    },
    learning: {
        start: 'learning',
        practice: 'practicing',
        master: 'mastered',
        struggle: 'shaky',
        track: 'tracked_in_quiz',
        reset: 'not_started',
    },
    practicing: {
        start: 'practicing',
        practice: 'practicing',
        master: 'mastered',
        struggle: 'shaky',
        track: 'tracked_in_quiz',
        reset: 'not_started',
    },
    mastered: {
        start: 'practicing',
        practice: 'practicing',
        master: 'mastered',
        struggle: 'shaky',
        track: 'tracked_in_quiz',
        reset: 'not_started',
    },
    shaky: {
        start: 'learning',
        practice: 'practicing',
        master: 'mastered',
        struggle: 'shaky',
        track: 'tracked_in_quiz',
        reset: 'not_started',
    },
    tracked_in_quiz: {
        start: 'learning',
        practice: 'practicing',
        master: 'mastered',
        struggle: 'shaky',
        track: 'tracked_in_quiz',
        reset: 'not_started',
    },
};
export const nextPhaseState = (current, signal) => (TRANSITIONS[current][signal]);
//# sourceMappingURL=phase-state.js.map