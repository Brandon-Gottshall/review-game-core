import { describe, expect, it } from 'vitest'

import { consumerSnippets } from '../content/consumer-snippets.generated'
import { getFeatureEntry, listDocPages, renderDocPage } from '../lib/content'
import { getExamplePanel } from '../lib/examples'
import { loadConsumerSnippet, loadRepoSnippet } from '../lib/snippets'

describe('site content', () => {
  it('loads and sorts the docs collection', () => {
    const docs = listDocPages()

    expect(docs.length).toBeGreaterThanOrEqual(8)
    expect(docs.some((page) => page.href === '/docs')).toBe(true)
    expect(docs.some((page) => page.href === '/docs/planning-goals')).toBe(true)
    expect(docs.some((page) => page.href === '/docs/consumer-example-mirroring')).toBe(true)
  })

  it('renders a docs page from mdx', async () => {
    const page = await renderDocPage(['planning-goals'])

    expect(page.frontmatter.title).toBe('Planning / Goal Family')
    expect(page.content).toBeTruthy()
  })

  it('loads real snippets for a feature and its consumer example', () => {
    const feature = getFeatureEntry('planning-goals')
    const snippet = loadRepoSnippet(feature.primarySnippetSource)

    expect(snippet.code).toContain('GoalPlan')
    expect(feature.consumerExample).toBeTruthy()
    expect(loadConsumerSnippet(feature.consumerExample!.snippetId).code).toContain('studyGoalPlan')
  })

  it('keeps mirrored consumer snippets inside repo-local content rather than external file loads', () => {
    expect(consumerSnippets.length).toBeGreaterThanOrEqual(4)
    expect(consumerSnippets.every((snippet) => snippet.originalPath.includes('review-game-core'))).toBe(false)
    expect(consumerSnippets.every((snippet) => snippet.sourceRevision.length >= 10)).toBe(true)

    const planningFeature = getFeatureEntry('planning-goals')
    expect(planningFeature.consumerExample?.snippetId).toBeTruthy()
    expect('filePath' in (planningFeature.consumerExample as object)).toBe(false)
  })

  it('builds worked example data for every feature page', () => {
    const slugs = [
      'planning-goals',
      'scheduler',
      'workflow-core',
      'wf-harness',
      'graph-subsystem',
      'question-generator-primitives',
    ]

    for (const slug of slugs) {
      expect(getExamplePanel(slug).output).toBeTruthy()
    }
  })
})
