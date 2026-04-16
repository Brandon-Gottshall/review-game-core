import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const repoRoot = path.resolve(import.meta.dirname, '..')
const workspaceRoot = path.resolve(repoRoot, '..')
const outputPath = path.join(repoRoot, 'site', 'content', 'consumer-snippets.generated.ts')

const definitions = [
  {
    id: 'stats-study-goal-plan',
    repo: 'stats-exam-prep-game',
    relativePath: 'lib/study-goal.ts',
    title: 'Stats study-goal adapter',
    summary: 'Stats converts concept snapshots into phase snapshots and keeps grade math plus launcher copy local.',
    language: 'ts',
    start: "export const studyGoalPlan: GoalPlan<ExamId> = {",
    end: 'const getPhaseProgressLabel = (',
  },
  {
    id: 'stats-launcher-home',
    repo: 'stats-exam-prep-game',
    relativePath: 'app/page.tsx',
    title: 'Stats mastery-map launcher',
    summary: 'The launcher binds the active exam, goal recommendation, and goal coach widget without pushing those semantics down into the core package.',
    language: 'tsx',
    start: "const [activeExam, setActiveExam] = useState<ExamId>(workflow.activeExam ?? 'exam3')",
    end: 'export default function HomePage() {',
  },
  {
    id: 'math1111-study-goal-dashboard',
    repo: 'math-1111-review-game',
    relativePath: 'lib/study-goal.ts',
    title: 'Math1111 study-goal dashboard',
    summary: 'Math1111 adapts section progress into a unit recommendation while preserving its own course policy and learner-profile rules.',
    language: 'ts',
    start: 'const buildResolvedStudyGoalPlan = (profile: LearnerProfile): GoalPlan<CourseUnitId> => ({',
    end: 'const getPhaseDeadlineLabel = (phase: GoalPhaseState<CourseUnitId>): string | null => {',
  },
  {
    id: 'math1111-home-launcher',
    repo: 'math-1111-review-game',
    relativePath: 'app/page.tsx',
    title: 'Math1111 course launcher',
    summary: 'The home page keeps learner identity, study-source context, and unit launching in the app shell while reading recommendation state from the core-driven dashboard.',
    language: 'tsx',
    start: 'const learnerProfile = getLearnerProfile(savedLearnerId)',
    end: 'const saveEmailProgress = () => {',
  },
]

const trimBlock = (value) => {
  const normalized = value.replace(/\r\n/g, '\n').trimEnd()
  const lines = normalized.split('\n')
  const nonEmpty = lines.filter((line) => line.trim().length > 0)
  const indent = nonEmpty.length === 0
    ? 0
    : Math.min(...nonEmpty.map((line) => line.match(/^ */)?.[0].length ?? 0))

  return lines.map((line) => line.slice(indent)).join('\n').trim()
}

const extractBlock = (filePath, start, end) => {
  const raw = fs.readFileSync(filePath, 'utf8')
  const startIndex = raw.indexOf(start)
  if (startIndex < 0) {
    throw new Error(`Start marker not found in ${filePath}`)
  }

  const endIndex = raw.indexOf(end, startIndex + start.length)
  if (endIndex < 0) {
    throw new Error(`End marker not found in ${filePath}`)
  }

  return trimBlock(raw.slice(startIndex, endIndex))
}

const getSourceRevision = (repoDir) => execFileSync('git', ['-C', repoDir, 'rev-parse', 'HEAD'], {
  cwd: workspaceRoot,
  encoding: 'utf8',
}).trim()

const records = definitions.map((definition) => {
  const repoDir = path.join(workspaceRoot, definition.repo)
  const absolutePath = path.join(repoDir, definition.relativePath)

  return {
    id: definition.id,
    repo: definition.repo,
    originalPath: `${definition.repo}/${definition.relativePath}`,
    sourceRevision: getSourceRevision(repoDir),
    title: definition.title,
    summary: definition.summary,
    language: definition.language,
    code: extractBlock(absolutePath, definition.start, definition.end),
  }
})

const rendered = `import type { ConsumerSnippetRecord } from '@/lib/types'

export const consumerSnippets: ConsumerSnippetRecord[] = ${JSON.stringify(records, null, 2)}\n`

fs.writeFileSync(outputPath, rendered)
console.log(`Wrote ${records.length} mirrored consumer snippets to ${outputPath}`)
