import type { GraphClient } from '../client.js';
import { type GraphProjectionEnvelope, type GraphProjectionState, type ProjectionRunMetadata } from '../contracts/index.js';
export interface GraphProjector {
    applyProjection(input: GraphProjectionEnvelope): Promise<ProjectionRunMetadata>;
    clearGameGraph(gameId: string): Promise<void>;
    getGameProjectionState(gameId: string): Promise<GraphProjectionState>;
}
export interface GraphProjectionRepository extends GraphProjector {
}
export interface GraphProjectionReconciler {
    clearGameGraph(gameId: string): Promise<void>;
}
export declare class Neo4jGraphProjector implements GraphProjector, GraphProjectionRepository, GraphProjectionReconciler {
    private readonly client;
    constructor(client: GraphClient);
    applyProjection(input: GraphProjectionEnvelope): Promise<ProjectionRunMetadata>;
    clearGameGraph(gameId: string): Promise<void>;
    getGameProjectionState(gameId: string): Promise<GraphProjectionState>;
}
export declare const createProjectionEnvelopeMetadata: (input: Omit<ProjectionRunMetadata, "status" | "schemaVersion"> & {
    schemaVersion?: number;
}) => ProjectionRunMetadata;
//# sourceMappingURL=index.d.ts.map