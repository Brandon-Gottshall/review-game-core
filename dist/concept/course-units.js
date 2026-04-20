import { z } from 'zod';
export const assessmentDateKindSchema = z.enum(['exam', 'quiz', 'final']);
export const assessmentDateSchema = z.object({
    date: z.string().min(1),
    label: z.string().optional(),
    kind: assessmentDateKindSchema.optional(),
});
export const courseUnitSchema = z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    assessmentDates: z.array(assessmentDateSchema),
}).passthrough();
export const parseAssessmentDate = (value) => {
    if (!value.trim())
        return null;
    const parsed = value.includes('T')
        ? new Date(value)
        : new Date(`${value}T00:00:00.000Z`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};
export const serializeAssessmentDate = (date) => {
    const parsed = parseAssessmentDate(date.date);
    if (!parsed)
        return null;
    return date.date.includes('T')
        ? parsed.toISOString()
        : parsed.toISOString().slice(0, 10);
};
export const validateCourseUnits = (units) => (z.array(courseUnitSchema).parse(units));
//# sourceMappingURL=course-units.js.map