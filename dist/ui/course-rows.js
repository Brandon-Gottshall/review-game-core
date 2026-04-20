import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PHASE_STATE_LABELS } from '../scheduler/phase-state.js';
import { StateDot } from './state.js';
import { cx, formatIsoDate, formatRelativeDay, getFocusableSibling } from './utils.js';
export function TopicRow({ topic, readiness }) {
    const state = readiness?.phase ?? 'not_started';
    return (_jsxs("li", { className: cx('rg-topic-row', `is-${state}`), "data-testid": `topic-row-${topic.id}`, children: [_jsx(StateDot, { state: state, size: "sm" }), _jsx("span", { className: "rg-topic-row__label", children: topic.label }), _jsx("span", { className: "rg-topic-row__meta", children: PHASE_STATE_LABELS[state] })] }));
}
const ROW_SELECTOR = '.rg-exam-row, .rg-section-row';
const ROW_DETAIL_SELECTOR = '.rg-exam-row__detail, .rg-section-row__detail';
/**
 * WAI-ARIA TreeView keyboard pattern for ExamRow / SectionRow toggles.
 *
 * - ArrowDown / ArrowUp: sibling navigation within the same `data-rg-rowlist`.
 * - ArrowRight: expand if collapsed; descend to first child toggle if already expanded.
 * - ArrowLeft: collapse if expanded; ascend to parent toggle if already collapsed.
 * - Home / End: jump to the first / last toggle in the nearest `data-rg-rowtree` root.
 * - Enter / Space: toggle (native button behavior — handled by the browser).
 */
const handleTreeKeyDown = (event, onToggle) => {
    const toggle = event.currentTarget;
    const { key } = event;
    if (key === 'ArrowDown') {
        const sibling = getFocusableSibling(toggle, '[data-rg-rowtoggle="true"]', 1);
        if (sibling) {
            event.preventDefault();
            sibling.focus();
        }
        return;
    }
    if (key === 'ArrowUp') {
        const sibling = getFocusableSibling(toggle, '[data-rg-rowtoggle="true"]', -1);
        if (sibling) {
            event.preventDefault();
            sibling.focus();
        }
        return;
    }
    if (key === 'ArrowRight') {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        if (!expanded) {
            event.preventDefault();
            onToggle?.();
            return;
        }
        const row = toggle.closest(ROW_SELECTOR);
        const detail = row?.querySelector(ROW_DETAIL_SELECTOR);
        const firstChild = detail?.querySelector('[data-rg-rowtoggle="true"]');
        if (firstChild) {
            event.preventDefault();
            firstChild.focus();
        }
        return;
    }
    if (key === 'ArrowLeft') {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        if (expanded) {
            event.preventDefault();
            onToggle?.();
            return;
        }
        const row = toggle.closest(ROW_SELECTOR);
        const parentRow = row?.parentElement?.closest(ROW_SELECTOR);
        const parentToggle = parentRow?.querySelector('[data-rg-rowtoggle="true"]');
        if (parentToggle) {
            event.preventDefault();
            parentToggle.focus();
        }
        return;
    }
    if (key === 'Home' || key === 'End') {
        const tree = toggle.closest('[data-rg-rowtree="true"]');
        if (!tree)
            return;
        const toggles = Array.from(tree.querySelectorAll('[data-rg-rowtoggle="true"]'));
        if (toggles.length === 0)
            return;
        event.preventDefault();
        const target = key === 'Home' ? toggles[0] : toggles[toggles.length - 1];
        target?.focus();
    }
};
export function SectionRow({ section, readiness, topicReadiness = {}, expanded = false, onToggle, renderAction, }) {
    const state = readiness?.phase ?? 'not_started';
    const masteredTopics = section.topics.filter((topic) => topicReadiness[topic.id]?.phase === 'mastered').length;
    return (_jsxs("li", { className: cx('rg-card rg-section-row', `is-${state}`, expanded && 'is-expanded'), children: [_jsxs("div", { className: "rg-section-row__header", children: [_jsxs("button", { type: "button", className: "rg-section-row__toggle", "aria-expanded": expanded, "data-rg-rowtoggle": "true", onKeyDown: (event) => handleTreeKeyDown(event, onToggle), onClick: onToggle, children: [_jsx("span", { "aria-hidden": "true", children: expanded ? '▾' : '▸' }), _jsx(StateDot, { state: state }), _jsx("span", { className: "rg-section-row__title", children: section.label }), _jsxs("span", { className: "rg-section-row__meta", children: [masteredTopics, "/", section.topics.length, " topics mastered"] })] }), renderAction ? _jsx("div", { className: "rg-section-row__action", children: renderAction }) : null] }), expanded ? (_jsx("div", { className: "rg-section-row__detail", children: _jsx("ul", { className: "rg-topic-list", children: section.topics.map((topic) => (_jsx(TopicRow, { topic: topic, readiness: topicReadiness[topic.id] }, topic.id))) }) })) : null] }));
}
const getDeadlineMeta = (exam, now) => {
    const firstDate = exam.assessmentDates[0]?.date;
    if (!firstDate)
        return null;
    return `${formatIsoDate(firstDate)} · ${formatRelativeDay(firstDate, now)}`;
};
export function ExamRow({ exam, readiness, sectionReadiness = {}, topicReadiness = {}, expanded = false, expandedSectionId = null, onToggle, onToggleSection, renderExamAction, renderSectionAction, now = new Date(), }) {
    const state = readiness?.phase ?? 'not_started';
    const deadline = getDeadlineMeta(exam, now);
    const masteredSections = exam.sections.filter((section) => sectionReadiness[section.id]?.phase === 'mastered').length;
    return (_jsxs("article", { className: cx('rg-card rg-exam-row', `is-${state}`, expanded && 'is-expanded'), children: [_jsxs("button", { type: "button", className: "rg-exam-row__toggle", "aria-expanded": expanded, "data-rg-rowtoggle": "true", onKeyDown: (event) => handleTreeKeyDown(event, onToggle), onClick: onToggle, children: [_jsx("span", { "aria-hidden": "true", children: expanded ? '▾' : '▸' }), _jsx("span", { className: "rg-exam-row__title", children: exam.label }), _jsxs("span", { className: "rg-exam-row__meta", children: [readiness?.score ?? 0, "% ready \u00B7 ", masteredSections, "/", exam.sections.length, " sections mastered"] }), deadline ? _jsx("span", { className: "rg-exam-row__deadline", children: deadline }) : null] }), expanded ? (_jsxs("div", { className: "rg-exam-row__detail", children: [renderExamAction ? _jsx("div", { className: "rg-exam-row__actions", children: renderExamAction }) : null, _jsx("ul", { className: "rg-section-list", "data-rg-rowlist": "true", children: exam.sections.map((section) => (_jsx(SectionRow, { section: section, readiness: sectionReadiness[section.id], topicReadiness: topicReadiness, expanded: expandedSectionId === section.id, onToggle: () => onToggleSection?.(section.id), renderAction: renderSectionAction?.(section) }, section.id))) })] })) : null] }));
}
export function CourseHierarchyRows({ hierarchy, readinessById = {}, expandedExamId = null, expandedSectionId = null, onToggleExam, onToggleSection, }) {
    return (_jsx("section", { className: "rg-course-rows", "data-rg-rowtree": "true", "data-rg-rowlist": "true", "aria-label": "Course readiness hierarchy", children: hierarchy.units.map((exam) => (_jsx(ExamRow, { exam: exam, readiness: readinessById[exam.id], sectionReadiness: readinessById, topicReadiness: readinessById, expanded: expandedExamId === exam.id, expandedSectionId: expandedSectionId, onToggle: () => onToggleExam?.(exam.id), onToggleSection: onToggleSection }, exam.id))) }));
}
export const readinessPhaseClassName = (phase) => `is-${phase}`;
//# sourceMappingURL=course-rows.js.map