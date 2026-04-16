import { type Driver } from 'neo4j-driver';
export type GraphAccessMode = 'READ' | 'WRITE';
export interface GraphRecordLike {
    get(key: string): unknown;
}
export interface GraphQueryResultLike {
    records: GraphRecordLike[];
}
export interface GraphTransactionLike {
    run(cypher: string, params?: Record<string, unknown>): Promise<GraphQueryResultLike>;
}
export interface GraphSessionLike {
    executeRead<T>(work: (tx: GraphTransactionLike) => Promise<T>): Promise<T>;
    executeWrite<T>(work: (tx: GraphTransactionLike) => Promise<T>): Promise<T>;
    close(): Promise<void>;
}
export interface GraphClient {
    readonly database?: string;
    session(mode?: GraphAccessMode): GraphSessionLike;
    close(): Promise<void>;
}
export interface GraphClientConfig {
    uri: string;
    user: string;
    password: string;
    database?: string;
}
export declare const createGraphClient: (config: GraphClientConfig) => GraphClient;
export declare const createGraphClientFromDriver: (driver: Driver, database?: string) => GraphClient;
export declare const isGraphAvailable: (client: GraphClient) => Promise<boolean>;
export declare const readGraphConfigFromEnv: (env?: NodeJS.ProcessEnv) => GraphClientConfig | null;
//# sourceMappingURL=client.d.ts.map