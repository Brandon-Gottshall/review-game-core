import 'server-only'

import fs from 'node:fs'
import path from 'node:path'

import { consumerSnippets } from '@/content/consumer-snippets.generated'
import type { ConsumerSnippetRecord, RepoSnippetSource } from '@/lib/types'

const repoRoot = path.resolve(process.cwd(), '..')

export type LoadedSnippet = {
  language: string
  title: string
  code: string
  sourceLabel: string
}

const normalizeRepoPath = (value: string): string => value.replace(/\\/g, '/')

const assertRepoLocalPath = (absolutePath: string): void => {
  const normalizedRepoRoot = normalizeRepoPath(`${repoRoot}/`)
  const normalizedTarget = normalizeRepoPath(absolutePath)
  if (!normalizedTarget.startsWith(normalizedRepoRoot)) {
    throw new Error(`Snippet path resolves outside review-game-core: ${absolutePath}`)
  }
}

const trimBlock = (value: string): string => {
  const normalized = value.replace(/\r\n/g, '\n').trimEnd()
  const lines = normalized.split('\n')
  const nonEmpty = lines.filter((line) => line.trim().length > 0)
  const indent = nonEmpty.length === 0
    ? 0
    : Math.min(...nonEmpty.map((line) => line.match(/^ */)?.[0].length ?? 0))

  return lines.map((line) => line.slice(indent)).join('\n').trim()
}

export const loadRepoSnippet = (source: RepoSnippetSource): LoadedSnippet => {
  const absolutePath = path.resolve(repoRoot, source.filePath)
  assertRepoLocalPath(absolutePath)
  const raw = fs.readFileSync(absolutePath, 'utf8')
  const startIndex = raw.indexOf(source.start)

  if (startIndex < 0) {
    throw new Error(`Snippet start marker not found in ${source.filePath}`)
  }

  const endIndex = source.end
    ? raw.indexOf(source.end, startIndex + source.start.length)
    : -1

  if (source.end && endIndex < 0) {
    throw new Error(`Snippet end marker not found in ${source.filePath}`)
  }

  const snippet = endIndex >= 0
    ? raw.slice(startIndex, endIndex)
    : raw.slice(startIndex)

  return {
    language: source.language,
    title: source.title,
    code: trimBlock(snippet),
    sourceLabel: source.filePath,
  }
}

export const getConsumerSnippet = (snippetId: string): ConsumerSnippetRecord => {
  const snippet = consumerSnippets.find((entry) => entry.id === snippetId)
  if (!snippet) {
    throw new Error(`Unknown consumer snippet: ${snippetId}`)
  }
  return snippet
}

export const loadConsumerSnippet = (snippetId: string): LoadedSnippet => {
  const snippet = getConsumerSnippet(snippetId)
  return {
    language: snippet.language,
    title: snippet.title,
    code: snippet.code,
    sourceLabel: `${snippet.originalPath} @ ${snippet.sourceRevision.slice(0, 10)}`,
  }
}
