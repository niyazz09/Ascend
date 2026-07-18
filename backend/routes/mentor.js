const express = require('express');
const router = express.Router();
const { mentor } = require('../agents/mentor');
const { authenticateToken } = require('../middleware/auth');

router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, history, goal, completedNodes, currentNode, nextNode, difficulty, lessonContext, mode } = req.body;
    
    const coachResponse = await mentor({
      message,
      history,
      goal,
      completedNodes,
      currentNode,
      nextNode,
      difficulty,
      lessonContext,
      mode
    });

    res.json({ response: coachResponse });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
