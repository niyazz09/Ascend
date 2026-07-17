const express = require('express');
const router = express.Router();
const { generateQuiz } = require('../agents/quizGenerator');
const { updateMastery } = require('../engine/mastery');
const { getLearner, createLearner, saveLearner } = require('../store');

router.post('/', async (req, res) => {
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

    let learner = getLearner("default-learner");
    if (!learner) {
      learner = createLearner("default-learner");
    }

    const result = updateMastery({ learnerState: learner, topicId, questionResult });

    if (!learner.evidenceLog) {
      learner.evidenceLog = [];
    }
    learner.evidenceLog.push(result.evidence);
    saveLearner("default-learner", learner);

    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  quizRouter: router,
  submitHandler
};
