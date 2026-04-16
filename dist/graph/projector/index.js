import { GRAPH_SCHEMA_VERSION, graphProjectionEnvelopeSchema, graphProjectionStateSchema, graphProjectionStatusSchema, projectionRunMetadataSchema, } from '../contracts/index.js';
import { normalizeNeo4jValue } from '../normalize.js';
const compactRecord = (value) => Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));
const runBatch = async (tx, batch) => {
    if (batch.rows.length === 0)
        return;
    await tx.run(batch.cypher, { rows: batch.rows });
};
const createProjectionRunCypher = `
  MERGE (run:ProjectionRun {projectionId: $projectionId})
  SET run.gameId = $gameId,
      run.sourceRepo = $sourceRepo,
      run.sourceCommitSha = $sourceCommitSha,
      run.contentHash = $contentHash,
      run.generatedAt = $generatedAt,
      run.schemaVersion = $schemaVersion,
      run.status = $status,
      run.startedAt = $startedAt,
      run.completedAt = $completedAt,
      run.isShared = false
`;
const updateProjectionRunStatusCypher = `
  MATCH (run:ProjectionRun {projectionId: $projectionId})
  SET run.status = $status,
      run.completedAt = $completedAt
`;
const upsertGamesCypher = `
  UNWIND $rows AS row
  MERGE (g:Game {gameId: row.gameId})
  SET g += row.props,
      g.gameId = row.gameId,
      g.projectionId = row.projectionId,
      g.contentHash = row.contentHash,
      g.schemaVersion = row.schemaVersion,
      g.isShared = false
`;
const upsertUnitsCypher = `
  UNWIND $rows AS row
  MERGE (u:Unit {gameId: row.gameId, unitId: row.unitId})
  SET u += row.props,
      u.gameId = row.gameId,
      u.unitId = row.unitId,
      u.projectionId = row.projectionId,
      u.contentHash = row.contentHash,
      u.schemaVersion = row.schemaVersion,
      u.isShared = false
`;
const upsertSectionsCypher = `
  UNWIND $rows AS row
  MERGE (s:Section {gameId: row.gameId, sectionId: row.sectionId})
  SET s += row.props,
      s.gameId = row.gameId,
      s.sectionId = row.sectionId,
      s.projectionId = row.projectionId,
      s.contentHash = row.contentHash,
      s.schemaVersion = row.schemaVersion,
      s.isShared = false
`;
const upsertObjectivesCypher = `
  UNWIND $rows AS row
  MERGE (o:Objective {gameId: row.gameId, objectiveId: row.objectiveId})
  SET o += row.props,
      o.gameId = row.gameId,
      o.objectiveId = row.objectiveId,
      o.projectionId = row.projectionId,
      o.contentHash = row.contentHash,
      o.schemaVersion = row.schemaVersion,
      o.isShared = false
`;
const upsertCanonicalConceptsCypher = `
  UNWIND $rows AS row
  MERGE (c:CanonicalConcept {canonicalConceptId: row.canonicalConceptId})
  SET c += row.props,
      c.canonicalConceptId = row.canonicalConceptId,
      c.isShared = true
`;
const upsertGameConceptsCypher = `
  UNWIND $rows AS row
  MERGE (c:GameConcept {gameId: row.gameId, gameConceptId: row.gameConceptId})
  SET c += row.props,
      c.gameId = row.gameId,
      c.gameConceptId = row.gameConceptId,
      c.projectionId = row.projectionId,
      c.contentHash = row.contentHash,
      c.schemaVersion = row.schemaVersion,
      c.isShared = false
`;
const upsertSubskillsCypher = `
  UNWIND $rows AS row
  MERGE (s:Subskill {subskillId: row.subskillId})
  SET s += row.props,
      s.subskillId = row.subskillId,
      s.isShared = true
`;
const upsertLadderTemplatesCypher = `
  UNWIND $rows AS row
  MERGE (l:LadderTemplate {gameId: row.gameId, ladderId: row.ladderId})
  SET l += row.props,
      l.gameId = row.gameId,
      l.ladderId = row.ladderId,
      l.projectionId = row.projectionId,
      l.contentHash = row.contentHash,
      l.schemaVersion = row.schemaVersion,
      l.isShared = false
`;
const upsertLadderStepsCypher = `
  UNWIND $rows AS row
  MERGE (s:LadderStep {gameId: row.gameId, stepId: row.stepId})
  SET s += row.props,
      s.gameId = row.gameId,
      s.stepId = row.stepId,
      s.projectionId = row.projectionId,
      s.contentHash = row.contentHash,
      s.schemaVersion = row.schemaVersion,
      s.isShared = false
`;
const upsertQuestionArtifactsCypher = `
  UNWIND $rows AS row
  MERGE (q:QuestionArtifact {gameId: row.gameId, questionId: row.questionId})
  SET q += row.props,
      q.gameId = row.gameId,
      q.questionId = row.questionId,
      q.projectionId = row.projectionId,
      q.contentHash = row.contentHash,
      q.schemaVersion = row.schemaVersion,
      q.isShared = false
`;
const linkGameOffersUnitCypher = `
  UNWIND $rows AS row
  MATCH (g:Game {gameId: row.gameId})
  MATCH (u:Unit {gameId: row.gameId, unitId: row.unitId})
  MERGE (g)-[rel:OFFERS {gameId: row.gameId, unitId: row.unitId}]->(u)
  SET rel.projectionId = row.projectionId,
      rel.contentHash = row.contentHash,
      rel.schemaVersion = row.schemaVersion,
      rel.isShared = false
`;
const linkUnitContainsSectionCypher = `
  UNWIND $rows AS row
  MATCH (u:Unit {gameId: row.gameId, unitId: row.unitId})
  MATCH (s:Section {gameId: row.gameId, sectionId: row.sectionId})
  MERGE (u)-[rel:CONTAINS {gameId: row.gameId, unitId: row.unitId, sectionId: row.sectionId}]->(s)
  SET rel.projectionId = row.projectionId,
      rel.contentHash = row.contentHash,
      rel.schemaVersion = row.schemaVersion,
      rel.isShared = false
`;
const linkSectionContainsObjectiveCypher = `
  UNWIND $rows AS row
  MATCH (s:Section {gameId: row.gameId, sectionId: row.sectionId})
  MATCH (o:Objective {gameId: row.gameId, objectiveId: row.objectiveId})
  MERGE (s)-[rel:CONTAINS {gameId: row.gameId, sectionId: row.sectionId, objectiveId: row.objectiveId}]->(o)
  SET rel.projectionId = row.projectionId,
      rel.contentHash = row.contentHash,
      rel.schemaVersion = row.schemaVersion,
      rel.isShared = false
`;
const linkObjectiveTeachesConceptCypher = `
  UNWIND $rows AS row
  MATCH (o:Objective {gameId: row.gameId, objectiveId: row.objectiveId})
  MATCH (c:GameConcept {gameId: row.gameId, gameConceptId: row.gameConceptId})
  MERGE (o)-[rel:TEACHES {gameId: row.gameId, objectiveId: row.objectiveId, gameConceptId: row.gameConceptId}]->(c)
  SET rel.projectionId = row.projectionId,
      rel.contentHash = row.contentHash,
      rel.schemaVersion = row.schemaVersion,
      rel.isShared = false
`;
const linkGameConceptInstanceOfCypher = `
  UNWIND $rows AS row
  MATCH (c:GameConcept {gameId: row.gameId, gameConceptId: row.gameConceptId})
  MATCH (canon:CanonicalConcept {canonicalConceptId: row.canonicalConceptId})
  MERGE (c)-[rel:INSTANCE_OF {gameId: row.gameId, gameConceptId: row.gameConceptId, canonicalConceptId: row.canonicalConceptId}]->(canon)
  SET rel.projectionId = row.projectionId,
      rel.contentHash = row.contentHash,
      rel.schemaVersion = row.schemaVersion,
      rel.isShared = false
`;
const linkGameConceptRequiresCypher = `
  UNWIND $rows AS row
  MATCH (c:GameConcept {gameId: row.gameId, gameConceptId: row.gameConceptId})
  MATCH (req:GameConcept {gameId: row.gameId, gameConceptId: row.requiredGameConceptId})
  MERGE (c)-[rel:REQUIRES {gameId: row.gameId, gameConceptId: row.gameConceptId, requiredGameConceptId: row.requiredGameConceptId}]->(req)
  SET rel.projectionId = row.projectionId,
      rel.contentHash = row.contentHash,
      rel.schemaVersion = row.schemaVersion,
      rel.isShared = false
`;
const linkGameConceptRelatedCypher = `
  UNWIND $rows AS row
  MATCH (c:GameConcept {gameId: row.gameId, gameConceptId: row.gameConceptId})
  MATCH (related:GameConcept {gameId: row.gameId, gameConceptId: row.relatedGameConceptId})
  MERGE (c)-[rel:RELATED_TO {gameId: row.gameId, gameConceptId: row.gameConceptId, relatedGameConceptId: row.relatedGameConceptId}]->(related)
  SET rel.projectionId = row.projectionId,
      rel.contentHash = row.contentHash,
      rel.schemaVersion = row.schemaVersion,
      rel.isShared = false
`;
const linkGameConceptTransferCypher = `
  UNWIND $rows AS row
  MATCH (c:GameConcept {gameId: row.gameId, gameConceptId: row.gameConceptId})
  MATCH (transfer:GameConcept {gameId: row.gameId, gameConceptId: row.transferGameConceptId})
  MERGE (c)-[rel:TRANSFER_TO {gameId: row.gameId, gameConceptId: row.gameConceptId, transferGameConceptId: row.transferGameConceptId}]->(transfer)
  SET rel.projectionId = row.projectionId,
      rel.contentHash = row.contentHash,
      rel.schemaVersion = row.schemaVersion,
      rel.isShared = false
`;
const linkGameConceptUsesSubskillCypher = `
  UNWIND $rows AS row
  MATCH (c:GameConcept {gameId: row.gameId, gameConceptId: row.gameConceptId})
  MATCH (s:Subskill {subskillId: row.subskillId})
  MERGE (c)-[rel:USES_SUBSKILL {gameId: row.gameId, gameConceptId: row.gameConceptId, subskillId: row.subskillId}]->(s)
  SET rel.projectionId = row.projectionId,
      rel.contentHash = row.contentHash,
      rel.schemaVersion = row.schemaVersion,
      rel.isShared = false
`;
const linkConceptHasLadderCypher = `
  UNWIND $rows AS row
  MATCH (c:GameConcept {gameId: row.gameId, gameConceptId: row.gameConceptId})
  MATCH (l:LadderTemplate {gameId: row.gameId, ladderId: row.ladderId})
  MERGE (c)-[rel:HAS_LADDER {gameId: row.gameId, gameConceptId: row.gameConceptId, ladderId: row.ladderId}]->(l)
  SET rel.projectionId = row.projectionId,
      rel.contentHash = row.contentHash,
      rel.schemaVersion = row.schemaVersion,
      rel.isShared = false
`;
const linkLadderHasStepCypher = `
  UNWIND $rows AS row
  MATCH (l:LadderTemplate {gameId: row.gameId, ladderId: row.ladderId})
  MATCH (s:LadderStep {gameId: row.gameId, stepId: row.stepId})
  MERGE (l)-[rel:HAS_STEP {gameId: row.gameId, ladderId: row.ladderId, stepId: row.stepId}]->(s)
  SET rel.projectionId = row.projectionId,
      rel.contentHash = row.contentHash,
      rel.schemaVersion = row.schemaVersion,
      rel.isShared = false
`;
const linkLadderStepNextCypher = `
  UNWIND $rows AS row
  MATCH (s:LadderStep {gameId: row.gameId, stepId: row.stepId})
  MATCH (n:LadderStep {gameId: row.gameId, stepId: row.nextStepId})
  MERGE (s)-[rel:NEXT {gameId: row.gameId, stepId: row.stepId, nextStepId: row.nextStepId}]->(n)
  SET rel.projectionId = row.projectionId,
      rel.contentHash = row.contentHash,
      rel.schemaVersion = row.schemaVersion,
      rel.isShared = false
`;
const linkLadderStepRepairsToCypher = `
  UNWIND $rows AS row
  MATCH (s:LadderStep {gameId: row.gameId, stepId: row.stepId})
  MATCH (repair:LadderStep {gameId: row.gameId, stepId: row.repairStepId})
  MERGE (s)-[rel:REPAIRS_TO {gameId: row.gameId, stepId: row.stepId, repairStepId: row.repairStepId}]->(repair)
  SET rel.projectionId = row.projectionId,
      rel.contentHash = row.contentHash,
      rel.schemaVersion = row.schemaVersion,
      rel.isShared = false
`;
const linkQuestionBelongsToObjectiveCypher = `
  UNWIND $rows AS row
  MATCH (q:QuestionArtifact {gameId: row.gameId, questionId: row.questionId})
  MATCH (o:Objective {gameId: row.gameId, objectiveId: row.objectiveId})
  MERGE (q)-[rel:BELONGS_TO {gameId: row.gameId, questionId: row.questionId, objectiveId: row.objectiveId}]->(o)
  SET rel.projectionId = row.projectionId,
      rel.contentHash = row.contentHash,
      rel.schemaVersion = row.schemaVersion,
      rel.isShared = false
`;
const linkQuestionAssessesConceptCypher = `
  UNWIND $rows AS row
  MATCH (q:QuestionArtifact {gameId: row.gameId, questionId: row.questionId})
  MATCH (c:GameConcept {gameId: row.gameId, gameConceptId: row.gameConceptId})
  MERGE (q)-[rel:ASSESSES {gameId: row.gameId, questionId: row.questionId, gameConceptId: row.gameConceptId}]->(c)
  SET rel.projectionId = row.projectionId,
      rel.contentHash = row.contentHash,
      rel.schemaVersion = row.schemaVersion,
      rel.isShared = false
`;
const linkQuestionTargetsStepCypher = `
  UNWIND $rows AS row
  MATCH (q:QuestionArtifact {gameId: row.gameId, questionId: row.questionId})
  MATCH (s:LadderStep {gameId: row.gameId, stepId: row.stepId})
  MERGE (q)-[rel:TARGETS_STEP {gameId: row.gameId, questionId: row.questionId, stepId: row.stepId}]->(s)
  SET rel.projectionId = row.projectionId,
      rel.contentHash = row.contentHash,
      rel.schemaVersion = row.schemaVersion,
      rel.isShared = false
`;
const linkQuestionUsesSubskillCypher = `
  UNWIND $rows AS row
  MATCH (q:QuestionArtifact {gameId: row.gameId, questionId: row.questionId})
  MATCH (s:Subskill {subskillId: row.subskillId})
  MERGE (q)-[rel:USES_SUBSKILL {gameId: row.gameId, questionId: row.questionId, subskillId: row.subskillId}]->(s)
  SET rel.projectionId = row.projectionId,
      rel.contentHash = row.contentHash,
      rel.schemaVersion = row.schemaVersion,
      rel.isShared = false
`;
const pruneStaleRelationshipsCypher = `
  MATCH ()-[rel]->()
  WHERE rel.gameId = $gameId
    AND coalesce(rel.isShared, false) = false
    AND rel.projectionId <> $projectionId
    AND type(rel) <> 'ACTIVE_PROJECTION'
  DELETE rel
`;
const pruneStaleNodesCypher = `
  MATCH (n)
  WHERE n.gameId = $gameId
    AND coalesce(n.isShared, false) = false
    AND n.projectionId <> $projectionId
  DETACH DELETE n
`;
const activateProjectionCypher = `
  MATCH (g:Game {gameId: $gameId})
  MATCH (run:ProjectionRun {projectionId: $projectionId})
  OPTIONAL MATCH (g)-[old:ACTIVE_PROJECTION]->(:ProjectionRun)
  DELETE old
  MERGE (g)-[rel:ACTIVE_PROJECTION {gameId: $gameId}]->(run)
  SET rel.projectionId = $projectionId,
      rel.contentHash = $contentHash,
      rel.schemaVersion = $schemaVersion,
      rel.isShared = false
`;
const clearGameRelationshipsCypher = `
  MATCH ()-[rel]->()
  WHERE rel.gameId = $gameId
    AND coalesce(rel.isShared, false) = false
  DELETE rel
`;
const clearGameNodesCypher = `
  MATCH (n)
  WHERE n.gameId = $gameId
    AND coalesce(n.isShared, false) = false
  DETACH DELETE n
`;
const readProjectionStateCypher = `
  MATCH (g:Game {gameId: $gameId})
  OPTIONAL MATCH (g)-[:ACTIVE_PROJECTION]->(run:ProjectionRun)
  RETURN $gameId AS gameId,
         run.projectionId AS activeProjectionId,
         run.contentHash AS activeContentHash,
         run.schemaVersion AS activeSchemaVersion,
         run.status AS activeStatus,
         run.startedAt AS startedAt,
         run.completedAt AS completedAt
`;
const buildStampedRows = (envelope, rows) => rows.map((row) => compactRecord({
    ...row,
    projectionId: envelope.projectionId,
    contentHash: envelope.contentHash,
    schemaVersion: envelope.schemaVersion,
}));
export class Neo4jGraphProjector {
    client;
    constructor(client) {
        this.client = client;
    }
    async applyProjection(input) {
        const envelope = graphProjectionEnvelopeSchema.parse(input);
        const startedAt = new Date().toISOString();
        const baseMetadata = projectionRunMetadataSchema.parse({
            projectionId: envelope.projectionId,
            gameId: envelope.gameId,
            sourceRepo: envelope.sourceRepo,
            sourceCommitSha: envelope.sourceCommitSha,
            contentHash: envelope.contentHash,
            generatedAt: envelope.generatedAt,
            schemaVersion: envelope.schemaVersion,
            status: 'started',
            startedAt,
            completedAt: null,
        });
        const session = this.client.session('WRITE');
        try {
            await session.executeWrite((tx) => tx.run(createProjectionRunCypher, baseMetadata));
            await session.executeWrite(async (tx) => {
                const gameRows = buildStampedRows(envelope, envelope.games.map((game) => ({
                    gameId: game.gameId,
                    props: compactRecord({
                        label: game.label,
                        description: game.description,
                    }),
                })));
                const unitRows = buildStampedRows(envelope, envelope.units.map((unit) => ({
                    gameId: unit.gameId,
                    unitId: unit.unitId,
                    props: compactRecord({
                        label: unit.label,
                        ordinal: unit.ordinal,
                        description: unit.description,
                    }),
                })));
                const sectionRows = buildStampedRows(envelope, envelope.sections.map((section) => ({
                    gameId: section.gameId,
                    sectionId: section.sectionId,
                    props: compactRecord({
                        unitId: section.unitId,
                        label: section.label,
                        ordinal: section.ordinal,
                        description: section.description,
                    }),
                })));
                const objectiveRows = buildStampedRows(envelope, envelope.objectives.map((objective) => ({
                    gameId: objective.gameId,
                    objectiveId: objective.objectiveId,
                    props: compactRecord({
                        unitId: objective.unitId,
                        sectionId: objective.sectionId,
                        label: objective.label,
                        description: objective.description,
                        requiredForCompletion: objective.requiredForCompletion,
                        sourceMode: objective.sourceMode,
                        sourceRefs: objective.sourceRefs,
                    }),
                })));
                const canonicalConceptRows = envelope.canonicalConcepts.map((concept) => ({
                    canonicalConceptId: concept.canonicalConceptId,
                    props: compactRecord({
                        label: concept.label,
                        description: concept.description,
                        domain: concept.domain,
                    }),
                }));
                const gameConceptRows = buildStampedRows(envelope, envelope.gameConcepts.map((concept) => ({
                    gameId: concept.gameId,
                    gameConceptId: concept.gameConceptId,
                    props: compactRecord({
                        label: concept.label,
                        description: concept.description,
                    }),
                })));
                const subskillRows = envelope.subskills.map((subskill) => ({
                    subskillId: subskill.subskillId,
                    props: compactRecord({
                        label: subskill.label,
                        description: subskill.description,
                    }),
                }));
                const ladderTemplateRows = buildStampedRows(envelope, envelope.ladderTemplates.map((ladder) => ({
                    gameId: ladder.gameId,
                    ladderId: ladder.ladderId,
                    props: compactRecord({
                        gameConceptId: ladder.gameConceptId,
                        completionStepId: ladder.completionStepId,
                        masteryStepId: ladder.masteryStepId,
                        retentionStepId: ladder.retentionStepId,
                        repairStepId: ladder.repairStepId,
                    }),
                })));
                const ladderStepRows = buildStampedRows(envelope, envelope.ladderSteps.map((step) => ({
                    gameId: step.gameId,
                    stepId: step.stepId,
                    props: compactRecord({
                        ladderId: step.ladderId,
                        layer: step.layer,
                        ordinal: step.ordinal,
                        supportPolicy: step.supportPolicy,
                        completionCredit: step.completionCredit,
                        masteryCredit: step.masteryCredit,
                    }),
                })));
                const questionArtifactRows = buildStampedRows(envelope, envelope.questionArtifacts.map((question) => ({
                    gameId: question.gameId,
                    questionId: question.questionId,
                    props: compactRecord({
                        unitId: question.unitId,
                        sectionId: question.sectionId,
                        objectiveId: question.objectiveId,
                        conceptIds: question.conceptIds,
                        targetStepIds: question.targetStepIds,
                        subskills: question.subskills,
                        variantFamily: question.variantFamily,
                        difficultyTag: question.difficultyTag,
                        canonicalSignature: question.canonicalSignature,
                        promptHash: question.promptHash,
                        sourceRef: question.sourceRef,
                        promptMirror: question.promptMirror,
                        explanationMirror: question.explanationMirror,
                    }),
                })));
                const unitContainmentRows = buildStampedRows(envelope, envelope.sections.map((section) => ({
                    gameId: section.gameId,
                    unitId: section.unitId,
                    sectionId: section.sectionId,
                })));
                const objectiveContainmentRows = buildStampedRows(envelope, envelope.objectives.map((objective) => ({
                    gameId: objective.gameId,
                    sectionId: objective.sectionId,
                    objectiveId: objective.objectiveId,
                })));
                const gameOfferRows = buildStampedRows(envelope, envelope.units.map((unit) => ({
                    gameId: unit.gameId,
                    unitId: unit.unitId,
                })));
                const instanceRows = buildStampedRows(envelope, envelope.gameConcepts
                    .filter((concept) => concept.canonicalConceptId)
                    .map((concept) => ({
                    gameId: concept.gameId,
                    gameConceptId: concept.gameConceptId,
                    canonicalConceptId: concept.canonicalConceptId,
                })));
                await runBatch(tx, { name: 'games', rows: gameRows, cypher: upsertGamesCypher });
                await runBatch(tx, { name: 'units', rows: unitRows, cypher: upsertUnitsCypher });
                await runBatch(tx, { name: 'sections', rows: sectionRows, cypher: upsertSectionsCypher });
                await runBatch(tx, { name: 'objectives', rows: objectiveRows, cypher: upsertObjectivesCypher });
                await runBatch(tx, { name: 'canonicalConcepts', rows: canonicalConceptRows, cypher: upsertCanonicalConceptsCypher });
                await runBatch(tx, { name: 'gameConcepts', rows: gameConceptRows, cypher: upsertGameConceptsCypher });
                await runBatch(tx, { name: 'subskills', rows: subskillRows, cypher: upsertSubskillsCypher });
                await runBatch(tx, { name: 'ladderTemplates', rows: ladderTemplateRows, cypher: upsertLadderTemplatesCypher });
                await runBatch(tx, { name: 'ladderSteps', rows: ladderStepRows, cypher: upsertLadderStepsCypher });
                await runBatch(tx, { name: 'questionArtifacts', rows: questionArtifactRows, cypher: upsertQuestionArtifactsCypher });
                await runBatch(tx, { name: 'gameOffersUnit', rows: gameOfferRows, cypher: linkGameOffersUnitCypher });
                await runBatch(tx, { name: 'unitContainsSection', rows: unitContainmentRows, cypher: linkUnitContainsSectionCypher });
                await runBatch(tx, { name: 'sectionContainsObjective', rows: objectiveContainmentRows, cypher: linkSectionContainsObjectiveCypher });
                await runBatch(tx, { name: 'objectiveTeachesConcept', rows: buildStampedRows(envelope, envelope.objectiveTeachesConcept), cypher: linkObjectiveTeachesConceptCypher });
                await runBatch(tx, { name: 'instanceOf', rows: instanceRows, cypher: linkGameConceptInstanceOfCypher });
                await runBatch(tx, { name: 'requires', rows: buildStampedRows(envelope, envelope.gameConceptRequires), cypher: linkGameConceptRequiresCypher });
                await runBatch(tx, { name: 'related', rows: buildStampedRows(envelope, envelope.gameConceptRelated), cypher: linkGameConceptRelatedCypher });
                await runBatch(tx, { name: 'transfer', rows: buildStampedRows(envelope, envelope.gameConceptTransfer), cypher: linkGameConceptTransferCypher });
                await runBatch(tx, { name: 'gameConceptUsesSubskill', rows: buildStampedRows(envelope, envelope.gameConceptUsesSubskill), cypher: linkGameConceptUsesSubskillCypher });
                await runBatch(tx, { name: 'conceptHasLadder', rows: buildStampedRows(envelope, envelope.conceptHasLadder), cypher: linkConceptHasLadderCypher });
                await runBatch(tx, { name: 'ladderHasStep', rows: buildStampedRows(envelope, envelope.ladderHasStep), cypher: linkLadderHasStepCypher });
                await runBatch(tx, { name: 'ladderStepNext', rows: buildStampedRows(envelope, envelope.ladderStepNext), cypher: linkLadderStepNextCypher });
                await runBatch(tx, { name: 'ladderStepRepairsTo', rows: buildStampedRows(envelope, envelope.ladderStepRepairsTo), cypher: linkLadderStepRepairsToCypher });
                await runBatch(tx, { name: 'questionBelongsToObjective', rows: buildStampedRows(envelope, envelope.questionBelongsToObjective), cypher: linkQuestionBelongsToObjectiveCypher });
                await runBatch(tx, { name: 'questionAssessesConcept', rows: buildStampedRows(envelope, envelope.questionAssessesConcept), cypher: linkQuestionAssessesConceptCypher });
                await runBatch(tx, { name: 'questionTargetsStep', rows: buildStampedRows(envelope, envelope.questionTargetsStep), cypher: linkQuestionTargetsStepCypher });
                await runBatch(tx, { name: 'questionUsesSubskill', rows: buildStampedRows(envelope, envelope.questionUsesSubskill), cypher: linkQuestionUsesSubskillCypher });
            });
            await session.executeWrite((tx) => tx.run(updateProjectionRunStatusCypher, {
                projectionId: envelope.projectionId,
                status: graphProjectionStatusSchema.parse('applied'),
                completedAt: null,
            }));
            await session.executeWrite(async (tx) => {
                await tx.run(pruneStaleRelationshipsCypher, {
                    gameId: envelope.gameId,
                    projectionId: envelope.projectionId,
                });
                await tx.run(pruneStaleNodesCypher, {
                    gameId: envelope.gameId,
                    projectionId: envelope.projectionId,
                });
                await tx.run(activateProjectionCypher, {
                    gameId: envelope.gameId,
                    projectionId: envelope.projectionId,
                    contentHash: envelope.contentHash,
                    schemaVersion: envelope.schemaVersion,
                });
            });
            const completedAt = new Date().toISOString();
            const metadata = projectionRunMetadataSchema.parse({
                ...baseMetadata,
                status: 'reconciled',
                completedAt,
            });
            await session.executeWrite((tx) => tx.run(updateProjectionRunStatusCypher, metadata));
            return metadata;
        }
        catch (error) {
            const failedAt = new Date().toISOString();
            await session.executeWrite((tx) => tx.run(updateProjectionRunStatusCypher, {
                projectionId: envelope.projectionId,
                status: 'failed',
                completedAt: failedAt,
            }));
            throw error;
        }
        finally {
            await session.close();
        }
    }
    async clearGameGraph(gameId) {
        const session = this.client.session('WRITE');
        try {
            await session.executeWrite(async (tx) => {
                await tx.run(clearGameRelationshipsCypher, { gameId });
                await tx.run(clearGameNodesCypher, { gameId });
            });
        }
        finally {
            await session.close();
        }
    }
    async getGameProjectionState(gameId) {
        const session = this.client.session('READ');
        try {
            const result = await session.executeRead((tx) => tx.run(readProjectionStateCypher, { gameId }));
            const first = result.records[0];
            if (!first) {
                return graphProjectionStateSchema.parse({
                    gameId,
                    activeProjectionId: null,
                    activeContentHash: null,
                    activeSchemaVersion: null,
                    activeStatus: null,
                    startedAt: null,
                    completedAt: null,
                });
            }
            return graphProjectionStateSchema.parse({
                gameId: normalizeNeo4jValue(first.get('gameId')),
                activeProjectionId: normalizeNeo4jValue(first.get('activeProjectionId')),
                activeContentHash: normalizeNeo4jValue(first.get('activeContentHash')),
                activeSchemaVersion: normalizeNeo4jValue(first.get('activeSchemaVersion')),
                activeStatus: normalizeNeo4jValue(first.get('activeStatus')),
                startedAt: normalizeNeo4jValue(first.get('startedAt')),
                completedAt: normalizeNeo4jValue(first.get('completedAt')),
            });
        }
        finally {
            await session.close();
        }
    }
}
export const createProjectionEnvelopeMetadata = (input) => projectionRunMetadataSchema.parse({
    ...input,
    schemaVersion: input.schemaVersion ?? GRAPH_SCHEMA_VERSION,
    status: 'started',
});
//# sourceMappingURL=index.js.map