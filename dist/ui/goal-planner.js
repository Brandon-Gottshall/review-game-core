import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cx } from './utils.js';
export function ReadinessFloorInput({ value, onChange, className }) {
    return (_jsxs("label", { className: cx('rg-field', className), children: [_jsx("span", { className: "rg-kicker", children: "Readiness floor" }), _jsx("input", { className: "rg-input", type: "number", min: "1", max: "100", value: value, onChange: (event) => onChange(event.target.value), "aria-label": "Readiness floor" })] }));
}
export function DeadlinePicker({ value, onChange, className }) {
    return (_jsxs("label", { className: cx('rg-field', className), children: [_jsx("span", { className: "rg-kicker", children: "Deadline" }), _jsx("input", { className: "rg-input", type: "date", value: value, onChange: (event) => onChange(event.target.value), "aria-label": "Goal deadline" })] }));
}
export function UnitCheckboxList({ units, onToggle, onSavedScoreChange, className, }) {
    return (_jsx("div", { className: cx('rg-unit-checkbox-list', className), children: units.map((unit) => (_jsxs("div", { className: "rg-unit-checkbox-list__item", children: [_jsxs("label", { className: "rg-unit-checkbox-list__label", children: [_jsx("input", { type: "checkbox", checked: unit.checked, onChange: () => onToggle(unit.id) }), _jsx("span", { children: unit.label })] }), typeof onSavedScoreChange === 'function' ? (_jsx("input", { className: "rg-input rg-unit-checkbox-list__score", type: "number", min: "0", max: "100", value: unit.savedScore ?? '', onChange: (event) => onSavedScoreChange(unit.id, event.target.value), placeholder: "saved score", "aria-label": `${unit.label} saved score` })) : null] }, unit.id))) }));
}
export function GoalPlannerCard({ readinessTarget, deadline, units, activeSummary, message, liveRecommendation, className, onReadinessTargetChange, onDeadlineChange, onToggleUnit, onSavedScoreChange, onSave, onClear, }) {
    const handleSubmit = (event) => {
        event.preventDefault();
        onSave();
    };
    return (_jsxs("section", { className: cx('rg-card rg-goal-planner', className), "aria-label": "Goal planner", children: [_jsx("p", { className: "rg-kicker", children: "Goal planner" }), _jsx("h3", { children: "Save a reusable goal, then keep editing it." }), _jsx("p", { className: "rg-note", children: "This plan keeps recalculating as readiness changes, and you can rewrite the candidates, floor, or deadline any time." }), message ? _jsx("p", { className: "rg-note", role: "status", children: message }) : null, activeSummary ? _jsxs("p", { className: "rg-note", children: [_jsx("strong", { children: "Active plan:" }), " ", activeSummary] }) : null, _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "rg-goal-planner__fields", children: [_jsx(ReadinessFloorInput, { value: readinessTarget, onChange: onReadinessTargetChange }), _jsx(DeadlinePicker, { value: deadline, onChange: onDeadlineChange })] }), _jsx(UnitCheckboxList, { units: units, onToggle: onToggleUnit, onSavedScoreChange: onSavedScoreChange }), _jsxs("div", { className: "rg-button-row", children: [_jsx("button", { type: "submit", className: "rg-button rg-button--primary", children: "Save goal plan" }), _jsx("button", { type: "button", className: "rg-button rg-button--secondary", onClick: onClear, children: "Clear goal plan" })] })] }), liveRecommendation ? (_jsxs("div", { className: "rg-goal-planner__live", children: [_jsx("p", { className: "rg-kicker", children: "Live recommendation" }), liveRecommendation] })) : null] }));
}
//# sourceMappingURL=goal-planner.js.map