import type { ConceptNode } from '../concept/index.js';
import type { Generator } from '../generator/index.js';
import type { Question } from '../question/index.js';
import {
  applyConceptOutcome,
  applySupplementalConceptExposure,
  buildInitialConceptSchedule,
  createSchedulerPolicy,
  mergeConceptSchedule,
  pickNextConceptId,
  type PracticeOutcome,
  type SchedulerPolicy,
  type SchedulerPolicyConfig,
  type SubskillUpdate,
} from '../scheduler/index.js';

export interface WFHarnessPayloadSpec {
  payloadKey: string;
  requiredKeys: readonly string[];
}

export interface SchedulerStateExpectation {
  conceptId: string;
  path: string;
  expected: unknown;
}

export type SchedulerTransitionStep<TSubskill extends string = string> =
  | {
      kind: 'outcome';
      conceptId: string;
      currentTurn: number;
      outcome: PracticeOutcome;
      subskillUpdates?: readonly SubskillUpdate<TSubskill>[];
    }
  | {
      kind: 'supplemental';
      conceptId: string;
      currentTurn: number;
      wasClean?: boolean;
      subskillUpdates?: readonly SubskillUpdate<TSubskill>[];
    };

export interface SchedulerTransitionScenario<TSubskill extends string = string> {
  name: string;
  initialStored?: unknown;
  steps: readonly SchedulerTransitionStep<TSubskill>[];
  expectations: readonly SchedulerStateExpectation[];
}

export interface SchedulerSelectionScenario<TSubskill extends string = string> {
  name: string;
  initialStored?: unknown;
  steps?: readonly SchedulerTransitionStep<TSubskill>[];
  nextTurn: number;
  expectedConceptId: string;
  eligibleConceptIds?: readonly string[];
}

export interface WFHarnessSchedulerConfig<TSubskill extends string = string> {
  policy?: SchedulerPolicy<TSubskill> | SchedulerPolicyConfig<TSubskill>;
  transitionScenarios?: readonly SchedulerTransitionScenario<TSubskill>[];
  selectionScenarios?: readonly SchedulerSelectionScenario<TSubskill>[];
}

export type QuestionQualityIssueClass =
  | 'context_leakage'
  | 'signal_failure'
  | 'structure_helper_leakage'
  | 'subskill_goal_conflation'
  | 'instruction_validator_divergence'
  | 'distractor_collapse';

export type QuestionQualityVisibleText = Record<string, string | readonly string[] | null | undefined>;

export interface QuestionQualityItem {
  id: string;
  conceptId: string;
  stage?: string;
  targetLayer?: string;
  supportMode?: string;
  visibleText: QuestionQualityVisibleText;
  metadata?: Record<string, unknown>;
}

export type QuestionQualityPredicateResult =
  | string
  | readonly string[]
  | false
  | null
  | undefined;

export type QuestionQualityPatternRule = {
  id: string;
  issueClass: QuestionQualityIssueClass;
  message?: string;
  surfaces?: readonly string[];
  pattern: RegExp;
};

export type QuestionQualityPredicateRule = {
  id: string;
  issueClass: QuestionQualityIssueClass;
  message?: string;
  evaluate: (item: QuestionQualityItem) => QuestionQualityPredicateResult;
};

export type QuestionQualityRule =
  | QuestionQualityPatternRule
  | QuestionQualityPredicateRule;

export interface WFHarnessQuestionQualityConfig {
  items: readonly QuestionQualityItem[];
  rules: readonly QuestionQualityRule[];
}

export interface WFHarnessConfig<TType extends string = string, TSubskill extends string = string> {
  registeredTypes: readonly TType[];
  renderInteractiveCases: readonly TType[];
  interactivePayloadMap: Partial<Record<TType, WFHarnessPayloadSpec>>;
  questionPool: readonly Question<TType>[];
  conceptTree: readonly ConceptNode[];
  generators: readonly Generator<Question<TType>>[];
  quizClientPath?: string;
  quizClientSource?: string;
  renderPatternFor?: (type: string) => RegExp;
  scheduler?: WFHarnessSchedulerConfig<TSubskill>;
  questionQuality?: WFHarnessQuestionQualityConfig;
}

export interface ValidationResult {
  group: number;
  name: string;
  passed: boolean;
  failures: string[];
}

export interface ValidationGroup {
  group: number;
  name: string;
  results: ValidationResult[];
}

export const WF_GROUP_NAMES = {
  1: 'Question type coverage',
  2: 'Render dispatch coverage',
  3: 'Interactive payload shape',
  4: 'Boundary check',
  5: 'Concept consistency',
  6: 'Generator determinism',
  7: 'Scheduler coverage',
  8: 'Question quality',
} as const satisfies Record<number, string>;

export const WF_SAMPLE_SEEDS = [1, 42, 100, 2024, 99999] as const;

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function defaultRenderPatternFor(type: string): RegExp {
  return new RegExp(`currentQuestion\\.type\\s*===\\s*['"]${escapeRegExp(type)}['"]`);
}

function formatDiagnostic(value: unknown): string {
  if (typeof value === 'string') return value;

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function isDeepStrictEqual(actual: unknown, expected: unknown): boolean {
  try {
    return JSON.stringify(actual) === JSON.stringify(expected);
  } catch {
    return Object.is(actual, expected);
  }
}

function createResult(
  group: number,
  name: string,
  failures: string[],
  options?: { soft?: boolean }
): ValidationResult {
  return {
    group,
    name,
    passed: options?.soft ? true : failures.length === 0,
    failures,
  };
}

function getByPath(obj: unknown, dotted: string): unknown {
  return dotted.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function isNonEmpty(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === 'string') return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value as object).length > 0;
  if (typeof value === 'number') return true;
  return Boolean(value);
}

function normalizeVisibleText(value: string | readonly string[] | null | undefined): string {
  if (Array.isArray(value)) return value.join('\n');
  return typeof value === 'string' ? value : '';
}

function collectQuestionQualityText(
  item: QuestionQualityItem,
  surfaces?: readonly string[]
): Array<{ surface: string; text: string }> {
  const entries = Object.entries(item.visibleText)
    .filter(([surface]) => !surfaces || surfaces.includes(surface));

  return entries
    .map(([surface, value]) => ({ surface, text: normalizeVisibleText(value) }))
    .filter(({ text }) => text.trim().length > 0);
}

function normalizePredicateResult(result: QuestionQualityPredicateResult): string[] {
  if (!result) return [];
  return typeof result === 'string' ? [result] : [...result];
}

function getNodeBuiltinModule(specifier: string): unknown {
  const runtimeProcess = (globalThis as {
    process?: {
      getBuiltinModule?: (id: string) => unknown;
    };
  }).process;
  return runtimeProcess?.getBuiltinModule?.(specifier);
}

function readQuizClientSource(quizClientPath: string): string {
  const fsModule = getNodeBuiltinModule('node:fs') as {
    readFileSync?: (filePath: string, encoding: BufferEncoding) => string;
  } | undefined;
  const pathModule = getNodeBuiltinModule('node:path') as {
    resolve?: (...segments: string[]) => string;
  } | undefined;
  const runtimeProcess = (globalThis as {
    process?: {
      cwd?: () => string;
    };
  }).process;

  if (!fsModule?.readFileSync || !pathModule?.resolve || !runtimeProcess?.cwd) {
    throw new Error('quizClientPath source reading requires a Node.js runtime; pass quizClientSource in browser bundles');
  }

  return fsModule.readFileSync(pathModule.resolve(runtimeProcess.cwd(), quizClientPath), 'utf8');
}

export function validateTypeCoverage<TType extends string, TSubskill extends string = string>(
  config: WFHarnessConfig<TType, TSubskill>
): ValidationResult[] {
  const registered = new Set<string>(config.registeredTypes);
  const unknownTypes = Array.from(
    new Set(
      config.questionPool
        .map(question => question.type)
        .filter(type => !registered.has(type))
    )
  ).sort();

  const usedTypes = new Set(config.questionPool.map(question => question.type));
  const unusedTypes = config.registeredTypes.filter(type => !usedTypes.has(type));

  return [
    createResult(
      1,
      'every question type used in the pool is registered',
      unknownTypes.map(type => `questionPool uses unregistered type '${type}'`)
    ),
    createResult(
      1,
      'registered types with zero questions are reported as warnings',
      unusedTypes.map(type => `registeredTypes includes '${type}' but the question pool has no questions of that type`),
      { soft: true }
    ),
  ];
}

export function validateRenderDispatch<TType extends string, TSubskill extends string = string>(
  config: WFHarnessConfig<TType, TSubskill>
): ValidationResult[] {
  if (!config.quizClientPath && config.quizClientSource == null) {
    return [
      createResult(
        2,
        'render dispatch validation is skipped when quizClientPath and quizClientSource are omitted',
        [],
      ),
    ];
  }

  let source: string;
  try {
    source = config.quizClientSource ?? readQuizClientSource(config.quizClientPath ?? '');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return [
      createResult(
        2,
        'quiz client source can be read from quizClientPath',
        [`failed to read '${config.quizClientPath}': ${message}`]
      ),
    ];
  }

  const patternFor = config.renderPatternFor ?? defaultRenderPatternFor;
  const missingBranches = config.renderInteractiveCases.filter(
    type => !patternFor(type).test(source)
  );

  const branchRegex = /currentQuestion\.type\s*===\s*['"]([^'"]+)['"]/g;
  const referencedTypes = new Set<string>();
  let match: RegExpExecArray | null = null;
  while ((match = branchRegex.exec(source)) !== null) {
    const capturedType = match[1];
    if (capturedType) referencedTypes.add(capturedType);
  }

  const registered = new Set<string>(config.registeredTypes);
  const strayBranches = Array.from(referencedTypes).filter(type => !registered.has(type)).sort();

  return [
    createResult(
      2,
      'quiz client has a render branch for every configured interactive type',
      missingBranches.map(type => `quiz client is missing a render branch for '${type}'`)
    ),
    createResult(
      2,
      'every currentQuestion.type branch in the quiz client refers to a registered type',
      strayBranches.map(type => `quiz client dispatches unregistered type '${type}'`)
    ),
  ];
}

export function validateInteractivePayloadShape<TType extends string, TSubskill extends string = string>(
  config: WFHarnessConfig<TType, TSubskill>
): ValidationResult[] {
  const results: ValidationResult[] = [];

  for (const [type, spec] of Object.entries(config.interactivePayloadMap) as Array<
    [TType, WFHarnessPayloadSpec | undefined]
  >) {
    if (!spec) continue;

    const questionsOfType = config.questionPool.filter(question => question.type === type);
    if (questionsOfType.length === 0) continue;

    const missingPayload = questionsOfType
      .filter(question => question.interactive?.[spec.payloadKey] == null)
      .map(question => `${question.id}: missing interactive.${spec.payloadKey}`);

    const missingKeys: string[] = [];
    for (const question of questionsOfType) {
      const payload = question.interactive?.[spec.payloadKey];
      if (payload == null) continue;

      const brokenKeys = spec.requiredKeys.filter(key => !isNonEmpty(getByPath(payload, key)));
      if (brokenKeys.length > 0) {
        missingKeys.push(
          `${question.id}: interactive.${spec.payloadKey} is missing ${brokenKeys.join(', ')}`
        );
      }
    }

    results.push(
      createResult(
        3,
        `every ${type} question has interactive.${spec.payloadKey} populated`,
        missingPayload
      ),
      createResult(
        3,
        `every ${type} payload includes all required keys`,
        missingKeys
      )
    );
  }

  if (results.length > 0) {
    return results;
  }

  return [
    createResult(
      3,
      'interactive payload checks are skipped when no interactive payload specs apply to the current pool',
      []
    ),
  ];
}

export function validateBoundaryCheck<TType extends string, TSubskill extends string = string>(
  config: WFHarnessConfig<TType, TSubskill>
): ValidationResult[] {
  const payloadKeys = Array.from(
    new Set(
      Object.values(config.interactivePayloadMap)
        .filter((spec): spec is WFHarnessPayloadSpec => spec != null)
        .map(spec => spec.payloadKey)
    )
  );

  const dispatchTypes = new Set<string>(config.renderInteractiveCases);
  const interactiveTypeFailures: string[] = [];

  for (const question of config.questionPool) {
    if (!dispatchTypes.has(question.type)) continue;

    const spec = config.interactivePayloadMap[question.type];
    if (!spec) {
      interactiveTypeFailures.push(
        `${question.id}: renderInteractiveCases includes '${question.type}' but interactivePayloadMap has no matching payload spec`
      );
      continue;
    }

    const presentPayloads = payloadKeys.filter(payloadKey => question.interactive?.[payloadKey] != null);
    if (presentPayloads.length !== 1 || presentPayloads[0] !== spec.payloadKey) {
      interactiveTypeFailures.push(
        `${question.id}: expected only ${spec.payloadKey}, found [${presentPayloads.join(', ')}]`
      );
    }
  }

  const nonDispatchFailures: string[] = [];
  for (const question of config.questionPool) {
    if (dispatchTypes.has(question.type)) continue;

    const strayPayloads = payloadKeys.filter(payloadKey => question.interactive?.[payloadKey] != null);
    if (strayPayloads.length > 0) {
      nonDispatchFailures.push(
        `${question.id}: non-dispatch type '${question.type}' carries [${strayPayloads.join(', ')}]`
      );
    }
  }

  return [
    createResult(
      4,
      'interactive-dispatch questions carry exactly one matching payload',
      interactiveTypeFailures
    ),
    createResult(
      4,
      'non-dispatch questions carry none of the interactive payload keys',
      nonDispatchFailures
    ),
  ];
}

export function validateConceptConsistency<TType extends string, TSubskill extends string = string>(
  config: WFHarnessConfig<TType, TSubskill>
): ValidationResult[] {
  const idCounts = new Map<string, number>();
  for (const question of config.questionPool) {
    idCounts.set(question.id, (idCounts.get(question.id) ?? 0) + 1);
  }

  const duplicateIds = Array.from(idCounts.entries())
    .filter(([, count]) => count > 1)
    .map(([id]) => `duplicate question id '${id}'`)
    .sort();

  const missingFieldFailures: string[] = [];
  for (const question of config.questionPool) {
    const missingFields: string[] = [];
    if (!isNonEmpty(question.id)) missingFields.push('id');
    if (!isNonEmpty(question.type)) missingFields.push('type');
    if (!isNonEmpty(question.concept)) missingFields.push('concept');
    if (!isNonEmpty(question.question)) missingFields.push('question');
    if (!isNonEmpty(question.correctAnswer)) missingFields.push('correctAnswer');

    if (missingFields.length > 0) {
      missingFieldFailures.push(
        `${question.id || '(unknown)'}: missing ${missingFields.join(', ')}`
      );
    }
  }

  const conceptIds = new Set(config.conceptTree.map(concept => concept.id));
  const orphanConcepts = config.questionPool
    .filter(question => !conceptIds.has(question.concept))
    .map(question => `${question.id}: concept '${question.concept}' does not exist in conceptTree`);

  return [
    createResult(5, 'all question IDs are unique', duplicateIds),
    createResult(
      5,
      'every question has the required fields: id, type, concept, question, correctAnswer',
      missingFieldFailures
    ),
    createResult(
      5,
      'every question.concept resolves to a ConceptNode.id in conceptTree',
      orphanConcepts
    ),
  ];
}

export function validateGeneratorDeterminism<TType extends string, TSubskill extends string = string>(
  config: WFHarnessConfig<TType, TSubskill>
): ValidationResult[] {
  const registeredTypes = new Set<string>(config.registeredTypes);
  const conceptIds = new Set(config.conceptTree.map(concept => concept.id));

  const deterministicFailures: string[] = [];
  const validityFailures: string[] = [];
  const uniquenessFailures: string[] = [];

  for (const generator of config.generators) {
    for (const seed of WF_SAMPLE_SEEDS) {
      let firstQuestion: Question<TType>;
      let secondQuestion: Question<TType>;

      try {
        firstQuestion = generator.generate(seed);
        secondQuestion = generator.generate(seed);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        deterministicFailures.push(`${generator.id} threw for seed=${seed}: ${message}`);
        continue;
      }

      if (!isDeepStrictEqual(firstQuestion, secondQuestion)) {
        deterministicFailures.push(`${generator.id} is not deterministic for seed=${seed}`);
      }
    }

    let sampleQuestion: Question<TType>;
    try {
      sampleQuestion = generator.generate(7);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      validityFailures.push(`${generator.id} threw for seed=7: ${message}`);
      uniquenessFailures.push(`${generator.id} could not be sampled for uniqueness: ${message}`);
      continue;
    }

    if (!registeredTypes.has(sampleQuestion.type)) {
      validityFailures.push(`${generator.id} emitted unregistered type '${sampleQuestion.type}'`);
    }
    if (!conceptIds.has(sampleQuestion.concept)) {
      validityFailures.push(`${generator.id} emitted unknown concept '${sampleQuestion.concept}'`);
    }

    const generatedIds = new Set<string>();
    const uniquenessErrors: string[] = [];
    for (const seed of WF_SAMPLE_SEEDS) {
      try {
        generatedIds.add(generator.generate(seed).id);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        uniquenessErrors.push(`${generator.id} threw for seed=${seed}: ${message}`);
      }
    }

    if (uniquenessErrors.length > 0) {
      uniquenessFailures.push(...uniquenessErrors);
    } else if (generatedIds.size < 2) {
      uniquenessFailures.push(
        `${generator.id} only produced ${generatedIds.size} distinct ids across seeds ${WF_SAMPLE_SEEDS.join(', ')}`
      );
    }
  }

  return [
    createResult(
      6,
      'same seed produces deep-equal generator output',
      deterministicFailures
    ),
    createResult(
      6,
      'every generator emits a question with a registered type and known concept',
      validityFailures
    ),
    createResult(
      6,
      'different seeds produce at least two distinct generated question ids',
      uniquenessFailures
    ),
  ];
}

function getSchedulerConceptIds<TType extends string, TSubskill extends string>(
  config: WFHarnessConfig<TType, TSubskill>
): string[] {
  return config.conceptTree.map((concept) => concept.id);
}

function runSchedulerSteps<TSubskill extends string>(
  conceptIds: readonly string[],
  policy: SchedulerPolicy<TSubskill>,
  initialStored: unknown,
  steps: readonly SchedulerTransitionStep<TSubskill>[],
  scenarioName: string
): { failures: string[]; progressMap: ReturnType<typeof mergeConceptSchedule<TSubskill>> } {
  const failures: string[] = [];
  let progressMap = mergeConceptSchedule(conceptIds, initialStored, policy);

  for (const step of steps) {
    if (!(step.conceptId in progressMap)) {
      failures.push(`${scenarioName}: step references unknown concept '${step.conceptId}'`);
      continue;
    }

    progressMap = step.kind === 'outcome'
      ? applyConceptOutcome(progressMap, step.conceptId, step.outcome, step.currentTurn, {
          policy,
          subskillUpdates: step.subskillUpdates,
        })
      : applySupplementalConceptExposure(progressMap, step.conceptId, step.currentTurn, {
          policy,
          subskillUpdates: step.subskillUpdates,
          wasClean: step.wasClean,
        });
  }

  return { failures, progressMap };
}

export function validateSchedulerHarness<TType extends string, TSubskill extends string = string>(
  config: WFHarnessConfig<TType, TSubskill>
): ValidationResult[] {
  if (!config.scheduler) {
    return [
      createResult(
        7,
        'scheduler validation is skipped when scheduler config is omitted',
        []
      ),
    ];
  }

  let policy: SchedulerPolicy<TSubskill>;
  const policyFailures: string[] = [];
  try {
    policy = createSchedulerPolicy(config.scheduler.policy ?? {});
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return [
      createResult(
        7,
        'scheduler policy can be resolved',
        [`scheduler policy is invalid: ${message}`]
      ),
      createResult(
        7,
        'scheduler build/merge preserves the configured concept set',
        []
      ),
      createResult(
        7,
        'scheduler transition scenarios match expected state',
        []
      ),
      createResult(
        7,
        'scheduler selection scenarios choose the expected concept',
        []
      ),
    ];
  }

  const conceptIds = getSchedulerConceptIds(config);
  const conceptSetFailures: string[] = [];

  const initialSchedule = buildInitialConceptSchedule(conceptIds, policy);
  const initialIds = Object.keys(initialSchedule);
  if (!isDeepStrictEqual(initialIds, conceptIds)) {
    conceptSetFailures.push(
      `buildInitialConceptSchedule returned concept ids ${formatDiagnostic(initialIds)} instead of ${formatDiagnostic(conceptIds)}`
    );
  }

  const mergedSchedule = mergeConceptSchedule(conceptIds, {
    __wf_harness_orphan__: {
      independentPassCount: policy.masteryTarget + 1,
    },
  }, policy);
  const mergedIds = Object.keys(mergedSchedule);
  if (!isDeepStrictEqual(mergedIds, conceptIds)) {
    conceptSetFailures.push(
      `mergeConceptSchedule returned concept ids ${formatDiagnostic(mergedIds)} instead of ${formatDiagnostic(conceptIds)}`
    );
  }
  if ('__wf_harness_orphan__' in mergedSchedule) {
    conceptSetFailures.push('mergeConceptSchedule preserved an orphan stored concept');
  }

  const transitionFailures: string[] = [];
  for (const scenario of config.scheduler.transitionScenarios ?? []) {
    const run = runSchedulerSteps(
      conceptIds,
      policy,
      scenario.initialStored ?? {},
      scenario.steps,
      scenario.name
    );

    transitionFailures.push(...run.failures);
    for (const expectation of scenario.expectations) {
      const conceptState = run.progressMap[expectation.conceptId];
      if (!conceptState) {
        transitionFailures.push(
          `${scenario.name}: expectation references unknown concept '${expectation.conceptId}'`
        );
        continue;
      }

      const actual = getByPath(conceptState, expectation.path);
      if (!isDeepStrictEqual(actual, expectation.expected)) {
        transitionFailures.push(
          `${scenario.name}: ${expectation.conceptId}.${expectation.path} expected ${formatDiagnostic(expectation.expected)} but found ${formatDiagnostic(actual)}`
        );
      }
    }
  }

  const selectionFailures: string[] = [];
  for (const scenario of config.scheduler.selectionScenarios ?? []) {
    const run = runSchedulerSteps(
      conceptIds,
      policy,
      scenario.initialStored ?? {},
      scenario.steps ?? [],
      scenario.name
    );

    selectionFailures.push(...run.failures);
    const eligibleIds = scenario.eligibleConceptIds
      ? new Set(scenario.eligibleConceptIds)
      : null;

    const actual = pickNextConceptId(run.progressMap, scenario.nextTurn, {
      policy,
      isEligible: eligibleIds
        ? (conceptId) => eligibleIds.has(conceptId)
        : undefined,
    });

    if (actual !== scenario.expectedConceptId) {
      selectionFailures.push(
        `${scenario.name}: expected pickNextConceptId(...) to return '${scenario.expectedConceptId}' but found '${actual}'`
      );
    }
  }

  return [
    createResult(7, 'scheduler policy can be resolved', policyFailures),
    createResult(
      7,
      'scheduler build/merge preserves the configured concept set',
      conceptSetFailures
    ),
    createResult(
      7,
      'scheduler transition scenarios match expected state',
      transitionFailures
    ),
    createResult(
      7,
      'scheduler selection scenarios choose the expected concept',
      selectionFailures
    ),
  ];
}

export function validateQuestionQuality<TType extends string, TSubskill extends string = string>(
  config: WFHarnessConfig<TType, TSubskill>
): ValidationResult[] {
  if (!config.questionQuality) {
    return [
      createResult(
        8,
        'question quality validation is skipped when questionQuality config is omitted',
        []
      ),
    ];
  }

  const { items, rules } = config.questionQuality;
  const configFailures: string[] = [];
  if (items.length === 0) {
    configFailures.push('questionQuality.items must include at least one item');
  }
  if (rules.length === 0) {
    configFailures.push('questionQuality.rules must include at least one deterministic rule');
  }

  const ruleFailures: string[] = [];
  for (const rule of rules) {
    for (const item of items) {
      if ('pattern' in rule) {
        const surfaces = collectQuestionQualityText(item, rule.surfaces);
        for (const { surface, text } of surfaces) {
          rule.pattern.lastIndex = 0;
          if (rule.pattern.test(text)) {
            ruleFailures.push(
              `${item.id}: ${rule.issueClass} from ${rule.id} on ${surface}${rule.message ? ` (${rule.message})` : ''}`
            );
          }
        }
        continue;
      }

      for (const message of normalizePredicateResult(rule.evaluate(item))) {
        ruleFailures.push(
          `${item.id}: ${rule.issueClass} from ${rule.id}${message ? ` (${message})` : ''}`
        );
      }
    }
  }

  return [
    createResult(8, 'question quality config includes items and deterministic rules', configFailures),
    createResult(8, 'question quality items satisfy configured deterministic rules', ruleFailures),
  ];
}

export function validateAll<TType extends string, TSubskill extends string = string>(
  config: WFHarnessConfig<TType, TSubskill>
): ValidationResult[] {
  return [
    ...validateTypeCoverage(config),
    ...validateRenderDispatch(config),
    ...validateInteractivePayloadShape(config),
    ...validateBoundaryCheck(config),
    ...validateConceptConsistency(config),
    ...validateGeneratorDeterminism(config),
    ...validateSchedulerHarness(config),
    ...validateQuestionQuality(config),
  ];
}

export function groupValidationResults(results: readonly ValidationResult[]): ValidationGroup[] {
  const grouped = new Map<number, ValidationResult[]>();

  for (const result of results) {
    const groupResults = grouped.get(result.group);
    if (groupResults) {
      groupResults.push(result);
    } else {
      grouped.set(result.group, [result]);
    }
  }

  return Array.from(grouped.entries())
    .sort(([leftGroup], [rightGroup]) => leftGroup - rightGroup)
    .map(([group, groupResults]) => ({
      group,
      name: WF_GROUP_NAMES[group as keyof typeof WF_GROUP_NAMES] ?? `Group ${group}`,
      results: groupResults,
    }));
}
