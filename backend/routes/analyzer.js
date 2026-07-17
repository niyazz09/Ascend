const express = require('express');
const router = express.Router();
const { analyzeLearner } = require('../agents/analyzer');
const { generateRoadmap } = require('../agents/planner');
const { getLearner, createLearner } = require('../store');
const topics = require('../data/topics.json');

router.get('/', (req, res) => {
  try {
    let learner = getLearner("default-learner");
    if (!learner) {
      learner = createLearner("default-learner");
    }

    // Re-generate current roadmap to get correct progress and next/locked statuses
    const roadmap = generateRoadmap({ goal: "Frontend Developer", learnerState: learner, topics });

    // Run analyzer
    const analysis = analyzeLearner({
      learnerState: learner,
      roadmap,
      evidenceLog: learner.evidenceLog || []
    });

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
