import Link from 'next/link'

import { getFeatureEntries, getShowcaseExamples } from '@/lib/content'

export default function ShowcasePage() {
  const features = getFeatureEntries()
  const examples = getShowcaseExamples()

  return (
    <main className="showcase-shell">
      <section className="showcase-head">
        <p className="eyebrow">General showcase</p>
        <h1>Real patterns from the core and the two strongest consumers.</h1>
        <p>
          The showcase pages are grounded in actual `review-game-core`, `stats-exam-prep-game`, and
          `math-1111-review-game` code paths. They are not synthetic demos.
        </p>
        <div className="hero-actions">
          <Link href="/showcase/features" className="primary-link">Feature gallery</Link>
          <Link href="/docs" className="secondary-link">Documentation base</Link>
        </div>
      </section>

      <section className="strip-panel">
        <p className="eyebrow">Examples</p>
        <div className="showcase-examples">
          {examples.map((example) => (
            <article key={example.slug} className="showcase-example">
              <p className="detail-label">{example.consumer}</p>
              <h3>{example.title}</h3>
              <p>{example.summary}</p>
              <p><strong>Outcome:</strong> {example.outcome}</p>
              <div className="module-tags">
                {example.modulesUsed.map((module) => (
                  <span key={module} className="tag">{module}</span>
                ))}
              </div>
              {example.sourceLinks?.length ? (
                <div className="meta-list">
                  {example.sourceLinks.map((source) => (
                    <span key={source.consumerSnippetId ?? source.path ?? source.label} className="meta-chip">{source.label}</span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="strip-panel">
        <div className="link-row">
          <div>
            <p className="eyebrow">Feature index</p>
            <h2>Drill into the core module that powers each pattern.</h2>
          </div>
          <Link href="/showcase/features" className="secondary-link">Open feature gallery</Link>
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
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
