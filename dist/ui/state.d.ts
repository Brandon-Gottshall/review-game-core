import { type PhaseState } from '../scheduler/phase-state.js';
type StateDotProps = {
    state: PhaseState;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    label?: string;
};
export declare function StateDot({ state, size, className, label }: StateDotProps): import("react/jsx-runtime").JSX.Element;
type StateLegendProps = {
    className?: string;
};
export declare function StateLegend({ className }: StateLegendProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=state.d.ts.map