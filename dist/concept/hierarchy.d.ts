import { z } from 'zod';
import { type AssessmentDate } from './course-units.js';
export type TopicNode = {
    id: string;
    label: string;
    kind: 'topic';
};
export type SectionNode = {
    id: string;
    label: string;
    kind: 'section';
    topics: TopicNode[];
};
export type ExamNode = {
    id: string;
    label: string;
    kind: 'exam';
    sections: SectionNode[];
    assessmentDates: AssessmentDate[];
};
export type CourseHierarchy = {
    units: ExamNode[];
};
export declare const topicNodeSchema: z.ZodType<TopicNode>;
export declare const sectionNodeSchema: z.ZodType<SectionNode>;
export declare const examNodeSchema: z.ZodType<ExamNode>;
export declare const courseHierarchySchema: z.ZodType<CourseHierarchy>;
export declare const validateCourseHierarchy: (hierarchy: CourseHierarchy) => CourseHierarchy;
export declare const flattenTopics: (hierarchy: CourseHierarchy) => TopicNode[];
//# sourceMappingURL=hierarchy.d.ts.map