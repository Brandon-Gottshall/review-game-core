import type { ReactNode } from 'react';
import type { CourseHierarchy, ExamNode, SectionNode, TopicNode } from '../concept/hierarchy.js';
import { type PhaseState } from '../scheduler/phase-state.js';
import type { ReadinessScore } from '../readiness/index.js';
type ReadinessMap = Record<string, ReadinessScore | undefined>;
type TopicRowProps = {
    topic: TopicNode;
    readiness?: ReadinessScore;
};
export declare function TopicRow({ topic, readiness }: TopicRowProps): import("react/jsx-runtime").JSX.Element;
type SectionRowProps = {
    section: SectionNode;
    readiness?: ReadinessScore;
    topicReadiness?: ReadinessMap;
    expanded?: boolean;
    onToggle?: () => void;
    renderAction?: ReactNode;
};
export declare function SectionRow({ section, readiness, topicReadiness, expanded, onToggle, renderAction, }: SectionRowProps): import("react/jsx-runtime").JSX.Element;
type ExamRowProps = {
    exam: ExamNode;
    readiness?: ReadinessScore;
    sectionReadiness?: ReadinessMap;
    topicReadiness?: ReadinessMap;
    expanded?: boolean;
    expandedSectionId?: string | null;
    onToggle?: () => void;
    onToggleSection?: (sectionId: string) => void;
    renderExamAction?: ReactNode;
    renderSectionAction?: (section: SectionNode) => ReactNode;
    now?: Date;
};
export declare function ExamRow({ exam, readiness, sectionReadiness, topicReadiness, expanded, expandedSectionId, onToggle, onToggleSection, renderExamAction, renderSectionAction, now, }: ExamRowProps): import("react/jsx-runtime").JSX.Element;
type CourseHierarchyRowsProps = {
    hierarchy: CourseHierarchy;
    readinessById?: ReadinessMap;
    expandedExamId?: string | null;
    expandedSectionId?: string | null;
    onToggleExam?: (examId: string) => void;
    onToggleSection?: (sectionId: string) => void;
};
export declare function CourseHierarchyRows({ hierarchy, readinessById, expandedExamId, expandedSectionId, onToggleExam, onToggleSection, }: CourseHierarchyRowsProps): import("react/jsx-runtime").JSX.Element;
export declare const readinessPhaseClassName: (phase: PhaseState) => string;
export {};
//# sourceMappingURL=course-rows.d.ts.map