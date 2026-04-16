import Link from 'next/link'

import type { LoadedDocPage } from '@/lib/types'

export function DocsSidebar({
  pages,
  currentHref,
}: {
  pages: LoadedDocPage[]
  currentHref: string
}) {
  const grouped = pages.reduce<Record<string, LoadedDocPage[]>>((acc, page) => {
    acc[page.frontmatter.section] ??= []
    acc[page.frontmatter.section]!.push(page)
    return acc
  }, {})

  return (
    <aside className="docs-sidebar" aria-label="Documentation sections">
      {Object.entries(grouped).map(([section, sectionPages]) => (
        <div key={section} className="docs-sidebar-group">
          <p className="detail-label">{section}</p>
          {sectionPages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className={page.href === currentHref ? 'docs-link docs-link-active' : 'docs-link'}
            >
              <span>{page.frontmatter.title}</span>
              <small>{page.frontmatter.description}</small>
            </Link>
          ))}
        </div>
      ))}
    </aside>
  )
}
