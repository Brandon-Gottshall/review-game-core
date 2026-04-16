import neo4j, { auth, } from 'neo4j-driver';
export const createGraphClient = (config) => {
    const driver = neo4j.driver(config.uri, auth.basic(config.user, config.password));
    return createGraphClientFromDriver(driver, config.database);
};
export const createGraphClientFromDriver = (driver, database) => ({
    database,
    session(mode = 'READ') {
        const rawSession = driver.session({
            database,
            defaultAccessMode: mode === 'READ' ? neo4j.session.READ : neo4j.session.WRITE,
        });
        return wrapNeo4jSession(rawSession);
    },
    close: async () => {
        await driver.close();
    },
});
const wrapNeo4jResult = (result) => ({
    records: result.records,
});
const wrapNeo4jTransaction = (tx) => ({
    run: async (cypher, params = {}) => wrapNeo4jResult(await tx.run(cypher, params)),
});
const wrapNeo4jSession = (session) => ({
    executeRead: async (work) => (session.executeRead((tx) => work(wrapNeo4jTransaction(tx)))),
    executeWrite: async (work) => (session.executeWrite((tx) => work(wrapNeo4jTransaction(tx)))),
    close: async () => {
        await session.close();
    },
});
export const isGraphAvailable = async (client) => {
    const session = client.session('READ');
    try {
        await session.executeRead((tx) => tx.run('RETURN 1 AS ready'));
        return true;
    }
    catch {
        return false;
    }
    finally {
        await session.close();
    }
};
export const readGraphConfigFromEnv = (env = process.env) => {
    const uri = env.NEO4J_URI?.trim();
    const user = env.NEO4J_USER?.trim();
    const password = env.NEO4J_PASSWORD?.trim();
    const database = env.NEO4J_DATABASE?.trim() || undefined;
    if (!uri || !user || !password)
        return null;
    return {
        uri,
        user,
        password,
        database,
    };
};
//# sourceMappingURL=client.js.map