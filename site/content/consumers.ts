export interface ConsumerEntry {
  slug: 'stats-exam-prep-game' | 'math-1111-review-game'
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
    href: 'https://github.com/Moons-Out/stats-exam-prep-game',
    logo: '/placeholders/consumer-stats.svg',
  },
  {
    slug: 'math-1111-review-game',
    displayName: 'math-1111-review-game',
    tagline: 'Section-native study briefs and catch-up pacing for college algebra.',
    href: 'https://github.com/Moons-Out/math-1111-review-game',
    logo: '/placeholders/consumer-math1111.svg',
  },
]
