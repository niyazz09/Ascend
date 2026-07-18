const express = require('express');
const router = express.Router();
const { generateRoadmap } = require('../agents/planner');
const { getLearner, createLearner } = require('../store');
const { analyzeGoal } = require('../agents/learningGoalAnalyzer');
const llmService = require('../services/llm');
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

const learningOrchestrator = require('../engine/learningOrchestrator');

router.get('/topic-details', authenticateToken, async (req, res) => {
  try {
    const { topicId, topicTitle, goal, refresh } = req.query;
    if (!topicId || !topicTitle || !goal) {
      return res.status(400).json({ error: "Missing topicId, topicTitle, or goal query parameter" });
    }

    const forceRefresh = refresh === 'true' || refresh === '1';

    const lessonPayload = await learningOrchestrator.getOrGenerateLesson({
      topicId,
      topicTitle,
      goal,
      forceRefresh
    });

    res.json(lessonPayload);
  } catch (error) {
    console.error("Error in /planner/topic-details endpoint:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /planner/generate-project
router.post('/generate-project', authenticateToken, async (req, res) => {
  try {
    const { topicTitle, goal } = req.body;
    const topic = topicTitle || "Web Development";
    const targetGoal = goal || "Software Engineering";

    const responseSchema = {
      type: "OBJECT",
      properties: {
        projectName: { type: "STRING" },
        difficulty: { type: "STRING" },
        description: { type: "STRING" },
        features: { type: "ARRAY", items: { type: "STRING" } },
        techStack: { type: "ARRAY", items: { type: "STRING" } },
        folderStructure: { type: "STRING" },
        implementationSteps: { type: "ARRAY", items: { type: "STRING" } },
        bonusFeatures: { type: "ARRAY", items: { type: "STRING" } },
        learningOutcomes: { type: "ARRAY", items: { type: "STRING" } },
        estimatedTime: { type: "STRING" }
      },
      required: ["projectName", "difficulty", "description", "features", "techStack", "folderStructure", "implementationSteps", "bonusFeatures", "learningOutcomes", "estimatedTime"]
    };

    const prompt = `Generate a comprehensive hands-on mini portfolio project for the topic "${topic}" within the learning goal "${targetGoal}".
    Provide project name, difficulty level, concise description, list of core features, required tech stack, folder tree structure string, step-by-step implementation guide, bonus extension challenges, learning outcomes, and estimated completion time.`;

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        projectName: `${topic} Master Application`,
        difficulty: "Intermediate",
        description: `Build a complete production-grade practical project integrating ${topic} concepts.`,
        features: [`Implement core ${topic} pipeline`, "Add error handling and state persistence", "Build responsive modern UI"],
        techStack: [topic, "JavaScript/TypeScript", "Node.js", "CSS"],
        folderStructure: `src/\n├── components/\n├── services/\n├── utils/\n└── index.js`,
        implementationSteps: [`Initialize project workspace`, `Implement data models for ${topic}`, `Build user interface & connect handlers`, `Test edge cases and deploy`],
        bonusFeatures: ["Add dark mode toggle", "Write unit tests for core handlers"],
        learningOutcomes: [`Solidify real-world understanding of ${topic}`, "Enhance portfolio credentials"],
        estimatedTime: "3-5 hours",
        source: "fallback"
      });
    }

    try {
      const responseText = await llmService.generateContent({
        prompt,
        systemInstruction: "You are the ASCEND Hands-on Project Architect. Generate detailed portfolio project blueprints in JSON matching the schema.",
        responseSchema
      });
      const parsed = JSON.parse(responseText);
      parsed.source = "generated";
      return res.json(parsed);
    } catch (err) {
      return res.json({
        projectName: `${topic} Hands-On Project`,
        difficulty: "Intermediate",
        description: `Build a complete application applying core principles of ${topic}.`,
        features: [`Core ${topic} features`, "Interactive UI", "Data validation"],
        techStack: [topic, "JavaScript", "HTML/CSS"],
        folderStructure: `src/\n├── app.js\n└── index.html`,
        implementationSteps: [`Set up project structure`, `Implement ${topic} logic`, `Verify and test`],
        bonusFeatures: ["Add performance optimizations"],
        learningOutcomes: [`Master ${topic} practically`],
        estimatedTime: "2-4 hours",
        source: "fallback"
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
