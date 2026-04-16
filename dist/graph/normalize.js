import neo4j from 'neo4j-driver';
export const normalizeNeo4jValue = (value) => {
    if (neo4j.isInt(value)) {
        return value.inSafeRange() ? value.toNumber() : value.toString();
    }
    if (Array.isArray(value)) {
        return value.map((entry) => normalizeNeo4jValue(entry));
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    if (value && typeof value === 'object') {
        if ('properties' in value && typeof value.properties === 'object') {
            return normalizeNeo4jValue(value.properties);
        }
        return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, normalizeNeo4jValue(entry)]));
    }
    return value;
};
//# sourceMappingURL=normalize.js.map