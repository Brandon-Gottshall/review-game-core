export type GameFraming = {
  course: string
  subject?: string
}

export type GameMetadata = {
  title: string
  description: string
  icons: {
    icon: string
  }
}

export const buildGameMetadata = ({ course, subject }: GameFraming): GameMetadata => {
  const courseLabel = `${course}${subject ? ` ${subject}` : ''}`.trim()

  return {
    title: `${courseLabel} — Concept Mastery`,
    description: `Guided concept mastery for ${courseLabel} — learn, prove, and retain every topic.`,
    icons: {
      icon: '/icon.svg',
    },
  }
}
