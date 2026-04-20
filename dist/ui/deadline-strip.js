import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cx, formatIsoDate, formatRelativeDay } from './utils.js';
const getNextAssessment = (unit, now) => {
    const ordered = [...unit.assessmentDates]
        .filter((entry) => entry?.date)
        .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());
    const upcoming = ordered.find((entry) => new Date(entry.date).getTime() >= now.getTime());
    return upcoming ?? ordered[0] ?? null;
};
const getDeadlineTone = (date, now) => {
    const relative = formatRelativeDay(date, now);
    if (relative === 'Today')
        return 'today';
    if (relative.endsWith('ago') || relative === 'Yesterday')
        return 'past';
    return 'upcoming';
};
export function DeadlineStrip({ units, now = new Date(), className, }) {
    return (_jsx("footer", { className: cx('rg-card rg-deadline-strip', className), "aria-label": "Upcoming assessment dates", children: units.map((unit) => {
            const assessment = getNextAssessment(unit, now);
            const tone = assessment ? getDeadlineTone(assessment.date, now) : 'upcoming';
            return (_jsxs("div", { className: cx('rg-deadline-strip__item', `is-${tone}`), children: [_jsx("span", { className: "rg-deadline-strip__label", children: unit.label }), assessment ? (_jsxs("span", { className: "rg-deadline-strip__meta", children: [assessment.label ?? formatIsoDate(assessment.date), ' · ', formatRelativeDay(assessment.date, now)] })) : (_jsx("span", { className: "rg-deadline-strip__meta", children: "No assessment date" }))] }, unit.id));
        }) }));
}
//# sourceMappingURL=deadline-strip.js.map