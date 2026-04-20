import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PHASE_STATE_LABELS, PHASE_STATE_ORDER } from '../scheduler/phase-state.js';
import { cx } from './utils.js';
export function StateDot({ state, size = 'md', className, label }) {
    return (_jsx("span", { className: cx('rg-state-dot', `rg-state-dot--${state}`, `rg-state-dot--${size}`, className), "aria-label": label ?? PHASE_STATE_LABELS[state], title: label ?? PHASE_STATE_LABELS[state] }));
}
export function StateLegend({ className }) {
    return (_jsxs("div", { className: cx('rg-card rg-state-legend', className), "aria-label": "What the phase dots mean", children: [_jsx("span", { className: "rg-kicker", children: "Phase legend" }), _jsx("div", { className: "rg-state-legend__items", children: PHASE_STATE_ORDER.map((state) => (_jsxs("span", { className: "rg-state-legend__item", children: [_jsx(StateDot, { state: state }), _jsx("span", { children: PHASE_STATE_LABELS[state] })] }, state))) })] }));
}
//# sourceMappingURL=state.js.map