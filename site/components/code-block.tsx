import type { LoadedSnippet } from '@/lib/snippets'

export function CodeBlock({ snippet }: { snippet: LoadedSnippet }) {
  return (
    <section className="code-card">
      <div className="code-card-header">
        <div>
          <p className="eyebrow">Real source excerpt</p>
          <h3>{snippet.title}</h3>
        </div>
        <span className="code-source">{snippet.sourceLabel}</span>
      </div>
      <pre>
        <code>{snippet.code}</code>
      </pre>
    </section>
  )
}
