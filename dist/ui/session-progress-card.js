'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useId, useState } from 'react';
import { cx } from './utils.js';
export function SessionProgressCard({ title = 'Session progress', metrics, goalHint, open, defaultOpen = false, onOpenChange, className, children, }) {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const resolvedOpen = open ?? internalOpen;
    const bodyId = `${useId()}-body`;
    useEffect(() => {
        if (typeof open === 'boolean')
            return;
        setInternalOpen(defaultOpen);
    }, [defaultOpen, open]);
    const setOpen = (next) => {
        if (typeof open !== 'boolean')
            setInternalOpen(next);
        onOpenChange?.(next);
    };
    return (_jsxs("section", { className: cx('rg-card rg-session-progress', className), "aria-label": title, children: [_jsxs("button", { type: "button", className: "rg-session-progress__toggle", "aria-expanded": resolvedOpen, "aria-controls": bodyId, onClick: () => setOpen(!resolvedOpen), children: [_jsx("span", { className: "rg-kicker", children: title }), _jsx("span", { children: resolvedOpen ? 'Hide' : 'Open' })] }), resolvedOpen ? (_jsxs("div", { id: bodyId, className: "rg-session-progress__body", children: [_jsx("div", { className: "rg-session-progress__metrics", children: metrics.map((metric) => (_jsxs("article", { className: "rg-session-progress__metric", children: [_jsx("span", { className: "rg-session-progress__metric-value", children: metric.value }), _jsx("span", { className: "rg-session-progress__metric-label", children: metric.label }), metric.detail ? _jsx("span", { className: "rg-note", children: metric.detail }) : null] }, metric.id))) }), goalHint ? _jsx("p", { className: "rg-note", children: goalHint }) : null, children] })) : null] }));
}
//# sourceMappingURL=session-progress-card.js.map