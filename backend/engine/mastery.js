/**
 * Default learning rate constant.
 * Parameterized to support adaptability tuning.
 */
const DEFAULT_K = 15;

/**
 * Updates learner mastery level based on question result using a modified Elo-inspired algorithm.
 *
 * The mathematical model is:
 *   expectedPerformance = currentMastery / 100
 *   actualPerformance = correct ? 1 : 0
 *   difficultyWeight = difficulty / 100
 *   delta = K * difficultyWeight * (actualPerformance - expectedPerformance)
 *   newScore = clamp(currentMastery + delta, 0, 100)
 *
 * @param {Object} params
 * @param {Object} params.learnerState - The learner state containing the mastery map
 * @param {string} params.topicId - The ID of the topic being assessed
 * @param {Object} params.questionResult - The result of the question
 * @param {number} params.questionResult.difficulty - Difficulty score of the question (0-100)
 * @param {boolean} params.questionResult.correct - Whether the learner answered correctly
 * @param {string} params.questionResult.questionType - Type of the question (e.g. "mcq")
 * @param {number} params.questionResult.timestamp - Unix timestamp of the question attempt
 * @param {number} [params.k=15] - Configurable K-factor for mastery update sensitivity
 * @returns {Object} Canonical mastery result and evidence record
 */
function expectedScore(mastery, difficulty, scale = 20) {
  return 1 / (1 + Math.pow(10, (difficulty - mastery) / scale));
}

function updateMastery({ learnerState, topicId, questionResult, k = DEFAULT_K }) {
  if (!learnerState) {
    learnerState = {};
  }
  if (!learnerState.mastery) {
    learnerState.mastery = {};
  }

  const previousScore = learnerState.mastery[topicId] !== undefined ? learnerState.mastery[topicId] : 0;
  const { difficulty, correct, questionType, timestamp } = questionResult;

  const expectedPerformance = expectedScore(previousScore, difficulty);
  const actualPerformance = correct ? 1 : 0;

  // Calculate mastery delta using the new logistic expected-score model
  let delta = k * (actualPerformance - expectedPerformance);
  delta = Math.round(delta * 100) / 100;

  // Clamp the new score between 0 and 100 and round to 2 decimal places
  const rawNewScore = previousScore + delta;
  const newScore = Math.round(Math.min(100, Math.max(0, rawNewScore)) * 100) / 100;

  // Update learner state in place
  learnerState.mastery[topicId] = newScore;

  // Generate canonical evidence record
  const evidence = {
    topicId,
    timestamp,
    questionType,
    difficulty,
    correct,
    previousScore,
    delta,
    newScore
  };

  return {
    previousScore,
    expectedPerformance,
    actualPerformance,
    delta,
    newScore,
    evidence
  };
}

module.exports = {
  updateMastery,
  DEFAULT_K
};
