import { z } from 'zod';
export declare const assessmentDateKindSchema: z.ZodEnum<{
    exam: "exam";
    quiz: "quiz";
    final: "final";
}>;
export declare const assessmentDateSchema: z.ZodObject<{
    date: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    kind: z.ZodOptional<z.ZodEnum<{
        exam: "exam";
        quiz: "quiz";
        final: "final";
    }>>;
}, z.core.$strip>;
export type AssessmentDate = z.infer<typeof assessmentDateSchema>;
export declare const courseUnitSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    assessmentDates: z.ZodArray<z.ZodObject<{
        date: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
        kind: z.ZodOptional<z.ZodEnum<{
            exam: "exam";
            quiz: "quiz";
            final: "final";
        }>>;
    }, z.core.$strip>>;
}, z.core.$loose>;
export type CourseUnit = z.infer<typeof courseUnitSchema>;
export declare const parseAssessmentDate: (value: string) => Date | null;
export declare const serializeAssessmentDate: (date: AssessmentDate) => string | null;
export declare const validateCourseUnits: (units: readonly CourseUnit[]) => readonly CourseUnit[];
//# sourceMappingURL=course-units.d.ts.map