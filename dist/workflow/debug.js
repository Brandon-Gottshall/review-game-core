function readString(value) {
    if (typeof value !== 'string')
        return null;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
}
function readBoolean(value) {
    if (typeof value === 'boolean')
        return value;
    if (typeof value === 'number')
        return value !== 0;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
    }
    return false;
}
function readSeed(value) {
    if (typeof value === 'number' && Number.isFinite(value))
        return value;
    if (typeof value !== 'string')
        return null;
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
}
function normalizeParamValue(value) {
    if (value == null)
        return value;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }
    return String(value);
}
export function parseWorkflowDebugParams(input) {
    if (typeof input === 'string') {
        return parseWorkflowDebugParams(new URLSearchParams(input.startsWith('?') ? input.slice(1) : input));
    }
    if (input instanceof URLSearchParams) {
        const params = {};
        for (const [key, value] of input.entries()) {
            params[key] = value;
        }
        return params;
    }
    if (input instanceof URL) {
        return parseWorkflowDebugParams(input.searchParams);
    }
    const params = {};
    for (const [key, value] of Object.entries(input)) {
        const normalized = normalizeParamValue(value);
        if (normalized !== undefined) {
            params[key] = normalized;
        }
    }
    return params;
}
export function isWorkflowDebugEnabled(params) {
    return readBoolean(params.wf ?? false);
}
export function normalizeWorkflowDebugState(params) {
    const query = {};
    for (const [key, value] of Object.entries(params)) {
        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (trimmed.length > 0) {
                query[key] = trimmed;
            }
        }
        else if (typeof value === 'number' || typeof value === 'boolean') {
            query[key] = String(value);
        }
    }
    return {
        enabled: isWorkflowDebugEnabled(params),
        seed: readSeed(params.seed ?? null),
        route: readString(params.route ?? null),
        concept: readString(params.concept ?? null),
        question: readString(params.question ?? null),
        section: readString(params.section ?? null),
        stage: readString(params.stage ?? null),
        answer: readString(params.answer ?? null),
        restore: readBoolean(params.restore ?? false),
        support: readBoolean(params.support ?? false),
        session: readString(params.session ?? null),
        learner: readString(params.learner ?? null),
        query,
    };
}
export function buildWorkflowDebugQuery(params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value == null)
            continue;
        searchParams.set(key, String(value));
    }
    return searchParams.toString();
}
export function buildWorkflowDebugRoute(basePath, params) {
    const query = buildWorkflowDebugQuery(params);
    return query.length > 0 ? `${basePath}?${query}` : basePath;
}
//# sourceMappingURL=debug.js.map