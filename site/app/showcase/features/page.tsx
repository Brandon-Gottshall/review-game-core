import Link from 'next/link'

import { getFeatureEntries } from '@/lib/content'

export default function FeaturesIndexPage() {
  const features = getFeatureEntries()

  return (
    <main className="showcase-shell">
      <section className="showcase-head">
        <p className="eyebrow">Feature showcase</p>
        <h1>Each major surface of the core, documented with real examples.</h1>
        <p>
          Feature pages combine a real source excerpt, a worked example, and a consumer pattern showing how the
          core is meant to be used rather than merely imported.
        </p>
      </section>

      <section className="feature-grid">
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
              <Link href={`/showcase/features/${feature.slug}`} className="primary-link">Open feature</Link>
              <Link href={feature.docsHref} className="secondary-link">Related docs</Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
