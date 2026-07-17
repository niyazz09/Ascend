const express = require('express');
const router = express.Router();
const { generateRoadmap } = require('../agents/planner');
const { getLearner, createLearner } = require('../store');
const { analyzeGoal } = require('../agents/learningGoalAnalyzer');
const geminiService = require('../services/gemini');
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

    // Call dynamic Learning Goal Analyzer to build the curriculum DAG
    const analyzed = await analyzeGoal({ goal });

    // Pass dynamic topics to topological sort planner
    const roadmap = generateRoadmap({ 
      goal: analyzed.goal, 
      learnerState: learner, 
      topics: analyzed.topics 
    });
    roadmap.source = analyzed.source || "generated";

    if (!roadmap.roadmap || roadmap.roadmap.length === 0) {
      return res.json(roadmap);
    }

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
        progressPercentage: roadmap.progressPercentage,
        source: roadmap.source
      }
    });

    for (const node of roadmap.roadmap) {
      await prisma.roadmapNode.create({
        data: {
          roadmapId: dbRoadmap.id,
          topicId: node.topicId,
          title: node.title,
          status: node.status,
          prerequisites: node.prerequisites,
          resources: node.resources || null
        }
      });
    }

    res.json(roadmap);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Perform database wipe in transaction to ensure consistency
    await prisma.$transaction([
      prisma.learningGoal.deleteMany({ where: { userId } }),
      prisma.mastery.deleteMany({ where: { userId } }),
      prisma.evidenceLog.deleteMany({ where: { userId } }),
      prisma.recommendation.deleteMany({ where: { userId } })
    ]);

    res.json({ success: true, message: "Roadmap and progress successfully cleared" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/topic-details', authenticateToken, async (req, res) => {
  try {
    const { topicId, topicTitle, goal } = req.query;
    if (!topicId || !topicTitle || !goal) {
      return res.status(400).json({ error: "Missing topicId, topicTitle, or goal query parameter" });
    }

    const responseSchema = {
      type: "OBJECT",
      properties: {
        lessonTitle: { type: "STRING" },
        lessonContent: { type: "STRING" },
        objectives: { type: "ARRAY", items: { type: "STRING" } },
        keyConcepts: { type: "ARRAY", items: { type: "STRING" } },
        codeSnippet: { type: "ARRAY", items: { type: "STRING" } },
        resources: {
          type: "OBJECT",
          properties: {
            documentation: { type: "STRING" },
            youtube: { type: "STRING" },
            books: { type: "STRING" },
            practice_platforms: { type: "STRING" },
            interactive_resources: { type: "STRING" }
          },
          required: ["documentation", "youtube", "books", "practice_platforms", "interactive_resources"]
        }
      },
      required: ["lessonTitle", "lessonContent", "objectives", "keyConcepts", "codeSnippet", "resources"]
    };

    const prompt = `Generate comprehensive study notes, lessons, and highly relevant learning resources for the topic "${topicTitle}" within the curriculum of learning goal "${goal}".
    Make sure codeSnippet is a string array where each item is a line of code (if applicable to the domain, otherwise show key bulleted examples or guidelines).`;

    let responseText;
    let attempts = 0;
    const maxAttempts = 2;
    let source = "generated";
    let parsed = null;

    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY environment variable is missing. Running in local fallback mode.");
      attempts = maxAttempts;
    }

    while (attempts < maxAttempts) {
      attempts++;
      try {
        responseText = await geminiService.generateContent({
          prompt,
          systemInstruction: "You are the ASCEND Curriculum Details Generator. Provide highly detailed lesson content and resource links (documentation, youtube, books, practice_platforms, interactive_resources) in JSON format matching the requested schema.",
          responseSchema
        });
        parsed = JSON.parse(responseText);
        source = "generated";
        break;
      } catch (err) {
        console.warn(`Attempt ${attempts} failed for topic details:`, err.message);
        if (attempts >= maxAttempts) {
          console.warn("Exceeded max attempts. Falling back to dynamic topic details fallback.");
        }
      }
    }

    if (!parsed) {
      source = "fallback";
      parsed = {
        lessonTitle: topicTitle,
        lessonContent: `Follow this structured study guide for ${topicTitle} as part of your overall ${goal} objective. Connect core concepts and attempt the quiz to level up your mastery.`,
        objectives: [
          `Understand core mechanisms of ${topicTitle}`,
          `Apply key patterns for ${topicTitle}`,
          `Inspect logic flow of ${topicTitle}`
        ],
        keyConcepts: [
          `Introductory guidelines for ${topicTitle}`,
          `Practical validation models`
        ],
        codeSnippet: [
          `// Study notes for ${topicTitle}`,
          `console.log("Welcome to Ascend!");`
        ],
        resources: {
          documentation: 'https://google.com/search?q=' + encodeURIComponent(topicTitle + ' documentation'),
          youtube: 'https://youtube.com/results?search_query=' + encodeURIComponent(topicTitle),
          books: 'https://google.com/search?q=' + encodeURIComponent(topicTitle + ' books'),
          practice_platforms: 'https://google.com/search?q=' + encodeURIComponent(topicTitle + ' exercises'),
          interactive_resources: 'https://google.com/search?q=' + encodeURIComponent(topicTitle + ' tutorial')
        }
      };
    }

    parsed.source = source;
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
