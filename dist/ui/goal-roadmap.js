import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cx, formatLocalDateLabel } from './utils.js';
const ROLE_LABELS = {
    primary: 'Now',
    catch_up: 'Catch up',
    queued: 'Queued',
    complete: 'Complete',
};
const formatDayCount = (value) => `${value} day${value === 1 ? '' : 's'}`;
const formatDeadlineSummary = (phase) => {
    if (!phase.deadlineLocalDate)
        return null;
    const dateLabel = formatLocalDateLabel(phase.deadlineLocalDate);
    if (phase.timeStatus === 'today') {
        return `Due today · ${dateLabel}`;
    }
    if (phase.timeStatus === 'upcoming' && phase.daysUntilDeadline !== null) {
        return `Due in ${formatDayCount(phase.daysUntilDeadline)} · ${dateLabel}`;
    }
    if (phase.timeStatus === 'past_due' && phase.daysFromDeadline !== null) {
        return `Past due by ${formatDayCount(phase.daysFromDeadline)} · ${dateLabel}`;
    }
    return `Deadline ${dateLabel}`;
};
const formatProgressSummary = (phase) => {
    if (phase.targetCompletedUnits <= 0) {
        return 'Waiting for a progress target';
    }
    const completedLabel = `${phase.completedUnits}/${phase.targetCompletedUnits} complete`;
    if (phase.isComplete) {
        return `${completedLabel} · roadmap phase done`;
    }
    return `${completedLabel} · ${phase.remainingUnits} left`;
};
export function GoalRoadmapCard({ title = 'Goal roadmap', phases, summary, emptyMessage = 'No roadmap phases yet.', className, getTrackLabel = (trackId) => String(trackId), renderPhaseSupplement, }) {
    const activePhase = phases.find((phase) => phase.recommendationRole === 'primary') ?? null;
    const heading = activePhase
        ? `Current phase: ${activePhase.label}`
        : phases.length > 0
            ? 'All roadmap phases complete'
            : 'No roadmap yet';
    const resolvedSummary = summary ?? (activePhase
        ? `${activePhase.label} is the current focus. Earlier catch-up work stays visible and later phases stay queued.`
        : phases.length > 0
            ? 'Every phase in this roadmap is marked complete.'
            : emptyMessage);
    return (_jsxs("section", { className: cx('rg-card rg-goal-roadmap', className), "aria-label": title, children: [_jsx("p", { className: "rg-kicker", children: title }), _jsx("h3", { children: heading }), _jsx("p", { className: "rg-note", children: resolvedSummary }), phases.length > 0 ? (_jsx("ol", { className: "rg-goal-roadmap__list", children: phases.map((phase, index) => {
                    const progressPercent = Math.round(phase.progressRatio * 100);
                    const deadlineSummary = formatDeadlineSummary(phase);
                    const trackLabel = getTrackLabel(phase.trackId, phase);
                    return (_jsxs("li", { className: cx('rg-goal-roadmap__item', `is-${phase.recommendationRole}`, phase.isActive && 'is-active', phase.isComplete && 'is-complete'), children: [_jsxs("div", { className: "rg-goal-roadmap__rail", "aria-hidden": "true", children: [_jsx("span", { className: "rg-goal-roadmap__step", children: index + 1 }), index < phases.length - 1 ? _jsx("span", { className: "rg-goal-roadmap__line" }) : null] }), _jsxs("article", { className: "rg-goal-roadmap__panel", children: [_jsxs("div", { className: "rg-goal-roadmap__head", children: [_jsxs("div", { className: "rg-goal-roadmap__headcopy", children: [_jsx("p", { className: "rg-goal-roadmap__title", children: phase.label }), phase.description ? _jsx("p", { className: "rg-note", children: phase.description }) : null] }), _jsx("span", { className: cx('rg-goal-roadmap__badge', `is-${phase.recommendationRole}`), children: ROLE_LABELS[phase.recommendationRole] })] }), _jsxs("div", { className: "rg-goal-roadmap__meta", children: [_jsxs("span", { className: "rg-chip", children: ["Track: ", trackLabel] }), deadlineSummary ? _jsx("span", { className: "rg-chip", children: deadlineSummary }) : null] }), _jsxs("div", { className: "rg-goal-roadmap__progress", children: [_jsx("div", { className: "rg-goal-roadmap__bar", role: "progressbar", "aria-label": `${phase.label} progress`, "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": progressPercent, children: _jsx("span", { className: cx('rg-goal-roadmap__barfill', `is-${phase.recommendationRole}`), style: { width: `${progressPercent}%` } }) }), _jsx("p", { className: "rg-note", children: formatProgressSummary(phase) })] }), renderPhaseSupplement ? (_jsx("div", { className: "rg-goal-roadmap__supplement", children: renderPhaseSupplement(phase) })) : null] })] }, phase.id));
                }) })) : null] }));
}
//# sourceMappingURL=goal-roadmap.js.map