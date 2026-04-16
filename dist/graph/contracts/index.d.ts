import { z } from 'zod';
export declare const GRAPH_SCHEMA_VERSION = 1;
export declare const graphStepLayerSchema: z.ZodEnum<{
    recognition: "recognition";
    setup: "setup";
    light_application: "light_application";
    independent_proof: "independent_proof";
    harder_transfer: "harder_transfer";
}>;
export type GraphStepLayer = z.infer<typeof graphStepLayerSchema>;
export declare const graphProjectionStatusSchema: z.ZodEnum<{
    started: "started";
    applied: "applied";
    reconciled: "reconciled";
    failed: "failed";
}>;
export type GraphProjectionStatus = z.infer<typeof graphProjectionStatusSchema>;
export declare const projectionRunMetadataSchema: z.ZodObject<{
    projectionId: z.ZodString;
    gameId: z.ZodString;
    sourceRepo: z.ZodString;
    sourceCommitSha: z.ZodString;
    contentHash: z.ZodString;
    generatedAt: z.ZodString;
    schemaVersion: z.ZodNumber;
    status: z.ZodEnum<{
        started: "started";
        applied: "applied";
        reconciled: "reconciled";
        failed: "failed";
    }>;
    startedAt: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export type ProjectionRunMetadata = z.infer<typeof projectionRunMetadataSchema>;
export declare const graphGameProjectionSchema: z.ZodObject<{
    gameId: z.ZodString;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type GraphGameProjection = z.infer<typeof graphGameProjectionSchema>;
export declare const graphUnitProjectionSchema: z.ZodObject<{
    gameId: z.ZodString;
    unitId: z.ZodString;
    label: z.ZodString;
    ordinal: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type GraphUnitProjection = z.infer<typeof graphUnitProjectionSchema>;
export declare const graphSectionProjectionSchema: z.ZodObject<{
    gameId: z.ZodString;
    unitId: z.ZodString;
    sectionId: z.ZodString;
    label: z.ZodString;
    ordinal: z.ZodOptional<z.ZodNumber>;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type GraphSectionProjection = z.infer<typeof graphSectionProjectionSchema>;
export declare const graphObjectiveProjectionSchema: z.ZodObject<{
    gameId: z.ZodString;
    unitId: z.ZodString;
    sectionId: z.ZodString;
    objectiveId: z.ZodString;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    requiredForCompletion: z.ZodDefault<z.ZodBoolean>;
    sourceMode: z.ZodOptional<z.ZodString>;
    sourceRefs: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type GraphObjectiveProjection = z.infer<typeof graphObjectiveProjectionSchema>;
export declare const graphCanonicalConceptProjectionSchema: z.ZodObject<{
    canonicalConceptId: z.ZodString;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    domain: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type GraphCanonicalConceptProjection = z.infer<typeof graphCanonicalConceptProjectionSchema>;
export declare const graphGameConceptProjectionSchema: z.ZodObject<{
    gameId: z.ZodString;
    gameConceptId: z.ZodString;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    canonicalConceptId: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type GraphGameConceptProjection = z.infer<typeof graphGameConceptProjectionSchema>;
export declare const graphSubskillProjectionSchema: z.ZodObject<{
    subskillId: z.ZodString;
    label: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type GraphSubskillProjection = z.infer<typeof graphSubskillProjectionSchema>;
export declare const graphLadderTemplateProjectionSchema: z.ZodObject<{
    gameId: z.ZodString;
    ladderId: z.ZodString;
    gameConceptId: z.ZodString;
    completionStepId: z.ZodString;
    masteryStepId: z.ZodString;
    retentionStepId: z.ZodString;
    repairStepId: z.ZodString;
}, z.core.$strip>;
export type GraphLadderTemplateProjection = z.infer<typeof graphLadderTemplateProjectionSchema>;
export declare const graphLadderStepProjectionSchema: z.ZodObject<{
    gameId: z.ZodString;
    ladderId: z.ZodString;
    stepId: z.ZodString;
    layer: z.ZodEnum<{
        recognition: "recognition";
        setup: "setup";
        light_application: "light_application";
        independent_proof: "independent_proof";
        harder_transfer: "harder_transfer";
    }>;
    ordinal: z.ZodNumber;
    supportPolicy: z.ZodEnum<{
        clean_only: "clean_only";
        hybrid: "hybrid";
        supported_ok: "supported_ok";
    }>;
    completionCredit: z.ZodDefault<z.ZodBoolean>;
    masteryCredit: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type GraphLadderStepProjection = z.infer<typeof graphLadderStepProjectionSchema>;
export declare const graphQuestionArtifactProjectionSchema: z.ZodObject<{
    gameId: z.ZodString;
    questionId: z.ZodString;
    unitId: z.ZodString;
    sectionId: z.ZodString;
    objectiveId: z.ZodString;
    conceptIds: z.ZodArray<z.ZodString>;
    targetStepIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
    subskills: z.ZodDefault<z.ZodArray<z.ZodString>>;
    variantFamily: z.ZodOptional<z.ZodString>;
    difficultyTag: z.ZodOptional<z.ZodString>;
    canonicalSignature: z.ZodOptional<z.ZodString>;
    promptHash: z.ZodString;
    sourceRef: z.ZodOptional<z.ZodString>;
    promptMirror: z.ZodOptional<z.ZodString>;
    explanationMirror: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type GraphQuestionArtifactProjection = z.infer<typeof graphQuestionArtifactProjectionSchema>;
export declare const graphObjectiveTeachesConceptProjectionSchema: z.ZodObject<{
    gameId: z.ZodString;
    objectiveId: z.ZodString;
    gameConceptId: z.ZodString;
}, z.core.$strip>;
export type GraphObjectiveTeachesConceptProjection = z.infer<typeof graphObjectiveTeachesConceptProjectionSchema>;
export declare const graphGameConceptRequiresProjectionSchema: z.ZodObject<{
    gameId: z.ZodString;
    gameConceptId: z.ZodString;
    requiredGameConceptId: z.ZodString;
}, z.core.$strip>;
export type GraphGameConceptRequiresProjection = z.infer<typeof graphGameConceptRequiresProjectionSchema>;
export declare const graphGameConceptRelatedProjectionSchema: z.ZodObject<{
    gameId: z.ZodString;
    gameConceptId: z.ZodString;
    relatedGameConceptId: z.ZodString;
}, z.core.$strip>;
export type GraphGameConceptRelatedProjection = z.infer<typeof graphGameConceptRelatedProjectionSchema>;
export declare const graphGameConceptTransferProjectionSchema: z.ZodObject<{
    gameId: z.ZodString;
    gameConceptId: z.ZodString;
    transferGameConceptId: z.ZodString;
}, z.core.$strip>;
export type GraphGameConceptTransferProjection = z.infer<typeof graphGameConceptTransferProjectionSchema>;
export declare const graphGameConceptUsesSubskillProjectionSchema: z.ZodObject<{
    gameId: z.ZodString;
    gameConceptId: z.ZodString;
    subskillId: z.ZodString;
}, z.core.$strip>;
export type GraphGameConceptUsesSubskillProjection = z.infer<typeof graphGameConceptUsesSubskillProjectionSchema>;
export declare const graphConceptHasLadderProjectionSchema: z.ZodObject<{
    gameId: z.ZodString;
    gameConceptId: z.ZodString;
    ladderId: z.ZodString;
}, z.core.$strip>;
export type GraphConceptHasLadderProjection = z.infer<typeof graphConceptHasLadderProjectionSchema>;
export declare const graphLadderHasStepProjectionSchema: z.ZodObject<{
    gameId: z.ZodString;
    ladderId: z.ZodString;
    stepId: z.ZodString;
}, z.core.$strip>;
export type GraphLadderHasStepProjection = z.infer<typeof graphLadderHasStepProjectionSchema>;
export declare const graphLadderStepNextProjectionSchema: z.ZodObject<{
    gameId: z.ZodString;
    ladderId: z.ZodString;
    stepId: z.ZodString;
    nextStepId: z.ZodString;
}, z.core.$strip>;
export type GraphLadderStepNextProjection = z.infer<typeof graphLadderStepNextProjectionSchema>;
export declare const graphLadderStepRepairsToProjectionSchema: z.ZodObject<{
    gameId: z.ZodString;
    ladderId: z.ZodString;
    stepId: z.ZodString;
    repairStepId: z.ZodString;
}, z.core.$strip>;
export type GraphLadderStepRepairsToProjection = z.infer<typeof graphLadderStepRepairsToProjectionSchema>;
export declare const graphQuestionAssessesConceptProjectionSchema: z.ZodObject<{
    gameId: z.ZodString;
    questionId: z.ZodString;
    gameConceptId: z.ZodString;
}, z.core.$strip>;
export type GraphQuestionAssessesConceptProjection = z.infer<typeof graphQuestionAssessesConceptProjectionSchema>;
export declare const graphQuestionTargetsStepProjectionSchema: z.ZodObject<{
    gameId: z.ZodString;
    questionId: z.ZodString;
    stepId: z.ZodString;
}, z.core.$strip>;
export type GraphQuestionTargetsStepProjection = z.infer<typeof graphQuestionTargetsStepProjectionSchema>;
export declare const graphQuestionUsesSubskillProjectionSchema: z.ZodObject<{
    gameId: z.ZodString;
    questionId: z.ZodString;
    subskillId: z.ZodString;
}, z.core.$strip>;
export type GraphQuestionUsesSubskillProjection = z.infer<typeof graphQuestionUsesSubskillProjectionSchema>;
export declare const graphQuestionBelongsToObjectiveProjectionSchema: z.ZodObject<{
    gameId: z.ZodString;
    questionId: z.ZodString;
    objectiveId: z.ZodString;
}, z.core.$strip>;
export type GraphQuestionBelongsToObjectiveProjection = z.infer<typeof graphQuestionBelongsToObjectiveProjectionSchema>;
export declare const graphProjectionEnvelopeSchema: z.ZodObject<{
    projectionId: z.ZodString;
    gameId: z.ZodString;
    sourceRepo: z.ZodString;
    sourceCommitSha: z.ZodString;
    contentHash: z.ZodString;
    generatedAt: z.ZodString;
    schemaVersion: z.ZodNumber;
    games: z.ZodArray<z.ZodObject<{
        gameId: z.ZodString;
        label: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    units: z.ZodDefault<z.ZodArray<z.ZodObject<{
        gameId: z.ZodString;
        unitId: z.ZodString;
        label: z.ZodString;
        ordinal: z.ZodOptional<z.ZodNumber>;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    sections: z.ZodDefault<z.ZodArray<z.ZodObject<{
        gameId: z.ZodString;
        unitId: z.ZodString;
        sectionId: z.ZodString;
        label: z.ZodString;
        ordinal: z.ZodOptional<z.ZodNumber>;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    objectives: z.ZodDefault<z.ZodArray<z.ZodObject<{
        gameId: z.ZodString;
        unitId: z.ZodString;
        sectionId: z.ZodString;
        objectiveId: z.ZodString;
        label: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        requiredForCompletion: z.ZodDefault<z.ZodBoolean>;
        sourceMode: z.ZodOptional<z.ZodString>;
        sourceRefs: z.ZodDefault<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>>;
    canonicalConcepts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        canonicalConceptId: z.ZodString;
        label: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        domain: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    gameConcepts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        gameId: z.ZodString;
        gameConceptId: z.ZodString;
        label: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        canonicalConceptId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    subskills: z.ZodDefault<z.ZodArray<z.ZodObject<{
        subskillId: z.ZodString;
        label: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    ladderTemplates: z.ZodDefault<z.ZodArray<z.ZodObject<{
        gameId: z.ZodString;
        ladderId: z.ZodString;
        gameConceptId: z.ZodString;
        completionStepId: z.ZodString;
        masteryStepId: z.ZodString;
        retentionStepId: z.ZodString;
        repairStepId: z.ZodString;
    }, z.core.$strip>>>;
    ladderSteps: z.ZodDefault<z.ZodArray<z.ZodObject<{
        gameId: z.ZodString;
        ladderId: z.ZodString;
        stepId: z.ZodString;
        layer: z.ZodEnum<{
            recognition: "recognition";
            setup: "setup";
            light_application: "light_application";
            independent_proof: "independent_proof";
            harder_transfer: "harder_transfer";
        }>;
        ordinal: z.ZodNumber;
        supportPolicy: z.ZodEnum<{
            clean_only: "clean_only";
            hybrid: "hybrid";
            supported_ok: "supported_ok";
        }>;
        completionCredit: z.ZodDefault<z.ZodBoolean>;
        masteryCredit: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>>>;
    questionArtifacts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        gameId: z.ZodString;
        questionId: z.ZodString;
        unitId: z.ZodString;
        sectionId: z.ZodString;
        objectiveId: z.ZodString;
        conceptIds: z.ZodArray<z.ZodString>;
        targetStepIds: z.ZodDefault<z.ZodArray<z.ZodString>>;
        subskills: z.ZodDefault<z.ZodArray<z.ZodString>>;
        variantFamily: z.ZodOptional<z.ZodString>;
        difficultyTag: z.ZodOptional<z.ZodString>;
        canonicalSignature: z.ZodOptional<z.ZodString>;
        promptHash: z.ZodString;
        sourceRef: z.ZodOptional<z.ZodString>;
        promptMirror: z.ZodOptional<z.ZodString>;
        explanationMirror: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    objectiveTeachesConcept: z.ZodDefault<z.ZodArray<z.ZodObject<{
        gameId: z.ZodString;
        objectiveId: z.ZodString;
        gameConceptId: z.ZodString;
    }, z.core.$strip>>>;
    gameConceptRequires: z.ZodDefault<z.ZodArray<z.ZodObject<{
        gameId: z.ZodString;
        gameConceptId: z.ZodString;
        requiredGameConceptId: z.ZodString;
    }, z.core.$strip>>>;
    gameConceptRelated: z.ZodDefault<z.ZodArray<z.ZodObject<{
        gameId: z.ZodString;
        gameConceptId: z.ZodString;
        relatedGameConceptId: z.ZodString;
    }, z.core.$strip>>>;
    gameConceptTransfer: z.ZodDefault<z.ZodArray<z.ZodObject<{
        gameId: z.ZodString;
        gameConceptId: z.ZodString;
        transferGameConceptId: z.ZodString;
    }, z.core.$strip>>>;
    gameConceptUsesSubskill: z.ZodDefault<z.ZodArray<z.ZodObject<{
        gameId: z.ZodString;
        gameConceptId: z.ZodString;
        subskillId: z.ZodString;
    }, z.core.$strip>>>;
    conceptHasLadder: z.ZodDefault<z.ZodArray<z.ZodObject<{
        gameId: z.ZodString;
        gameConceptId: z.ZodString;
        ladderId: z.ZodString;
    }, z.core.$strip>>>;
    ladderHasStep: z.ZodDefault<z.ZodArray<z.ZodObject<{
        gameId: z.ZodString;
        ladderId: z.ZodString;
        stepId: z.ZodString;
    }, z.core.$strip>>>;
    ladderStepNext: z.ZodDefault<z.ZodArray<z.ZodObject<{
        gameId: z.ZodString;
        ladderId: z.ZodString;
        stepId: z.ZodString;
        nextStepId: z.ZodString;
    }, z.core.$strip>>>;
    ladderStepRepairsTo: z.ZodDefault<z.ZodArray<z.ZodObject<{
        gameId: z.ZodString;
        ladderId: z.ZodString;
        stepId: z.ZodString;
        repairStepId: z.ZodString;
    }, z.core.$strip>>>;
    questionAssessesConcept: z.ZodDefault<z.ZodArray<z.ZodObject<{
        gameId: z.ZodString;
        questionId: z.ZodString;
        gameConceptId: z.ZodString;
    }, z.core.$strip>>>;
    questionTargetsStep: z.ZodDefault<z.ZodArray<z.ZodObject<{
        gameId: z.ZodString;
        questionId: z.ZodString;
        stepId: z.ZodString;
    }, z.core.$strip>>>;
    questionUsesSubskill: z.ZodDefault<z.ZodArray<z.ZodObject<{
        gameId: z.ZodString;
        questionId: z.ZodString;
        subskillId: z.ZodString;
    }, z.core.$strip>>>;
    questionBelongsToObjective: z.ZodDefault<z.ZodArray<z.ZodObject<{
        gameId: z.ZodString;
        questionId: z.ZodString;
        objectiveId: z.ZodString;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export type GraphProjectionEnvelope = z.infer<typeof graphProjectionEnvelopeSchema>;
export declare const graphProjectionStateSchema: z.ZodObject<{
    gameId: z.ZodString;
    activeProjectionId: z.ZodNullable<z.ZodString>;
    activeContentHash: z.ZodNullable<z.ZodString>;
    activeSchemaVersion: z.ZodNullable<z.ZodNumber>;
    activeStatus: z.ZodNullable<z.ZodEnum<{
        started: "started";
        applied: "applied";
        reconciled: "reconciled";
        failed: "failed";
    }>>;
    startedAt: z.ZodNullable<z.ZodString>;
    completedAt: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type GraphProjectionState = z.infer<typeof graphProjectionStateSchema>;
export declare const conceptPrerequisiteSchema: z.ZodObject<{
    conceptId: z.ZodString;
    prerequisiteConceptIds: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type ConceptPrerequisite = z.infer<typeof conceptPrerequisiteSchema>;
export declare const conceptLadderStepSchema: z.ZodObject<{
    stepId: z.ZodString;
    layer: z.ZodEnum<{
        recognition: "recognition";
        setup: "setup";
        light_application: "light_application";
        independent_proof: "independent_proof";
        harder_transfer: "harder_transfer";
    }>;
    ordinal: z.ZodNumber;
    supportPolicy: z.ZodEnum<{
        clean_only: "clean_only";
        hybrid: "hybrid";
        supported_ok: "supported_ok";
    }>;
    completionCredit: z.ZodBoolean;
    masteryCredit: z.ZodBoolean;
    nextStepId: z.ZodNullable<z.ZodString>;
    repairStepId: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const conceptLadderSchema: z.ZodObject<{
    conceptId: z.ZodString;
    ladderId: z.ZodString;
    completionStepId: z.ZodString;
    masteryStepId: z.ZodString;
    retentionStepId: z.ZodString;
    repairStepId: z.ZodString;
    steps: z.ZodArray<z.ZodObject<{
        stepId: z.ZodString;
        layer: z.ZodEnum<{
            recognition: "recognition";
            setup: "setup";
            light_application: "light_application";
            independent_proof: "independent_proof";
            harder_transfer: "harder_transfer";
        }>;
        ordinal: z.ZodNumber;
        supportPolicy: z.ZodEnum<{
            clean_only: "clean_only";
            hybrid: "hybrid";
            supported_ok: "supported_ok";
        }>;
        completionCredit: z.ZodBoolean;
        masteryCredit: z.ZodBoolean;
        nextStepId: z.ZodNullable<z.ZodString>;
        repairStepId: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ConceptLadder = z.infer<typeof conceptLadderSchema>;
export declare const questionArtifactSummarySchema: z.ZodObject<{
    questionId: z.ZodString;
    targetStepIds: z.ZodArray<z.ZodString>;
    conceptIds: z.ZodArray<z.ZodString>;
    subskills: z.ZodArray<z.ZodString>;
    variantFamily: z.ZodNullable<z.ZodString>;
    difficultyTag: z.ZodNullable<z.ZodString>;
    canonicalSignature: z.ZodNullable<z.ZodString>;
    promptHash: z.ZodString;
    sourceRef: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type QuestionArtifactSummary = z.infer<typeof questionArtifactSummarySchema>;
export declare const objectiveConceptsSchema: z.ZodObject<{
    objectiveId: z.ZodString;
    conceptIds: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type ObjectiveConcepts = z.infer<typeof objectiveConceptsSchema>;
export declare const crossGameCanonicalMatchSchema: z.ZodObject<{
    canonicalConceptId: z.ZodString;
    gameConceptId: z.ZodString;
    gameId: z.ZodString;
    label: z.ZodString;
}, z.core.$strip>;
export type CrossGameCanonicalMatch = z.infer<typeof crossGameCanonicalMatchSchema>;
//# sourceMappingURL=index.d.ts.map