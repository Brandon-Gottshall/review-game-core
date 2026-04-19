export type PhaseState =
  | 'not_started'
  | 'learning'
  | 'practicing'
  | 'mastered'
  | 'shaky'
  | 'tracked_in_quiz'

export type PhaseSignal =
  | 'start'
  | 'practice'
  | 'master'
  | 'struggle'
  | 'track'
  | 'reset'

export const PHASE_STATE_ORDER: PhaseState[] = [
  'not_started',
  'learning',
  'practicing',
  'mastered',
  'shaky',
  'tracked_in_quiz',
]

export const PHASE_STATE_LABELS: Record<PhaseState, string> = {
  not_started: 'Not started',
  learning: 'Learning',
  practicing: 'Practicing',
  mastered: 'Mastered',
  shaky: 'Shaky',
  tracked_in_quiz: 'Tracked in quiz',
}

const TRANSITIONS: Record<PhaseState, Record<PhaseSignal, PhaseState>> = {
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
}

export const nextPhaseState = (current: PhaseState, signal: PhaseSignal): PhaseState => (
  TRANSITIONS[current][signal]
)
