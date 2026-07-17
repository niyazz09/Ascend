/**
 * Analyzes a learner's current mastery state and evidence history to generate recommendations.
 *
 * Decoupled from the mathematical internals of the Mastery Engine, this function
 * operates on the static evidence log format to extract insights.
 *
 * @param {Object} params
 * @param {Object} params.learnerState - Current state of the learner containing the mastery map
 * @param {Object} params.roadmap - Structured roadmap returned by the Planner Agent
 * @param {Array<Object>} params.evidenceLog - Historical log of question attempts and mastery deltas
 * @returns {Object} Analytical summary and learning recommendations
 */
function analyzeLearner({ learnerState = {}, roadmap = {}, evidenceLog = [] }) {
  const mastery = learnerState.mastery || {};
  const roadmapItems = roadmap.roadmap || [];

  const completedTopics = roadmap.completedTopics || [];
  const progressPercentage = roadmap.progressPercentage !== undefined ? roadmap.progressPercentage : 0.0;

  const weakTopics = [];
  const strongTopics = [];

  // Classify topics based on mastery score thresholds
  for (const [topicId, score] of Object.entries(mastery)) {
    if (score < 50) {
      weakTopics.push(topicId);
    } else if (score >= 80) {
      strongTopics.push(topicId);
    }
  }

  // Group evidence by topic ID to evaluate historical trends
  const evidenceMap = {};
  for (const record of evidenceLog) {
    if (!evidenceMap[record.topicId]) {
      evidenceMap[record.topicId] = [];
    }
    evidenceMap[record.topicId].push(record);
  }

  const reviewTopics = [];

  // Detect topics with declining performance (2 consecutive negative deltas)
  for (const [topicId, records] of Object.entries(evidenceMap)) {
    const sortedRecords = [...records].sort((a, b) => b.timestamp - a.timestamp);
    if (sortedRecords.length >= 2) {
      if (sortedRecords[0].delta < 0 && sortedRecords[1].delta < 0) {
        reviewTopics.push(topicId);
      }
    }
  }

  // Find the first roadmap topic with "next" status
  const nextTopicItem = roadmapItems.find(item => item.status === "next");
  const nextTopic = nextTopicItem ? nextTopicItem.topicId : null;

  // Focus areas are the union of weak topics and topics flagged for review
  const focusAreas = Array.from(new Set([...weakTopics, ...reviewTopics]));

  return {
    summary: {
      completedTopics,
      weakTopics,
      strongTopics,
      progressPercentage
    },
    recommendations: {
      nextTopic,
      reviewTopics,
      focusAreas
    }
  };
}

module.exports = {
  analyzeLearner
};
