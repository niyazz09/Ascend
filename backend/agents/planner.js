/**
 * Mastery threshold constant.
 * Topics with mastery >= MASTERY_THRESHOLD are considered completed.
 */
const MASTERY_THRESHOLD = 80;

/**
 * Generates an ordered learning roadmap from a learner's goal, state, and topics.
 *
 * Uses a DFS-based Topological Sort to resolve dependencies, detect cycles,
 * and identify missing prerequisites.
 *
 * @param {Object} params
 * @param {string} params.goal - The target learning goal (e.g. "Frontend Developer")
 * @param {Object} [params.learnerState={}] - The current state of the learner
 * @param {Object} [params.learnerState.mastery] - Map of topic ID to mastery level (0-100)
 * @param {Array<Object>} [params.topics=[]] - The list of available topics
 * @returns {Object} Structured roadmap, completed/remaining topics, progress, and estimated steps
 */
function generateRoadmap({ goal, learnerState = {}, topics = [] }) {
  // Return empty if no topics are generated/available
  if (!topics || topics.length === 0) {
    return {
      goal: goal || "",
      roadmap: [],
      completedTopics: [],
      remainingTopics: [],
      estimatedSteps: 0,
      progressPercentage: 0.0,
      message: "Unknown goal"
    };
  }

  const mastery = learnerState.mastery || {};
  const topicMap = new Map(topics.map(t => [t.id, t]));
  const adjList = new Map();

  // Initialize adjacency list
  for (const topic of topics) {
    adjList.set(topic.id, []);
  }

  // Build dependency graph and validate that prerequisites exist
  for (const topic of topics) {
    for (const prereqId of topic.prerequisites) {
      if (!topicMap.has(prereqId)) {
        throw new Error("Invalid graph: missing prerequisite");
      }
      adjList.get(prereqId).push(topic.id);
    }
  }

  const visited = new Set();
  const visiting = new Set();
  const sorted = [];

  // DFS traversal with cycle detection
  function visit(nodeId) {
    if (visiting.has(nodeId)) {
      throw new Error("Invalid graph: cycle detected");
    }
    if (!visited.has(nodeId)) {
      visiting.add(nodeId);
      const neighbors = adjList.get(nodeId) || [];
      for (const neighborId of neighbors) {
        visit(neighborId);
      }
      visiting.delete(nodeId);
      visited.add(nodeId);
      sorted.push(nodeId);
    }
  }

  // Traverse all nodes to ensure complete topological ordering
  for (const topic of topics) {
    visit(topic.id);
  }

  // Reverse sorted nodes to go from dependencies to descendants (source-to-sink)
  const topologicalOrder = sorted.reverse();

  const roadmap = [];
  const completedTopics = [];
  const remainingTopics = [];

  for (const topicId of topologicalOrder) {
    const topic = topicMap.get(topicId);
    const score = mastery[topicId] !== undefined ? mastery[topicId] : 0;
    const isCompleted = score >= MASTERY_THRESHOLD;

    let status = "locked";
    if (isCompleted) {
      status = "completed";
      completedTopics.push(topicId);
    } else {
      // Topic is "next" if all prerequisites are completed, otherwise "locked"
      const allPrereqsDone = topic.prerequisites.every(
        prereqId => (mastery[prereqId] !== undefined ? mastery[prereqId] : 0) >= MASTERY_THRESHOLD
      );
      status = allPrereqsDone ? "next" : "locked";
      remainingTopics.push(topicId);
    }

    roadmap.push({
      topicId: topic.id,
      title: topic.title,
      prerequisites: topic.prerequisites,
      status,
      resources: topic.resources
    });
  }

  const totalTopics = topics.length;
  const progressPercentage = totalTopics > 0 
    ? Math.round((completedTopics.length / totalTopics) * 100 * 10) / 10 
    : 0.0;

  return {
    goal,
    roadmap,
    completedTopics,
    remainingTopics,
    estimatedSteps: remainingTopics.length,
    progressPercentage
  };
}

module.exports = {
  generateRoadmap,
  MASTERY_THRESHOLD
};
