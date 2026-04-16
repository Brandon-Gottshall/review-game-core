import type { GraphClient } from '../client.js';
import { type ConceptLadder, type ConceptPrerequisite, type CrossGameCanonicalMatch, type GraphProjectionState, type ObjectiveConcepts, type QuestionArtifactSummary } from '../contracts/index.js';
export interface GraphDomainReader {
    getConceptPrerequisites(gameId: string, conceptId: string): Promise<ConceptPrerequisite | null>;
    getConceptLadder(gameId: string, conceptId: string): Promise<ConceptLadder | null>;
    getQuestionArtifactsForStep(gameId: string, conceptId: string, stepLayer: string): Promise<QuestionArtifactSummary[]>;
    getObjectiveConcepts(gameId: string, objectiveId: string): Promise<ObjectiveConcepts | null>;
    getCrossGameCanonicalMatches(canonicalConceptId: string): Promise<CrossGameCanonicalMatch[]>;
    getGameProjectionState(gameId: string): Promise<GraphProjectionState>;
}
export declare class Neo4jGraphDomainReader implements GraphDomainReader {
    private readonly client;
    constructor(client: GraphClient);
    getConceptPrerequisites(gameId: string, conceptId: string): Promise<ConceptPrerequisite | null>;
    getConceptLadder(gameId: string, conceptId: string): Promise<ConceptLadder | null>;
    getQuestionArtifactsForStep(gameId: string, conceptId: string, stepLayer: string): Promise<QuestionArtifactSummary[]>;
    getObjectiveConcepts(gameId: string, objectiveId: string): Promise<ObjectiveConcepts | null>;
    getCrossGameCanonicalMatches(canonicalConceptId: string): Promise<CrossGameCanonicalMatch[]>;
    getGameProjectionState(gameId: string): Promise<GraphProjectionState>;
}
//# sourceMappingURL=domain.d.ts.map