const express = require('express');
const router = express.Router();
const { generateRoadmap } = require('../agents/planner');
const { getLearner, createLearner } = require('../store');
const topics = require('../data/topics.json');
const { authenticateToken } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { goal } = req.body;
    const userId = req.user.id;
    
    let learner = await getLearner(userId);
    if (!learner) {
      learner = await createLearner(userId);
    }

    const roadmap = generateRoadmap({ goal, learnerState: learner, topics });

    // Persist goal, roadmap, and nodes in database
    const dbGoal = await prisma.learningGoal.create({
      data: {
        title: goal,
        userId
      }
    });

    const dbRoadmap = await prisma.roadmap.create({
      data: {
        goalId: dbGoal.id,
        progressPercentage: roadmap.progressPercentage
      }
    });

    for (const node of roadmap.roadmap) {
      await prisma.roadmapNode.create({
        data: {
          roadmapId: dbRoadmap.id,
          topicId: node.topicId,
          title: node.title,
          status: node.status,
          prerequisites: node.prerequisites
        }
      });
    }

    res.json(roadmap);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
