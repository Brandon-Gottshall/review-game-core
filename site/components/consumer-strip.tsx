import { consumers } from '@/content/consumers'

export function ConsumerStrip() {
  return (
    <section aria-label="Consumer applications">
      <div className="consumer-strip">
        <p className="eyebrow">Built by</p>
        <div className="consumer-strip-row">
          {consumers.map((consumer) => (
            <a
              key={consumer.slug}
              href={consumer.href}
              target="_blank"
              rel="noreferrer"
              className="consumer-card"
            >
              <img
                src={consumer.logo}
                alt=""
                width={40}
                height={40}
                className="consumer-logo"
                aria-hidden="true"
              />
              <span className="consumer-copy">
                <strong>{consumer.displayName}</strong>
                <small>{consumer.tagline}</small>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
