import { createGraphClient, readGraphConfigFromEnv, type GraphClient } from './client.js';
import { Neo4jGraphProjector } from './projector/index.js';
import { Neo4jGraphDomainReader } from './repositories/domain.js';

export interface GraphRuntimeFlags {
  enabled: boolean;
  shadowCompare: boolean;
  serveDomainReads: boolean;
  required: boolean;
}

const readBooleanFlag = (value: string | undefined): boolean => value === '1' || value === 'true';

export function readGraphRuntimeFlags(
  env: NodeJS.ProcessEnv = process.env
): GraphRuntimeFlags {
  return {
    enabled: readBooleanFlag(env.GRAPH_ENABLED),
    shadowCompare: readBooleanFlag(env.GRAPH_SHADOW_COMPARE),
    serveDomainReads: readBooleanFlag(env.GRAPH_SERVE_DOMAIN_READS),
    required: readBooleanFlag(env.GRAPH_REQUIRED),
  };
}

export function getOptionalGraphClient(
  env: NodeJS.ProcessEnv = process.env
): GraphClient | null {
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

export function getOptionalGraphDomainReader(
  env: NodeJS.ProcessEnv = process.env
): Neo4jGraphDomainReader | null {
  const client = getOptionalGraphClient(env);
  return client ? new Neo4jGraphDomainReader(client) : null;
}

export function getOptionalGraphProjector(
  env: NodeJS.ProcessEnv = process.env
): Neo4jGraphProjector | null {
  const client = getOptionalGraphClient(env);
  return client ? new Neo4jGraphProjector(client) : null;
}
