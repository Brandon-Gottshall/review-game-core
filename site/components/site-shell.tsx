'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { ThemeToggle } from '@/components/theme-toggle'

const navItems = [
  { href: '/', label: 'Home', exact: true },
  { href: '/showcase/features', label: 'Features', exact: false },
  { href: '/docs', label: 'Docs', exact: false },
  { href: 'https://github.com/Brandon-Gottshall/review-game-core', label: 'GitHub ↗', exact: false },
]

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="site-frame">
      <header className="topbar">
        <Link href="/" className="brand">
          <span className="brand-mark">RG</span>
          <span className="brand-copy">
            <strong>review-game-core</strong>
            <small>the engine behind concept-first review games</small>
          </span>
        </Link>

        <nav className="topnav" aria-label="Primary">
          {navItems.map((item) =>
            item.href.startsWith('http') ? (
              <a key={item.href} href={item.href} target="_blank" rel="noreferrer">
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                aria-current={
                  item.exact ? pathname === item.href : pathname.startsWith(item.href)
                    ? 'page'
                    : undefined
                }
              >
                {item.label}
              </Link>
            )
          )}
          <ThemeToggle />
        </nav>
      </header>

      {children}
    </div>
  )
}
