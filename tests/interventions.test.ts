import { describe, expect, it } from 'vitest';

import {
  applyWorkflowInterventionMetadata,
  buildWorkflowInterventionExposureRecord,
  buildWorkflowInterventionResolutionKey,
  resolveRandomizedWorkflowInterventionArm,
  resolveWorkflowInterventionSourceQuestionId,
} from '../src/workflow/interventions.js';

describe('workflow/interventions', () => {
  it('builds stable resolution keys and deterministic randomized arms', () => {
    const resolutionKey = buildWorkflowInterventionResolutionKey({
      sessionId: 'session-1',
      currentTurn: 3,
      sourceQuestionId: 'q-1',
      conceptId: 'absolute-value',
      targetLayer: 'recognition',
    });

    expect(resolutionKey).toBe('session-1:3:q-1:absolute-value:recognition');
    expect(resolveRandomizedWorkflowInterventionArm('concept_derived_pilot', resolutionKey)).toBe(
      resolveRandomizedWorkflowInterventionArm('concept_derived_pilot', resolutionKey)
    );
  });

  it('builds shared exposure records and applies served-question metadata', () => {
    const exposure = buildWorkflowInterventionExposureRecord({
      learnerId: 'learner@example.com',
      sessionId: 'session-1',
      experimentKey: 'concept_derived_pilot',
      cohortMode: 'randomized',
      resolutionKey: 'session-1:3:q-1:absolute-value:recognition',
      conceptId: 'absolute-value',
      sourceQuestionId: 'q-1',
      servedQuestionIdByArm: {
        control: 'q-1',
        treatment: 'q-1__recognition_contrast__recognition',
      },
      unitId: 'n1',
      sectionId: 'P.1',
      targetLayer: 'recognition',
      interventionKind: 'recognition_contrast',
    }, {
      exposureId: 'exposure-1',
      createdAt: '2026-04-17T00:00:00.000Z',
    });

    expect(exposure.exposureId).toBe('exposure-1');
    expect(exposure.servedQuestionId).toMatch(/^q-1/);

    const served = applyWorkflowInterventionMetadata(
      {
        id: 'q-1__recognition_contrast__recognition',
        sourceQuestionId: resolveWorkflowInterventionSourceQuestionId({ id: 'q-1' }),
      },
      {
        experimentKey: exposure.experimentKey,
        experimentArm: exposure.resolvedArm,
        exposureId: exposure.exposureId,
        sourceQuestionId: exposure.sourceQuestionId,
        questionOrigin: 'recognition_contrast_treatment',
        interventionKind: exposure.interventionKind,
      }
    );

    expect(served.experimentKey).toBe('concept_derived_pilot');
    expect(served.exposureId).toBe('exposure-1');
    expect(served.sourceQuestionId).toBe('q-1');
  });
});
