export const createMockGraphClient = (resolver) => {
    const transaction = {
        run: async (cypher, params = {}) => resolver(cypher, params),
    };
    const session = {
        executeRead: async (work) => work(transaction),
        executeWrite: async (work) => work(transaction),
        close: async () => undefined,
    };
    return {
        session: () => session,
        close: async () => undefined,
    };
};
//# sourceMappingURL=mock-client.js.map