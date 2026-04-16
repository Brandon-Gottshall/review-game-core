import type { ConsumerSnippetRecord } from '@/lib/types'

export const consumerSnippets: ConsumerSnippetRecord[] = [
  {
    id: 'stats-study-goal-plan',
    repo: 'stats-exam-prep-game',
    originalPath: 'stats-exam-prep-game/lib/study-goal.ts',
    sourceRevision: '8b0761a20224fd9107f8556ab4599595bfd006b2',
    title: 'Stats study-goal adapter',
    summary: 'Stats converts concept snapshots into phase snapshots and keeps grade math plus launcher copy local.',
    language: 'ts',
    code: `export const studyGoalPlan: GoalPlan<ExamId> = {
  id: 'a-threshold-exam3-then-final',
  label: 'A-threshold sprint',
  phases: [
    {
      id: 'exam3-clean-sweep',
      label: 'Perfect Exam 3 first',
      trackId: 'exam3',
      description: 'Stay on Exam 3 until every concept has at least one clean independent proof.',
    },
    {
      id: 'final-breadth-sweep',
      label: 'Then hit everything on the Final',
      trackId: 'final',
      description: 'Once Exam 3 is covered cleanly, rotate through every cumulative final section.',
    },
  ],
}

const studyGoalPhaseIds = new Set<StudyGoalPhaseId>(['exam3-clean-sweep', 'final-breadth-sweep'])

const emptyStorageReader: Pick<Storage, 'getItem'> = {
  getItem: (_key: string) => null,
}

const normalizeStudyGoalDeadlineBehavior = (
  deadlineBehavior?: GoalDeadlineBehavior | LegacyGoalDeadlineBehavior
): GoalDeadlineBehavior | undefined => {
  if (deadlineBehavior === 'advance_after_deadline') return deadlineBehavior
  if (deadlineBehavior === 'stay_primary_until_complete') return deadlineBehavior
  if (deadlineBehavior === 'demote_to_catch_up_after_deadline') return 'advance_after_deadline'
  return undefined
}

const readStoredExamProgress = (
  storage: Pick<Storage, 'getItem'>,
  examId: ExamId
): StoredExamProgress => {
  const raw = storage.getItem(\`\${SESSION_STORAGE_PREFIX}:\${examId}\`)
  const conceptIds = getExamConceptIds(examId)

  if (!raw) {
    return {
      conceptProgress: mergeConceptProgress(conceptIds, {}),
      currentTurn: 1,
    }
  }

  try {
    const parsed = JSON.parse(raw) as SessionEnvelopeLike
    return {
      conceptProgress: mergeConceptProgress(conceptIds, parsed.conceptProgress),
      currentTurn: typeof parsed.currentTurn === 'number' && Number.isFinite(parsed.currentTurn)
        ? parsed.currentTurn
        : 1,
    }
  } catch {
    return {
      conceptProgress: mergeConceptProgress(conceptIds, {}),
      currentTurn: 1,
    }
  }
}

const countDueConcepts = (progress: ConceptProgressMap, currentTurn: number): number => Object.values(progress)
  .filter((concept) => concept.nextEligibleTurn <= currentTurn && !concept.mastered)
  .length

export const buildStudyGoalExamSnapshot = (
  examId: ExamId,
  conceptProgress: ConceptProgressMap,
  currentTurn: number
): StudyGoalExamSnapshot => {
  const concepts = Object.values(conceptProgress)

  return {
    examId,
    totalConcepts: concepts.length,
    cleanProofConcepts: concepts.filter((concept) => concept.proofCount > 0).length,
    touchedConcepts: concepts.filter((concept) => (
      concept.attempts > 0
      || concept.proofCount > 0
      || concept.supportedEvidenceCount > 0
      || concept.supplementalExposureCount > 0
    )).length,
    supportedConcepts: concepts.filter((concept) => concept.supportedEvidenceCount > 0 || concept.proofCount > 0).length,
    masteredConcepts: concepts.filter((concept) => concept.mastered).length,
    dueConcepts: countDueConcepts(conceptProgress, currentTurn),
  }
}

const buildPhaseSnapshots = (
  examSnapshots: Record<ExamId, StudyGoalExamSnapshot>
): GoalPhaseSnapshot<ExamId>[] => [
  {
    phaseId: 'exam3-clean-sweep',
    trackId: 'exam3',
    completedUnits: examSnapshots.exam3.cleanProofConcepts,
    totalUnits: examSnapshots.exam3.totalConcepts,
  },
  {
    phaseId: 'final-breadth-sweep',
    trackId: 'final',
    completedUnits: examSnapshots.final.touchedConcepts,
    totalUnits: examSnapshots.final.totalConcepts,
  },
]`,
  },
  {
    id: 'stats-launcher-home',
    repo: 'stats-exam-prep-game',
    originalPath: 'stats-exam-prep-game/app/page.tsx',
    sourceRevision: '8b0761a20224fd9107f8556ab4599595bfd006b2',
    title: 'Stats mastery-map launcher',
    summary: 'The launcher binds the active exam, goal recommendation, and goal coach widget without pushing those semantics down into the core package.',
    language: 'tsx',
    code: `const [activeExam, setActiveExam] = useState<ExamId>(workflow.activeExam ?? 'exam3')
const [learnerGoalProfile, setLearnerGoalProfile] = useState<LearnerBootstrap['studyGoal']>(null)
const [savedLearnerId, setSavedLearnerId] = useState('')
const [learnerEmailInput, setLearnerEmailInput] = useState('')
const [learnerMessage, setLearnerMessage] = useState<string | null>(null)
const [identityOpen, setIdentityOpen] = useState(false)
const [goalOpen, setGoalOpen] = useState(true)
const activePack = examPackSummaries[activeExam]
const previewExam = examOrder[(examOrder.indexOf(activeExam) + 1) % examOrder.length] ?? examOrder[0]

useEffect(() => {
  const nextGoalDashboard = typeof window === 'undefined'
    ? buildStudyGoalDashboard(undefined, {}, { profile: learnerGoalProfile, localDate: goalLocalDate })
    : buildStudyGoalDashboard(window.localStorage, {}, { profile: learnerGoalProfile, localDate: goalLocalDate })
  setGoalDashboard(nextGoalDashboard)
  setGoalDashboardHydrated(true)

  if (!workflow.enabled) return
  if (workflow.activeExam) {
    setActiveExam(workflow.activeExam)
  }
}, [goalLocalDate, learnerGoalProfile, workflow.activeExam, workflow.enabled])

return (
  <main className={styles.page}>
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <p className={styles.kicker}>MATH 1401 statistics reset</p>
        <h1>Mastery-map launcher for every review track</h1>
        <p className={styles.lede}>
          Pick a track, inspect the concept graph, and jump directly into the quiz flow without the old
          hover-card clutter.
        </p>
      </div>
    </section>
  </main>
)`,
  },
  {
    id: 'math1111-study-goal-dashboard',
    repo: 'math-1111-review-game',
    originalPath: 'math-1111-review-game/lib/study-goal.ts',
    sourceRevision: 'ee7a292d1840c7d1d10ea8e1b41e3ebf5f4de16c',
    title: 'Math1111 study-goal dashboard',
    summary: 'Math1111 adapts section progress into a unit recommendation while preserving its own course policy and learner-profile rules.',
    language: 'ts',
    code: `const buildResolvedStudyGoalPlan = (profile: LearnerProfile): GoalPlan<CourseUnitId> => ({
  id: \`study-goals:\${profile.learnerId}\`,
  label: profile.planSummary,
  phases: profile.goals.map((goal): GoalPhaseDefinition<CourseUnitId> => ({
    id: goal.id,
    label: goal.title,
    trackId: getGoalUnitId(goal),
    description: goal.summary,
    deadlineLocalDate: buildDeadlineLocalDate(goal, profile.timezone),
    deadlineBehavior: goal.deadlineBehavior,
    targetCompletedUnits: goal.focusSections.length,
  })),
})

const buildPhaseSnapshots = (
  profile: LearnerProfile,
  progressSummary: LearnerProgressSummary,
): GoalPhaseSnapshot<CourseUnitId>[] => profile.goals.map((goal) => {
  const progress = countGoalProgress(goal, progressSummary)

  return {
    phaseId: goal.id,
    trackId: getGoalUnitId(goal),
    completedUnits: progress.completedSections,
    totalUnits: progress.totalSections,
  }
})

export const buildStudyGoalDashboard = (
  profile: LearnerProfile | null,
  progressSummary: LearnerProgressSummary,
  now = new Date(),
): StudyGoalDashboard | null => {
  if (!profile || profile.goals.length === 0) return null

  const resolvedPlan = buildResolvedStudyGoalPlan(profile)
  const evaluation = evaluateGoalPlan(
    resolvedPlan,
    buildPhaseSnapshots(profile, progressSummary),
    buildGoalEvaluationContext(profile, now),
  )

  return {
    label: evaluation.plan.label,
    recommendedUnitId: resolvedPlan.phases[0]?.trackId ?? 'n1',
    recommendedPhase: phases.find((phase) => phase.isRecommended) ?? phases[0],
    phases,
  }
}`,
  },
  {
    id: 'math1111-home-launcher',
    repo: 'math-1111-review-game',
    originalPath: 'math-1111-review-game/app/page.tsx',
    sourceRevision: 'ee7a292d1840c7d1d10ea8e1b41e3ebf5f4de16c',
    title: 'Math1111 course launcher',
    summary: 'The home page keeps learner identity, study-source context, and unit launching in the app shell while reading recommendation state from the core-driven dashboard.',
    language: 'tsx',
    code: `const learnerProfile = getLearnerProfile(savedLearnerId)
const goalDashboard = useMemo(
  () => buildStudyGoalDashboard(learnerProfile, progressSummary, goalNow ?? new Date()),
  [goalNow, learnerProfile, progressSummary],
)

useEffect(() => {
  if (!goalDashboard) return
  setActiveUnitId(goalDashboard.recommendedUnitId)
}, [goalDashboard?.recommendedUnitId, savedLearnerId])

const launchUnitFromGoal = (unitId: CourseUnitId) => {
  const binding = getPrototypeBindingForUnit(unitId)
  setActiveUnitId(unitId)
  launchQuiz(binding.examId, binding.firstSectionId)
}

return (
  <main className="shell">
    <p className="pill">MATH 1111 • Concept Mastery</p>
    <h1>Learn every concept. Prove you own it.</h1>
    <p className="muted">
      Each unit walks you through concepts in schedule order — recognition first, then setup, then independent proof.
      The readiness labels show explanation depth per section.
    </p>
  </main>
)`,
  },
]
