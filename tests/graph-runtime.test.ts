import { describe, expect, it } from 'vitest';

import {
  getOptionalGraphClient,
  getOptionalGraphDomainReader,
  getOptionalGraphProjector,
  readGraphRuntimeFlags,
} from '../src/graph/runtime.js';

describe('graph/runtime', () => {
  it('reads graph runtime flags from env', () => {
    expect(readGraphRuntimeFlags({
      GRAPH_ENABLED: 'true',
      GRAPH_SHADOW_COMPARE: '1',
      GRAPH_SERVE_DOMAIN_READS: 'false',
      GRAPH_REQUIRED: 'true',
    })).toEqual({
      enabled: true,
      shadowCompare: true,
      serveDomainReads: false,
      required: true,
    });
  });

  it('returns null helpers when graph is disabled', () => {
    expect(getOptionalGraphClient({ GRAPH_ENABLED: 'false' })).toBeNull();
    expect(getOptionalGraphDomainReader({ GRAPH_ENABLED: 'false' })).toBeNull();
    expect(getOptionalGraphProjector({ GRAPH_ENABLED: 'false' })).toBeNull();
  });

  it('throws when graph is required but config is missing', () => {
    expect(() => getOptionalGraphClient({
      GRAPH_ENABLED: 'true',
      GRAPH_REQUIRED: 'true',
    })).toThrow(/GRAPH_REQUIRED/);
  });
});
