export interface WorkflowDebugParams {
    wf?: boolean | 0 | 1 | '0' | '1' | 'false' | 'true';
    seed?: number | string;
    route?: string;
    concept?: string;
    question?: string;
    section?: string;
    stage?: string;
    answer?: string;
    restore?: boolean | 0 | 1 | '0' | '1' | 'false' | 'true';
    support?: boolean | 0 | 1 | '0' | '1' | 'false' | 'true';
    session?: string;
    learner?: string;
    [key: string]: string | number | boolean | undefined | null;
}
export interface WorkflowDebugState {
    enabled: boolean;
    seed: number | null;
    route: string | null;
    concept: string | null;
    question: string | null;
    section: string | null;
    stage: string | null;
    answer: string | null;
    restore: boolean;
    support: boolean;
    session: string | null;
    learner: string | null;
    query: Record<string, string>;
}
export declare function parseWorkflowDebugParams(input: string | URLSearchParams | URL | Record<string, unknown>): WorkflowDebugParams;
export declare function isWorkflowDebugEnabled(params: WorkflowDebugParams): boolean;
export declare function normalizeWorkflowDebugState(params: WorkflowDebugParams): WorkflowDebugState;
export declare function buildWorkflowDebugQuery(params: WorkflowDebugParams): string;
export declare function buildWorkflowDebugRoute(basePath: string, params: WorkflowDebugParams): string;
//# sourceMappingURL=debug.d.ts.map