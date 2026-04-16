import type { ZodType } from 'zod'

import type { GraphClient, GraphQueryResultLike, GraphRecordLike, GraphSessionLike } from './client.js'
import { normalizeNeo4jValue } from './normalize.js'

export interface GraphQuery<TParams, TResult> {
  name: string
  cypher: string
  schema: ZodType<TResult>
  params?: (input: TParams) => Record<string, unknown>
  mapRecords?: (records: GraphRecordLike[]) => unknown
}

const defaultMapRecords = (records: GraphRecordLike[]): unknown => (
  records.map((record) => {
    const candidate = record as { keys?: string[] }
    if (Array.isArray(candidate.keys)) {
      return Object.fromEntries(candidate.keys.map((key) => [key, normalizeNeo4jValue(record.get(key))]))
    }

    return normalizeNeo4jValue(record)
  })
)

const runAgainstSession = async <TParams, TResult>(
  session: GraphSessionLike,
  query: GraphQuery<TParams, TResult>,
  input: TParams,
): Promise<TResult> => {
  const raw = await session.executeRead((tx) => tx.run(query.cypher, query.params?.(input) ?? {}))
  const mapped = (query.mapRecords ?? defaultMapRecords)(raw.records)
  return query.schema.parse(mapped)
}

export const runGraphQuery = async <TParams, TResult>(
  client: GraphClient,
  query: GraphQuery<TParams, TResult>,
  input: TParams,
): Promise<TResult> => {
  const session = client.session('READ')
  try {
    return await runAgainstSession(session, query, input)
  } finally {
    await session.close()
  }
}

export const runGraphQueryWithSession = async <TParams, TResult>(
  session: GraphSessionLike,
  query: GraphQuery<TParams, TResult>,
  input: TParams,
): Promise<TResult> => runAgainstSession(session, query, input)

export const compareShadowResult = <T>(primary: T, shadow: T) => ({
  match: JSON.stringify(primary) === JSON.stringify(shadow),
  primary,
  shadow,
})

export const mapSingleColumn = (column: string) => (records: GraphRecordLike[]): unknown => (
  records.map((record) => normalizeNeo4jValue(record.get(column)))
)

export const mapFirstRecord = (result: GraphQueryResultLike): GraphRecordLike | null => (
  result.records[0] ?? null
)

