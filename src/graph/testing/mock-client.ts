import type {
  GraphClient,
  GraphQueryResultLike,
  GraphSessionLike,
  GraphTransactionLike,
} from '../client.js'

type Resolver = (cypher: string, params: Record<string, unknown>) => Promise<GraphQueryResultLike>

export const createMockGraphClient = (resolver: Resolver): GraphClient => {
  const transaction: GraphTransactionLike = {
    run: async (cypher, params = {}) => resolver(cypher, params),
  }

  const session: GraphSessionLike = {
    executeRead: async (work) => work(transaction),
    executeWrite: async (work) => work(transaction),
    close: async () => undefined,
  }

  return {
    session: () => session,
    close: async () => undefined,
  }
}

