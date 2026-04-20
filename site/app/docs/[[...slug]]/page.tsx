import { notFound } from 'next/navigation'

import { DocsSidebar } from '@/components/docs-sidebar'
import { getDocPage, listDocPages, renderDocPage } from '@/lib/content'

export function generateStaticParams() {
  return listDocPages().map((page) => ({
    slug: page.slug,
  }))
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const resolvedParams = await params
  const slug = resolvedParams.slug ?? []

  try {
    getDocPage(slug)
  } catch {
    notFound()
  }

  const page = await renderDocPage(slug)
  const allPages = listDocPages()

  return (
    <main className="docs-shell">
      <section className="docs-layout">
        <article className="docs-article">
          <p className="eyebrow">{page.frontmatter.section}</p>
          <h1>{page.frontmatter.title}</h1>
          <p>{page.frontmatter.description}</p>
          <p className="route-hint">Route: {page.href}</p>
          {page.content}
        </article>

        <DocsSidebar pages={allPages} currentHref={page.href} />
      </section>
    </main>
  )
}
