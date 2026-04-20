import { createGraphClient, readGraphConfigFromEnv } from './client.js';
import { Neo4jGraphProjector } from './projector/index.js';
import { Neo4jGraphDomainReader } from './repositories/domain.js';
const readBooleanFlag = (value) => value === '1' || value === 'true';
export function readGraphRuntimeFlags(env = process.env) {
    return {
        enabled: readBooleanFlag(env.GRAPH_ENABLED),
        shadowCompare: readBooleanFlag(env.GRAPH_SHADOW_COMPARE),
        serveDomainReads: readBooleanFlag(env.GRAPH_SERVE_DOMAIN_READS),
        required: readBooleanFlag(env.GRAPH_REQUIRED),
    };
}
export function getOptionalGraphClient(env = process.env) {
    const flags = readGraphRuntimeFlags(env);
    if (!flags.enabled) {
        return null;
    }
    const config = readGraphConfigFromEnv(env);
    if (!config) {
        if (flags.required) {
            throw new Error('GRAPH_REQUIRED is enabled, but Neo4j connection settings are missing.');
        }
        return null;
    }
    return createGraphClient(config);
}
export function getOptionalGraphDomainReader(env = process.env) {
    const client = getOptionalGraphClient(env);
    return client ? new Neo4jGraphDomainReader(client) : null;
}
export function getOptionalGraphProjector(env = process.env) {
    const client = getOptionalGraphClient(env);
    return client ? new Neo4jGraphProjector(client) : null;
}
//# sourceMappingURL=runtime.js.map