import 'server-only'

import fs from 'node:fs'
import path from 'node:path'

import matter from 'gray-matter'
import { compileMDX } from 'next-mdx-remote/rsc'
import { cache } from 'react'
import remarkGfm from 'remark-gfm'
import { z } from 'zod'

import { featureEntries } from '@/content/showcase/features'
import { showcaseExamples } from '@/content/showcase/examples'
import { mdxComponents } from '@/components/mdx-components'
import type { DocFrontmatter, LoadedDocPage } from '@/lib/types'

const docsDir = path.join(process.cwd(), 'content', 'docs')

const frontmatterSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  section: z.string().trim().min(1),
  order: z.number().int().nonnegative(),
  apiSurface: z.string().trim().min(1).optional(),
  relatedFeatures: z.array(z.string().trim().min(1)).optional(),
})

const readDocFiles = (): string[] => {
  const entries = fs.readdirSync(docsDir, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.mdx'))
    .map((entry) => path.join(docsDir, entry.name))
}

const slugForDocFile = (filePath: string): string[] => {
  const name = path.basename(filePath, '.mdx')
  return name === 'index' ? [] : [name]
}

const hrefForSlug = (slug: string[]): string => (
  slug.length === 0 ? '/docs' : `/docs/${slug.join('/')}`
)

const loadDocPageInternal = (slug: string[]): LoadedDocPage => {
  const normalizedSlug = slug.length === 0 ? 'index' : slug.join('/')
  const filePath = path.join(docsDir, `${normalizedSlug}.mdx`)

  if (!fs.existsSync(filePath)) {
    throw new Error(`Unknown docs page: ${normalizedSlug}`)
  }

  const raw = fs.readFileSync(filePath, 'utf8')
  const parsed = matter(raw)
  const frontmatter = frontmatterSchema.parse(parsed.data) satisfies DocFrontmatter

  return {
    slug,
    href: hrefForSlug(slug),
    body: parsed.content,
    frontmatter,
  }
}

export const listDocPages = cache((): LoadedDocPage[] => readDocFiles()
  .map((filePath) => loadDocPageInternal(slugForDocFile(filePath)))
  .sort((left, right) => {
    if (left.frontmatter.section !== right.frontmatter.section) {
      return left.frontmatter.section.localeCompare(right.frontmatter.section)
    }
    if (left.frontmatter.order !== right.frontmatter.order) {
      return left.frontmatter.order - right.frontmatter.order
    }
    return left.frontmatter.title.localeCompare(right.frontmatter.title)
  }))

export const getDocPage = cache((slug: string[]): LoadedDocPage => loadDocPageInternal(slug))

export const renderDocPage = cache(async (slug: string[]) => {
  const page = getDocPage(slug)
  const compiled = await compileMDX({
    source: page.body,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  })

  return {
    ...page,
    content: compiled.content,
  }
})

export const getFeatureEntries = () => featureEntries
export const getFeatureEntry = (slug: string) => {
  const entry = featureEntries.find((feature) => feature.slug === slug)
  if (!entry) {
    throw new Error(`Unknown feature: ${slug}`)
  }
  return entry
}

export const getShowcaseExamples = () => showcaseExamples
