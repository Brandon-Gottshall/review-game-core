import neo4j from 'neo4j-driver'

export const normalizeNeo4jValue = (value: unknown): unknown => {
  if (neo4j.isInt(value)) {
    return value.inSafeRange() ? value.toNumber() : value.toString()
  }

  if (Array.isArray(value)) {
    return value.map((entry) => normalizeNeo4jValue(entry))
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (value && typeof value === 'object') {
    if ('properties' in value && typeof (value as { properties?: unknown }).properties === 'object') {
      return normalizeNeo4jValue((value as { properties: unknown }).properties)
    }

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [key, normalizeNeo4jValue(entry)])
    )
  }

  return value
}

