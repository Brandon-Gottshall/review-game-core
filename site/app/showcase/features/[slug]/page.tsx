import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CodeBlock } from '@/components/code-block'
import { ExamplePanel } from '@/components/example-panel'
import { getFeatureEntries, getFeatureEntry } from '@/lib/content'
import { getExamplePanel } from '@/lib/examples'
import { loadConsumerSnippet, loadRepoSnippet } from '@/lib/snippets'

export function generateStaticParams() {
  return getFeatureEntries().map((feature) => ({ slug: feature.slug }))
}

export default async function FeaturePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let feature
  try {
    feature = getFeatureEntry(slug)
  } catch {
    notFound()
  }

  const primarySnippet = loadRepoSnippet(feature.primarySnippetSource)
  const consumerSnippet = feature.consumerExample ? loadConsumerSnippet(feature.consumerExample.snippetId) : null
  const example = getExamplePanel(feature.slug)

  return (
    <main className="showcase-shell">
      <section className="feature-head">
        <p className="eyebrow">Feature detail</p>
        <h1>{feature.title}</h1>
        <p>{feature.summary}</p>
        <div className="meta-list">
          {feature.modules.map((module) => (
            <span key={module} className="meta-chip">{module}</span>
          ))}
        </div>
      </section>

      <section className="feature-layout">
        <aside className="feature-sidebar">
          <p className="detail-label">When to use it</p>
          <ul>
            {feature.whenToUse.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="link-row">
            <Link href={feature.docsHref} className="primary-link">Read docs</Link>
            <Link href="/showcase/features" className="secondary-link">Back to gallery</Link>
          </div>
        </aside>

        <div className="feature-main">
          <ExamplePanel example={example} />
          <CodeBlock snippet={primarySnippet} />

          {feature.consumerExample && consumerSnippet ? (
            <section className="consumer-example">
              <p className="eyebrow">Consumer example</p>
              <h3>{feature.consumerExample.label}</h3>
              <p>{feature.consumerExample.summary}</p>
              <CodeBlock snippet={consumerSnippet} />
            </section>
          ) : null}
        </div>
      </section>
    </main>
  )
}
