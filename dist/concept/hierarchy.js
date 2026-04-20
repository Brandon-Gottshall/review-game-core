import { z } from 'zod';
import { assessmentDateSchema } from './course-units.js';
export const topicNodeSchema = z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    kind: z.literal('topic'),
});
export const sectionNodeSchema = z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    kind: z.literal('section'),
    topics: z.array(topicNodeSchema),
});
export const examNodeSchema = z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    kind: z.literal('exam'),
    sections: z.array(sectionNodeSchema),
    assessmentDates: z.array(assessmentDateSchema),
});
export const courseHierarchySchema = z.object({
    units: z.array(examNodeSchema),
});
export const validateCourseHierarchy = (hierarchy) => (courseHierarchySchema.parse(hierarchy));
export const flattenTopics = (hierarchy) => (hierarchy.units.flatMap((unit) => unit.sections.flatMap((section) => section.topics)));
//# sourceMappingURL=hierarchy.js.map