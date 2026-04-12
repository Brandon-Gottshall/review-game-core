export function resolveQuestionRenderer(registry, type) {
    return registry[type] ?? null;
}
export function registerQuestionRenderer(registry, entry) {
    return {
        ...registry,
        [entry.type]: entry.renderer,
    };
}
export function getMissingRendererTypes(requiredTypes, registry) {
    return requiredTypes.filter(type => registry[type] == null);
}
export function listRegisteredRendererTypes(registry) {
    return Object.keys(registry).filter((type) => registry[type] != null);
}
//# sourceMappingURL=rendering.js.map