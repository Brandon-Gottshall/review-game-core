import { z } from 'zod'

export const assessmentDateKindSchema = z.enum(['exam', 'quiz', 'final'])

export const assessmentDateSchema = z.object({
  date: z.string().min(1),
  label: z.string().optional(),
  kind: assessmentDateKindSchema.optional(),
})

export type AssessmentDate = z.infer<typeof assessmentDateSchema>

export const courseUnitSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  assessmentDates: z.array(assessmentDateSchema),
}).passthrough()

export type CourseUnit = z.infer<typeof courseUnitSchema>

export const parseAssessmentDate = (value: string): Date | null => {
  if (!value.trim()) return null
  const parsed = value.includes('T')
    ? new Date(value)
    : new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export const serializeAssessmentDate = (date: AssessmentDate): string | null => {
  const parsed = parseAssessmentDate(date.date)
  if (!parsed) return null
  return date.date.includes('T')
    ? parsed.toISOString()
    : parsed.toISOString().slice(0, 10)
}

export const validateCourseUnits = (units: readonly CourseUnit[]): readonly CourseUnit[] => (
  z.array(courseUnitSchema).parse(units)
)
