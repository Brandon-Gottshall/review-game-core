import { normalizeNeo4jValue } from './normalize.js';
const defaultMapRecords = (records) => (records.map((record) => {
    const candidate = record;
    if (Array.isArray(candidate.keys)) {
        return Object.fromEntries(candidate.keys.map((key) => [key, normalizeNeo4jValue(record.get(key))]));
    }
    return normalizeNeo4jValue(record);
}));
const runAgainstSession = async (session, query, input) => {
    const raw = await session.executeRead((tx) => tx.run(query.cypher, query.params?.(input) ?? {}));
    const mapped = (query.mapRecords ?? defaultMapRecords)(raw.records);
    return query.schema.parse(mapped);
};
export const runGraphQuery = async (client, query, input) => {
    const session = client.session('READ');
    try {
        return await runAgainstSession(session, query, input);
    }
    finally {
        await session.close();
    }
};
export const runGraphQueryWithSession = async (session, query, input) => runAgainstSession(session, query, input);
export const compareShadowResult = (primary, shadow) => ({
    match: JSON.stringify(primary) === JSON.stringify(shadow),
    primary,
    shadow,
});
export const mapSingleColumn = (column) => (records) => (records.map((record) => normalizeNeo4jValue(record.get(column))));
export const mapFirstRecord = (result) => (result.records[0] ?? null);
//# sourceMappingURL=query.js.map