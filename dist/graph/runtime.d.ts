import { type GraphClient } from './client.js';
import { Neo4jGraphProjector } from './projector/index.js';
import { Neo4jGraphDomainReader } from './repositories/domain.js';
export interface GraphRuntimeFlags {
    enabled: boolean;
    shadowCompare: boolean;
    serveDomainReads: boolean;
    required: boolean;
}
export declare function readGraphRuntimeFlags(env?: NodeJS.ProcessEnv): GraphRuntimeFlags;
export declare function getOptionalGraphClient(env?: NodeJS.ProcessEnv): GraphClient | null;
export declare function getOptionalGraphDomainReader(env?: NodeJS.ProcessEnv): Neo4jGraphDomainReader | null;
export declare function getOptionalGraphProjector(env?: NodeJS.ProcessEnv): Neo4jGraphProjector | null;
//# sourceMappingURL=runtime.d.ts.map