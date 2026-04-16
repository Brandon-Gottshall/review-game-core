import Link from 'next/link'

import { ConsumerStrip } from '@/components/consumer-strip'
import { getFeatureEntries, getShowcaseExamples, listDocPages } from '@/lib/content'

const heroSnippet = `import { evaluateGoalPlan } from '@brandon-gottshall/review-game-core'

const evaluation = evaluateGoalPlan(plan, snapshots, {
  localDate: '2026-04-16',
})

const nextTrack = evaluation.trackPriority[0]
// evaluation.activePhase.recommendationRole
//   → 'primary' | 'catch_up' | 'queued' | 'complete'`

const moduleOverview = [
  {
    title: 'Turn engine',
    summary: 'The six-phase quiz engine drives routing, staged answers, support, and recovery. Session and debug helpers keep it persistable across consumer shells.',
    tags: ['workflow/quiz-engine', 'workflow/session', 'workflow/debug'],
  },
  {
    title: 'Concept scheduler',
    summary: 'Concept-level mastery math with independent-gap spacing at 2, 5, and 8 turns. Policy-driven, so consumer apps own eligibility and prerequisite rules.',
    tags: ['scheduler', 'concept', 'mastery'],
  },
  {
    title: 'Goal evaluator and projection',
    summary: 'Phase snapshots and local-date deadlines produce a recommendation role — primary, catch-up, queued, or complete — without pulling in learner DB or UI.',
    tags: ['goal', 'graph/projector', 'graph/contracts'],
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
            <p className="eyebrow">The engine behind concept-first review games</p>
            <h1>Route the learner. Stage the proof. Schedule the return.</h1>
            <p>
              `review-game-core` runs the learning loop. It routes the learner to a concept, stages the
              answer through recognize–structure–prove, opens support or recovery when they stall, and
              spaces the concept after three independent passes.
            </p>
          </div>

          <div className="hero-actions">
            <Link href="/docs" className="primary-link">Read the docs</Link>
            <Link href="/showcase/features" className="secondary-link">Browse the feature gallery</Link>
          </div>
        </article>

        <div className="hero-grid">
          <article className="spotlight-panel">
            <p className="eyebrow">What the engine does</p>
            <strong>Every turn runs through six phases: routing, question, staged-answer, support, recovery, complete.</strong>
            <p>
              Consumer games render their own UI. The core owns the state machine — deciding when the
              learner needs more structure, earns support, triggers recovery, or masters the concept.
            </p>
          </article>

          <article className="hero-code">
            <p className="eyebrow">What the core does</p>
            <pre><code>{heroSnippet}</code></pre>
          </article>
        </div>
      </section>

      <section>
        <div className="strip-panel strip-panel-dark">
          <p className="eyebrow">How the pieces fit together</p>
          <div className="strip-panel-dark-body">
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
            <img
              src="/placeholders/architecture.svg"
              alt="The turn engine drives routing, staged answers, support, and recovery; the concept scheduler spaces concepts after three independent passes; the goal evaluator and projection surface recommendation roles."
              className="architecture-diagram"
              width={420}
              height={240}
            />
          </div>
        </div>
      </section>

      <ConsumerStrip />

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
              <h2>Every module has a live example.</h2>
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
