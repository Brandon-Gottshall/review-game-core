export interface ConsumerEntry {
  slug:
    | 'stats-exam-prep-game'
    | 'math-1111-review-game'
    | 'astr-unit-1-review-game'
    | 'cs-unit-1-review-game'
  displayName: string
  tagline: string
  href: string
  logo: string
}

export const consumers: ConsumerEntry[] = [
  {
    slug: 'stats-exam-prep-game',
    displayName: 'stats-exam-prep-game',
    tagline: 'Exam-track planning and mastery-map launching for AP Statistics.',
    href: 'https://github.com/Project-Fleet/stats-exam-prep-game',
    logo: '/placeholders/consumer-stats.svg',
  },
  {
    slug: 'math-1111-review-game',
    displayName: 'math-1111-review-game',
    tagline: 'Section-native study briefs and catch-up pacing for college algebra.',
    href: 'https://github.com/Project-Fleet/math-1111-review-game',
    logo: '/placeholders/consumer-math1111.svg',
  },
  {
    slug: 'astr-unit-1-review-game',
    displayName: 'astr-unit-1-review-game',
    tagline: 'Unit-one review and spaced return for ASTR 1020K Astronomy.',
    href: 'https://github.com/Brandon-Gottshall/astr-unit-1-review-game',
    logo: '/placeholders/consumer-astr.svg',
  },
  {
    slug: 'cs-unit-1-review-game',
    displayName: 'cs-unit-1-review-game',
    tagline: 'Unit-one review and concept mastery for CS 1301 Intro to Java.',
    href: 'https://github.com/Brandon-Gottshall/cs-unit-1-review-game',
    logo: '/placeholders/consumer-cs.svg',
  },
]
