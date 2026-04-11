/**
 * Concept tree primitives — prerequisite-gated skill tree for review games.
 *
 * Core responsibilities:
 *   - Shape of a ConceptNode
 *   - Mastery math (fraction correct across a concept's questions)
 *   - Unlock logic (all prerequisites must be mastered)
 *   - Populate-from-pool helper
 *
 * The 0.7 mastery threshold is the default used by cs1301-review-game; games
 * that want a different value can call the lower-level functions and compare
 * against their own constant, or shadow MASTERY_THRESHOLD locally.
 */
/** Default mastery threshold (70%) used by cs1301-review-game. */
export const MASTERY_THRESHOLD = 0.7;
/**
 * Fraction-correct across all attempts on a concept's questions.
 * Returns 0 when there are no attempts yet.
 */
export function getConceptMastery(_conceptId, questionIds, masteryData) {
    if (questionIds.length === 0)
        return 0;
    let totalCorrect = 0;
    let totalAttempts = 0;
    for (const qId of questionIds) {
        const data = masteryData[qId];
        if (data) {
            totalCorrect += data.correct;
            totalAttempts += data.total;
        }
    }
    if (totalAttempts === 0)
        return 0;
    return totalCorrect / totalAttempts;
}
/**
 * A concept unlocks once every prerequisite is at or above the threshold.
 * Root concepts (no prerequisites) are always unlocked.
 */
export function isConceptUnlocked(conceptId, tree, masteryData, threshold = MASTERY_THRESHOLD) {
    const concept = tree.find(c => c.id === conceptId);
    if (!concept)
        return false;
    if (concept.prerequisites.length === 0)
        return true;
    for (const prereqId of concept.prerequisites) {
        const prereq = tree.find(c => c.id === prereqId);
        if (!prereq)
            continue;
        const mastery = getConceptMastery(prereqId, prereq.questionIds, masteryData);
        if (mastery < threshold)
            return false;
    }
    return true;
}
/** Flatten all question ids from every currently-unlocked concept. */
export function getUnlockedQuestionIds(tree, masteryData, threshold = MASTERY_THRESHOLD) {
    const unlocked = [];
    for (const concept of tree) {
        if (isConceptUnlocked(concept.id, tree, masteryData, threshold)) {
            unlocked.push(...concept.questionIds);
        }
    }
    return unlocked;
}
/** Ids of concepts at or above the threshold. */
export function getMasteredConcepts(tree, masteryData, threshold = MASTERY_THRESHOLD) {
    return tree
        .filter(c => getConceptMastery(c.id, c.questionIds, masteryData) >= threshold)
        .map(c => c.id);
}
/** Concepts that are unlocked but not yet mastered — what to study next. */
export function getNextUnlockedConcepts(tree, masteryData, threshold = MASTERY_THRESHOLD) {
    return tree.filter(concept => {
        const unlocked = isConceptUnlocked(concept.id, tree, masteryData, threshold);
        const mastery = getConceptMastery(concept.id, concept.questionIds, masteryData);
        return unlocked && mastery < threshold;
    });
}
export function calculateTreeProgress(tree, masteryData, threshold = MASTERY_THRESHOLD) {
    let mastered = 0;
    let unlocked = 0;
    let locked = 0;
    for (const concept of tree) {
        const isUnlocked = isConceptUnlocked(concept.id, tree, masteryData, threshold);
        const mastery = getConceptMastery(concept.id, concept.questionIds, masteryData);
        if (mastery >= threshold) {
            mastered++;
            unlocked++;
        }
        else if (isUnlocked) {
            unlocked++;
        }
        else {
            locked++;
        }
    }
    return {
        totalConcepts: tree.length,
        masteredConcepts: mastered,
        unlockedConcepts: unlocked,
        lockedConcepts: locked,
        percentComplete: tree.length > 0 ? (mastered / tree.length) * 100 : 0,
    };
}
/**
 * Wire a question pool into a concept tree by matching `q.concept` to
 * `ConceptNode.id`. Returns a new tree with `questionIds` populated.
 *
 * Questions whose `concept` doesn't match any node are silently dropped —
 * the WF harness catches those.
 */
export function populateConceptQuestions(tree, questions) {
    const populated = tree.map(c => ({ ...c, questionIds: [] }));
    for (const q of questions) {
        const concept = populated.find(c => c.id === q.concept);
        if (concept)
            concept.questionIds.push(q.id);
    }
    return populated;
}
//# sourceMappingURL=index.js.map