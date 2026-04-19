import { z } from 'zod'

import { assessmentDateSchema, type AssessmentDate } from './course-units.js'

export type TopicNode = {
  id: string
  label: string
  kind: 'topic'
}

export type SectionNode = {
  id: string
  label: string
  kind: 'section'
  topics: TopicNode[]
}

export type ExamNode = {
  id: string
  label: string
  kind: 'exam'
  sections: SectionNode[]
  assessmentDates: AssessmentDate[]
}

export type CourseHierarchy = {
  units: ExamNode[]
}

export const topicNodeSchema: z.ZodType<TopicNode> = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  kind: z.literal('topic'),
})

export const sectionNodeSchema: z.ZodType<SectionNode> = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  kind: z.literal('section'),
  topics: z.array(topicNodeSchema),
})

export const examNodeSchema: z.ZodType<ExamNode> = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  kind: z.literal('exam'),
  sections: z.array(sectionNodeSchema),
  assessmentDates: z.array(assessmentDateSchema),
})

export const courseHierarchySchema: z.ZodType<CourseHierarchy> = z.object({
  units: z.array(examNodeSchema),
})

export const validateCourseHierarchy = (hierarchy: CourseHierarchy): CourseHierarchy => (
  courseHierarchySchema.parse(hierarchy)
)

export const flattenTopics = (hierarchy: CourseHierarchy): TopicNode[] => (
  hierarchy.units.flatMap((unit) => unit.sections.flatMap((section) => section.topics))
)
