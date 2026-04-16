import type { ExamplePanelData } from '@/lib/types'

export function ExamplePanel({ example }: { example: ExamplePanelData }) {
  return (
    <section className="example-panel">
      <div className="example-header">
        <div>
          <p className="eyebrow">Worked example</p>
          <h3>{example.label}</h3>
        </div>
        <p>{example.description}</p>
      </div>

      <div className="example-grid">
        <div>
          <p className="detail-label">Input</p>
          <pre>{JSON.stringify(example.input, null, 2)}</pre>
        </div>
        <div>
          <p className="detail-label">Output</p>
          <pre>{JSON.stringify(example.output, null, 2)}</pre>
        </div>
      </div>
    </section>
  )
}
