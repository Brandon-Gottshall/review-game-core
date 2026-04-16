import Link from 'next/link'

import { getFeatureEntries, getShowcaseExamples, listDocPages } from '@/lib/content'

const moduleOverview = [
  {
    title: 'Planning kernel',
    summary: 'Plans, phases, snapshots, and recommendation roles turn progress into a next-track decision without dragging in learner DB or UI concerns.',
    tags: ['goal', 'deadlines', 'track priority'],
  },
  {
    title: 'Runtime shell contracts',
    summary: 'Workflow helpers keep session identity, persistence, restore, and deterministic debug routes stable across consumer apps.',
    tags: ['workflow/session', 'workflow/debug', 'quiz-engine'],
  },
  {
    title: 'Validation and projection',
    summary: 'WF harness validators and Neo4j projection contracts let apps prove structure fast, then expose richer learning graphs outside the runtime shell.',
    tags: ['wf-harness', 'graph/contracts', 'graph/projector'],
  },
]

export default function HomePage() {
  const features = getFeatureEntries()
  const examples = getShowcaseExamples()
  const docs = listDocPages().slice(0, 4)

  return (
    <main className="page-shell">
      <section className="hero">
        <article className="hero-panel">
          <div>
            <p className="eyebrow">Shared core for concept-first review games</p>
            <h1>Docs-grade primitives for adaptive learning products.</h1>
            <p>
              `review-game-core` holds the shared contracts behind scheduling, staged workflow, planning,
              WF validation, and graph projection across the review-game repos.
            </p>
          </div>

          <div className="hero-actions">
            <Link href="/docs" className="primary-link">Read the docs</Link>
            <Link href="/showcase/features" className="secondary-link">Browse the feature gallery</Link>
          </div>
        </article>

        <div className="hero-grid">
          <article className="spotlight-panel">
            <p className="eyebrow">What the core enables</p>
            <strong>Stats uses it for exam-track planning and mastery-map launching.</strong>
            <p>
              The stats app adapts concept evidence into an exam recommendation while keeping grade math,
              learner bootstrap, and launcher copy local.
            </p>
          </article>

          <article className="spotlight-panel">
            <p className="eyebrow">Why the site exists</p>
            <strong>One place for the package story, feature examples, and canonical docs.</strong>
            <p>
              This site keeps the public package framing, consumer examples, and internal migration notes in
              one Vercel-ready project attached directly to the core repo.
            </p>
          </article>
        </div>
      </section>

      <section>
        <div className="strip-panel">
          <p className="eyebrow">How the pieces fit together</p>
          <div className="module-grid">
            {moduleOverview.map((module) => (
              <article key={module.title}>
                <h3>{module.title}</h3>
                <p>{module.summary}</p>
                <div className="module-tags">
                  {module.tags.map((tag) => (
                    <span key={tag} className="module-pill">{tag}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="strip-panel">
          <div className="link-row">
            <div>
              <p className="eyebrow">General showcase</p>
              <h2>Concrete examples from the real consumers</h2>
            </div>
            <Link href="/showcase" className="secondary-link">Open the showcase</Link>
          </div>
          <div className="showcase-examples">
            {examples.map((example) => (
              <article key={example.slug} className="showcase-example">
                <p className="detail-label">{example.consumer}</p>
                <h3>{example.title}</h3>
                <p>{example.summary}</p>
                <div className="meta-list">
                  {example.modulesUsed.map((module) => (
                    <span key={module} className="meta-chip">{module}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="strip-panel">
          <div className="link-row">
            <div>
              <p className="eyebrow">Feature showcase</p>
              <h2>Every major module gets an example page.</h2>
            </div>
            <Link href="/showcase/features" className="secondary-link">See all features</Link>
          </div>
          <div className="feature-grid">
            {features.map((feature) => (
              <article key={feature.slug} className="feature-card">
                <p className="detail-label">{feature.exampleKind}</p>
                <h3>{feature.title}</h3>
                <p>{feature.summary}</p>
                <div className="module-tags">
                  {feature.modules.map((module) => (
                    <span key={module} className="tag">{module}</span>
                  ))}
                </div>
                <div className="link-row">
                  <Link href={`/showcase/features/${feature.slug}`} className="secondary-link">Open feature</Link>
                  <Link href={feature.docsHref} className="secondary-link">Read docs</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="strip-panel">
          <div className="link-row">
            <div>
              <p className="eyebrow">Docs base</p>
              <h2>Canonical package docs, migration notes, and quick-start paths.</h2>
            </div>
            <Link href="/docs" className="primary-link">Go to docs</Link>
          </div>
          <div className="showcase-examples">
            {docs.map((page) => (
              <article key={page.href} className="showcase-example">
                <p className="detail-label">{page.frontmatter.section}</p>
                <h3>{page.frontmatter.title}</h3>
                <p>{page.frontmatter.description}</p>
                <Link href={page.href} className="secondary-link">Open page</Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
