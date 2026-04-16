import neo4j, {
  auth,
  type Driver,
  type ManagedTransaction,
  type QueryResult,
  type Record as Neo4jRecord,
  type Session,
} from 'neo4j-driver'

export type GraphAccessMode = 'READ' | 'WRITE'

export interface GraphRecordLike {
  get(key: string): unknown
}

export interface GraphQueryResultLike {
  records: GraphRecordLike[]
}

export interface GraphTransactionLike {
  run(cypher: string, params?: Record<string, unknown>): Promise<GraphQueryResultLike>
}

export interface GraphSessionLike {
  executeRead<T>(work: (tx: GraphTransactionLike) => Promise<T>): Promise<T>
  executeWrite<T>(work: (tx: GraphTransactionLike) => Promise<T>): Promise<T>
  close(): Promise<void>
}

export interface GraphClient {
  readonly database?: string
  session(mode?: GraphAccessMode): GraphSessionLike
  close(): Promise<void>
}

export interface GraphClientConfig {
  uri: string
  user: string
  password: string
  database?: string
}

export const createGraphClient = (config: GraphClientConfig): GraphClient => {
  const driver = neo4j.driver(config.uri, auth.basic(config.user, config.password))
  return createGraphClientFromDriver(driver, config.database)
}

export const createGraphClientFromDriver = (
  driver: Driver,
  database?: string
): GraphClient => ({
  database,
  session(mode = 'READ'): GraphSessionLike {
    const rawSession = driver.session({
      database,
      defaultAccessMode: mode === 'READ' ? neo4j.session.READ : neo4j.session.WRITE,
    })
    return wrapNeo4jSession(rawSession)
  },
  close: async () => {
    await driver.close()
  },
})

const wrapNeo4jResult = (result: QueryResult<Neo4jRecord>): GraphQueryResultLike => ({
  records: result.records,
})

const wrapNeo4jTransaction = (tx: ManagedTransaction): GraphTransactionLike => ({
  run: async (cypher, params = {}) => wrapNeo4jResult(await tx.run(cypher, params)),
})

const wrapNeo4jSession = (session: Session): GraphSessionLike => ({
  executeRead: async <T>(work: (tx: GraphTransactionLike) => Promise<T>) => (
    session.executeRead((tx) => work(wrapNeo4jTransaction(tx)))
  ),
  executeWrite: async <T>(work: (tx: GraphTransactionLike) => Promise<T>) => (
    session.executeWrite((tx) => work(wrapNeo4jTransaction(tx)))
  ),
  close: async () => {
    await session.close()
  },
})

export const isGraphAvailable = async (client: GraphClient): Promise<boolean> => {
  const session = client.session('READ')
  try {
    await session.executeRead((tx) => tx.run('RETURN 1 AS ready'))
    return true
  } catch {
    return false
  } finally {
    await session.close()
  }
}

export const readGraphConfigFromEnv = (
  env: NodeJS.ProcessEnv = process.env
): GraphClientConfig | null => {
  const uri = env.NEO4J_URI?.trim()
  const user = env.NEO4J_USER?.trim()
  const password = env.NEO4J_PASSWORD?.trim()
  const database = env.NEO4J_DATABASE?.trim() || undefined

  if (!uri || !user || !password) return null

  return {
    uri,
    user,
    password,
    database,
  }
}
