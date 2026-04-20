'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { CRAM_URGENT_THRESHOLD_MS, tickCramSession, } from '../workflow/cram-mode.js';
import { cx } from './utils.js';
const formatRemaining = (remainingMs) => {
    const clamped = Math.max(0, Math.ceil(remainingMs / 1000));
    const minutes = Math.floor(clamped / 60);
    const seconds = clamped % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
};
export function CramTimer({ session, className }) {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        if (!session.endsAt || session.state === 'complete')
            return undefined;
        const handle = window.setInterval(() => {
            setNow(new Date());
        }, 1000);
        return () => {
            window.clearInterval(handle);
        };
    }, [session.endsAt, session.state]);
    const remainingMs = useMemo(() => {
        if (!session.endsAt)
            return 0;
        return Math.max(0, new Date(session.endsAt).getTime() - now.getTime());
    }, [now, session.endsAt]);
    const nextState = tickCramSession(session, now);
    return (_jsx("span", { className: cx('rg-cram-timer', nextState.state === 'urgent' && 'is-urgent', nextState.state === 'complete' && 'is-complete', className), "aria-label": `${formatRemaining(remainingMs)} remaining`, children: nextState.state === 'complete' ? 'Complete' : formatRemaining(remainingMs) }));
}
export function CramBanner({ session, examLabel, coveredCount, totalCount, description, className, }) {
    const nextState = tickCramSession(session, new Date());
    const completionLabel = typeof coveredCount === 'number' && typeof totalCount === 'number'
        ? `${coveredCount}/${totalCount} concepts covered`
        : null;
    return (_jsxs("section", { className: cx('rg-card rg-cram-banner', `is-${nextState.state}`, className), "aria-label": "Cram session", children: [_jsxs("div", { children: [_jsx("p", { className: "rg-kicker", children: "Cram mode" }), _jsx("h3", { children: examLabel }), description ? _jsx("p", { className: "rg-note", children: description }) : null, completionLabel ? _jsx("p", { className: "rg-note", children: completionLabel }) : null] }), _jsxs("div", { className: "rg-cram-banner__meta", children: [_jsxs("span", { className: "rg-chip", children: [Math.round(session.durationMs / 60000), " min"] }), _jsx(CramTimer, { session: session })] })] }));
}
export const isUrgentCramSession = (session, now = new Date()) => {
    if (!session.endsAt)
        return false;
    return new Date(session.endsAt).getTime() - now.getTime() <= CRAM_URGENT_THRESHOLD_MS;
};
//# sourceMappingURL=cram.js.map