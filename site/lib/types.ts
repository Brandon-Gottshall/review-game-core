export type DocFrontmatter = {
  title: string
  description: string
  section: string
  order: number
  apiSurface?: string
  relatedFeatures?: string[]
}

export type LoadedDocPage = {
  slug: string[]
  href: string
  body: string
  frontmatter: DocFrontmatter
}

export type ShowcaseExample = {
  slug: string
  title: string
  summary: string
  consumer: 'core' | 'stats-exam-prep-game' | 'math-1111-review-game'
  modulesUsed: string[]
  outcome: string
  sourceLinks?: Array<{
    label: string
    path?: string
    consumerSnippetId?: string
  }>
}

export type RepoSnippetSource = {
  filePath: string
  language: string
  title: string
  start: string
  end?: string
}

export type ConsumerSnippetRecord = {
  id: string
  repo: 'stats-exam-prep-game' | 'math-1111-review-game'
  originalPath: string
  sourceRevision: string
  title: string
  summary: string
  language: string
  code: string
}

export type FeatureShowcaseEntry = {
  slug: string
  title: string
  summary: string
  modules: string[]
  exampleKind: 'state-machine' | 'code-snippet' | 'consumer-flow'
  primarySnippetSource: RepoSnippetSource
  docsHref: string
  whenToUse: string[]
  consumerExample?: {
    repo: 'stats-exam-prep-game' | 'math-1111-review-game'
    label: string
    summary: string
    snippetId: string
  }
}

export type ExamplePanelData = {
  label: string
  description: string
  input: unknown
  output: unknown
}
