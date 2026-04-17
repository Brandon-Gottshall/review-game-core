import Link from 'next/link'

import { ConsumerStrip } from '@/components/consumer-strip'
import { getFeatureEntries, getShowcaseExamples, listDocPages } from '@/lib/content'

const heroSnippet = `import { evaluateGoalPlan } from '@brandon-gottshall/review-game-core'

const evaluation = evaluateGoalPlan(plan, snapshots, {
  localDate: '2026-04-16',
})

const nextTrack = evaluation.trackPriority[0]
// Use this to decide which launcher card or study track
// the learner should see first today.`

const moduleOverview = [
  {
    title: 'Turn engine',
    summary: 'State machine for a learner turn. It keeps routing, question state, staged answers, support, recovery, persistence, and debug hooks in one place.',
    tags: ['workflow/quiz-engine', 'workflow/session', 'workflow/debug'],
  },
  {
    title: 'Concept scheduler',
    summary: 'Concept mastery and spaced-return logic. It credits independent solves, waits the configured turn gaps, and tells a consumer app what should come back next.',
    tags: ['scheduler', 'concept', 'mastery'],
  },
  {
    title: 'Goal evaluator and projection',
    summary: 'Launcher and study-plan logic. It reads dated phase snapshots and returns a next-track recommendation such as primary, catch-up, queued, or complete.',
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
            <p className="eyebrow">Shared TypeScript package for review-game apps</p>
            <h1>Build review games without rewriting routing, retries, and spaced review.</h1>
            <p>
              `review-game-core` is the decision layer behind the course apps in this workspace. It
              chooses the next concept, tracks quiz turn state, decides when to open support or
              recovery, schedules spaced return after independent work, and evaluates which study track
              a learner should do next.
            </p>
          </div>

          <div className="hero-actions">
            <Link href="/docs" className="primary-link">Read the docs</Link>
            <Link href="/showcase/features" className="secondary-link">See real examples</Link>
          </div>
        </article>

        <div className="hero-grid">
          <article className="spotlight-panel">
            <p className="eyebrow">What one learner turn includes</p>
            <strong>A learner turn moves through six named states: route, question, staged answer, support, recovery, complete.</strong>
            <p>
              Consumer apps own the UI, content, and data. The core owns the workflow logic so the
              product does not drift into ad hoc quiz behavior.
            </p>
          </article>

          <article className="hero-code">
            <p className="eyebrow">One real API surface</p>
            <pre><code>{heroSnippet}</code></pre>
          </article>
        </div>
      </section>

      <section>
        <div className="strip-panel strip-panel-dark">
          <p className="eyebrow">Module split</p>
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
              alt="The turn engine handles route, question, staged answer, support, recovery, and complete; the concept scheduler chooses when a concept returns; the goal evaluator tells the launcher which track to surface next."
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
              <p className="eyebrow">Real consumers</p>
              <h2>Open the adapters that already ship.</h2>
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
              <h2>Each core module has a worked example.</h2>
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
              <p className="eyebrow">Docs</p>
              <h2>Installation, API surfaces, and migration notes.</h2>
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
