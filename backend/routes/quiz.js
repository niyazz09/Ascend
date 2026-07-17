const express = require('express');
const router = express.Router();
const { generateQuiz } = require('../agents/quizGenerator');
const { updateMastery } = require('../engine/mastery');
const { getLearner, createLearner, saveLearner } = require('../store');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { topicId, difficulty, questionCount } = req.body;
    const quiz = await generateQuiz({ topicId, difficulty, questionCount });
    res.json(quiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

async function submitHandler(req, res) {
  try {
    const { topicId, questionResult } = req.body;
    if (!topicId || !questionResult) {
      return res.status(400).json({ error: "Missing topicId or questionResult" });
    }

    const userId = req.user.id;
    let learner = await getLearner(userId);
    if (!learner) {
      learner = await createLearner(userId);
    }

    const result = updateMastery({ learnerState: learner, topicId, questionResult });

    if (!learner.evidenceLog) {
      learner.evidenceLog = [];
    }
    learner.evidenceLog.push(result.evidence);
    await saveLearner(userId, learner);

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  quizRouter: router,
  submitHandler
};
