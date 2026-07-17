const express = require('express');
const router = express.Router();
const { orchestrate } = require('../agents/orchestrator');
const { getLearner, createLearner, saveLearner } = require('../store');
const topics = require('../data/topics.json');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { input, additionalParams } = req.body;
    const userId = req.user.id;

    if (!input) {
      return res.status(400).json({ error: "Missing 'input' field" });
    }

    let learner = await getLearner(userId);
    if (!learner) {
      learner = await createLearner(userId);
    }

    const result = await orchestrate({
      userId,
      input,
      learnerState: learner,
      topics,
      additionalParams: additionalParams || {}
    });

    // If MasteryEngine executed, update the persistent DB store
    if (result.executedAgents.includes("MasteryEngine") && result.masteryUpdate) {
      const updatedLearner = await getLearner(userId);
      updatedLearner.mastery = updatedLearner.mastery || {};
      updatedLearner.mastery[additionalParams.topicId] = result.masteryUpdate.newScore;

      if (!updatedLearner.evidenceLog) {
        updatedLearner.evidenceLog = [];
      }
      updatedLearner.evidenceLog.push(result.masteryUpdate.evidence);

      await saveLearner(userId, updatedLearner);
    }

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
