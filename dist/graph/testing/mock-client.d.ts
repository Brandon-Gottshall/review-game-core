import type { GraphClient, GraphQueryResultLike } from '../client.js';
type Resolver = (cypher: string, params: Record<string, unknown>) => Promise<GraphQueryResultLike>;
export declare const createMockGraphClient: (resolver: Resolver) => GraphClient;
export {};
//# sourceMappingURL=mock-client.d.ts.map