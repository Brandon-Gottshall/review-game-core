import type { ZodType } from 'zod';
import type { GraphClient, GraphQueryResultLike, GraphRecordLike, GraphSessionLike } from './client.js';
export interface GraphQuery<TParams, TResult> {
    name: string;
    cypher: string;
    schema: ZodType<TResult>;
    params?: (input: TParams) => Record<string, unknown>;
    mapRecords?: (records: GraphRecordLike[]) => unknown;
}
export declare const runGraphQuery: <TParams, TResult>(client: GraphClient, query: GraphQuery<TParams, TResult>, input: TParams) => Promise<TResult>;
export declare const runGraphQueryWithSession: <TParams, TResult>(session: GraphSessionLike, query: GraphQuery<TParams, TResult>, input: TParams) => Promise<TResult>;
export declare const compareShadowResult: <T>(primary: T, shadow: T) => {
    match: boolean;
    primary: T;
    shadow: T;
};
export declare const mapSingleColumn: (column: string) => (records: GraphRecordLike[]) => unknown;
export declare const mapFirstRecord: (result: GraphQueryResultLike) => GraphRecordLike | null;
//# sourceMappingURL=query.d.ts.map