const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const topics = require('../data/topics.json');

const prisma = new PrismaClient();

/**
 * Calculates a daily learning streak based on evidence logs timestamps.
 * @param {Array<Object>} logs - User's evidence log entries
 * @returns {number} Current consecutive day streak
 */
function calculateStreak(logs) {
  if (!logs || logs.length === 0) return 0;

  // Extract unique calendar dates
  const uniqueDates = Array.from(
    new Set(
      logs.map(log => {
        const d = new Date(log.timestamp);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      })
    )
  ).sort((a, b) => b - a); // Sort descending (most recent first)

  if (uniqueDates.length === 0) return 0;

  const oneDayMs = 24 * 60 * 60 * 1000;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - oneDayMs;

  const mostRecent = uniqueDates[0];

  // If the user has not logged activity today or yesterday, streak is broken
  if (mostRecent !== todayStart && mostRecent !== yesterdayStart) {
    return 0;
  }

  let streak = 1;
  let currentRef = mostRecent;

  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = currentRef - uniqueDates[i];
    if (diff === oneDayMs) {
      streak++;
      currentRef = uniqueDates[i];
    } else if (diff > oneDayMs) {
      break;
    }
  }

  return streak;
}

// GET /dashboard
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user and all relational assets efficiently using optimized inclusions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        goals: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            roadmap: {
              include: {
                nodes: true
              }
            }
          }
        },
        masteries: {
          orderBy: { score: 'desc' }
        },
        evidenceLogs: {
          orderBy: { timestamp: 'desc' },
          take: 10
        },
        recommendation: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const latestGoal = user.goals[0] || null;
    const roadmapData = latestGoal && latestGoal.roadmap ? latestGoal.roadmap : null;
    const roadmapNodes = roadmapData ? roadmapData.nodes : [];

    // Format roadmap to align with planner schema output
    const formattedRoadmap = roadmapData
      ? {
          goal: latestGoal.title,
          roadmap: roadmapNodes.map(node => ({
            topicId: node.topicId,
            title: node.title,
            prerequisites: node.prerequisites,
            status: node.status,
            resources: node.resources ? JSON.parse(node.resources) : null
          })),
          completedTopics: roadmapNodes.filter(n => n.status === "completed").map(n => n.topicId),
          remainingTopics: roadmapNodes.filter(n => n.status !== "completed").map(n => n.topicId),
          estimatedSteps: roadmapNodes.filter(n => n.status !== "completed").length,
          progressPercentage: roadmapData.progressPercentage
        }
      : {
          goal: "",
          roadmap: [],
          completedTopics: [],
          remainingTopics: [],
          estimatedSteps: 0,
          progressPercentage: 0.0
        };

    // Calculate statistics
    const totalTopics = topics.length;
    const completedTopicsCount = user.masteries.filter(m => m.score >= 80).length;
    const progressPercentage = formattedRoadmap.progressPercentage;

    const totalMasteryScore = user.masteries.reduce((sum, m) => sum + m.score, 0);
    const averageMastery = user.masteries.length > 0
      ? Math.round((totalMasteryScore / user.masteries.length) * 10) / 10
      : 0.0;

    // Fetch total quiz attempts count from DB
    const quizAttempts = await prisma.evidenceLog.count({
      where: { userId }
    });

    // Compute streak using all evidence logs (refetching all if needed, but using user.evidenceLogs since it's already there)
    // For streak accuracy, let's fetch all log timestamps for this user
    const allLogs = await prisma.evidenceLog.findMany({
      where: { userId },
      select: { timestamp: true }
    });
    const streak = calculateStreak(allLogs);

    // Format recommendations
    const recommendations = user.recommendation
      ? {
          nextTopic: user.recommendation.nextTopic,
          reviewTopics: user.recommendation.reviewTopics,
          focusAreas: user.recommendation.focusAreas
        }
      : {
          nextTopic: null,
          reviewTopics: [],
          focusAreas: []
        };

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: null // Standard placeholder as "name" is not in User schema
      },
      currentGoal: latestGoal ? { title: latestGoal.title, createdAt: latestGoal.createdAt } : null,
      roadmap: formattedRoadmap,
      mastery: user.masteries.map(m => ({
        topicId: m.topicId,
        score: m.score,
        updatedAt: m.updatedAt
      })),
      recentEvidence: user.evidenceLogs.map(log => ({
        topicId: log.topicId,
        difficulty: log.difficulty,
        correct: log.correct,
        questionType: log.questionType,
        delta: log.delta,
        previousScore: log.previousScore,
        newScore: log.newScore,
        timestamp: log.timestamp instanceof Date ? log.timestamp.getTime() : Number(log.timestamp)
      })),
      recommendations,
      stats: {
        overallProgress: progressPercentage,
        completedTopics: completedTopicsCount,
        totalTopics,
        averageMastery,
        quizAttempts,
        streak
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
