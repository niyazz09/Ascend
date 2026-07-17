const express = require('express');
const router = express.Router();
const { generateRoadmap } = require('../agents/planner');
const { getLearner, createLearner } = require('../store');
const topics = require('../data/topics.json');

router.post('/', (req, res) => {
  try {
    const { goal } = req.body;
    let learner = getLearner("default-learner");
    if (!learner) {
      learner = createLearner("default-learner");
    }

    const roadmap = generateRoadmap({ goal, learnerState: learner, topics });
    res.json(roadmap);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
