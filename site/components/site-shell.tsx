import Link from 'next/link'
import type { ReactNode } from 'react'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/showcase/features', label: 'Features' },
  { href: '/docs', label: 'Docs' },
  { href: 'https://github.com/Brandon-Gottshall/review-game-core', label: 'GitHub' },
]

export function SiteShell({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="site-frame">
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brand-mark">RG</span>
          <span className="brand-copy">
            <strong>review-game-core</strong>
            <small>showcase, feature gallery, and docs</small>
          </span>
        </Link>

        <nav className="topnav" aria-label="Primary">
          {navItems.map((item) => (
            item.href.startsWith('http') ? (
              <a key={item.href} href={item.href} target="_blank" rel="noreferrer">
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            )
          ))}
        </nav>
      </header>

      {children}
    </div>
  )
}
