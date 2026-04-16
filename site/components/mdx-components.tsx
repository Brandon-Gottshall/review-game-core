import Link from 'next/link'
import type { MDXComponents } from 'mdx/types'

export const mdxComponents: MDXComponents = {
  a: ({ href = '', children, ...props }) => {
    if (href.startsWith('/')) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      )
    }

    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noreferrer' : undefined} {...props}>
        {children}
      </a>
    )
  },
  pre: (props) => <pre className="doc-pre" {...props} />,
  code: (props) => <code className="doc-inline-code" {...props} />,
}
