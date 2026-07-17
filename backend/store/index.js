const learners = new Map();

function createLearner(id, data = {}) {
  const learner = { id, ...data };
  learners.set(id, learner);
  return learner;
}

function getLearner(id) {
  return learners.get(id) || null;
}

function saveLearner(id, data) {
  learners.set(id, data);
  return data;
}

module.exports = {
  createLearner,
  getLearner,
  saveLearner
};
