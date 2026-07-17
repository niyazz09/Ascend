const geminiService = require('../services/gemini');
const { generateRoadmap } = require('./planner');
const { generateQuiz } = require('./quizGenerator');
const { analyzeLearner } = require('./analyzer');
const { updateMastery } = require('../engine/mastery');

const responseSchema = {
  type: "OBJECT",
  properties: {
    intent: {
      type: "STRING",
      description: "Must be one of: 'learn', 'quiz', 'submit', 'analyze'"
    },
    goal: {
      type: "STRING",
      description: "If intent is 'learn', extract the user's learning goal (e.g., 'Frontend Developer' or 'Machine Learning'). Otherwise, empty."
    },
    topicId: {
      type: "STRING",
      description: "If intent is 'quiz' or 'submit', extract the target topic ID (e.g., 'html-basics'). Otherwise, empty."
    }
  },
  required: ["intent", "goal", "topicId"]
};

const systemInstruction = `You are the ASCEND Orchestrator Agent. Your task is to analyze the learner's request and classify their intent into one of the following categories:
1. "learn": The learner wants to start learning a new topic or goal, or generate a roadmap (e.g., "I want to learn HTML", "I want to be a machine learning engineer").
2. "quiz": The learner wants to take a quiz or test their knowledge on a specific topic (e.g., "give me a quiz on CSS").
3. "submit": The learner is submitting answers to a quiz or presenting results (e.g., "submit my response to HTML quiz").
4. "analyze": The learner wants an analysis of their progress, stats, or recommendations (e.g., "analyze my weak areas").

Extract the 'goal' (e.g., "Frontend Developer", "Machine Learning") if they want to learn, and the 'topicId' if they specify a topic for quiz/submit. Return your classification as a valid JSON matching the specified schema.`;

/**
 * Fallback parser using prompt keyword matching in case Gemini API is not configured or fails.
 * @param {string} input - The user prompt
 * @returns {string} One of: "learn", "quiz", "submit", "analyze"
 */
function detectIntentFallback(input) {
  const text = (input || "").toLowerCase();

  if (text.includes("learn") || text.includes("roadmap") || text.includes("goal") || text.includes("developer") || text.includes("machine learning")) {
    return "learn";
  }
  if (text.includes("quiz") || text.includes("test") || text.includes("question")) {
    return "quiz";
  }
  if (text.includes("submit") || text.includes("answer") || text.includes("result")) {
    return "submit";
  }
  if (text.includes("analyze") || text.includes("progress") || text.includes("evidence") || text.includes("recommend")) {
    return "analyze";
  }

  throw new Error("Unable to determine required agents for this input");
}

/**
 * Orchestrates execution of specialist agents based on intent detected from input using Gemini.
 *
 * @param {Object} params
 * @param {string} params.userId - Authenticated user identifier
 * @param {string} params.input - User natural language prompt
 * @param {Object} [params.learnerState={}] - Current learner mastery and evidence state
 * @param {Array<Object>} [params.topics=[]] - Database of roadmap topics
 * @param {Object} [params.additionalParams={}] - Specific inputs for inner agents (e.g. goal, difficulty, topicId, questionResult)
 * @returns {Promise<Object>} Unified analysis and roadmap details
 */
async function orchestrate({ userId, input, learnerState = {}, topics = [], additionalParams = {} }) {
  let intent;
  let detectedGoal = "";
  let detectedTopicId = "";

  // Attempt to use Google Gemini AI classifier first
  if (process.env.GEMINI_API_KEY) {
    try {
      const aiResponse = await geminiService.generateContent({
        prompt: input,
        systemInstruction,
        responseSchema
      });
      const parsed = JSON.parse(aiResponse);
      intent = parsed.intent;
      detectedGoal = parsed.goal;
      detectedTopicId = parsed.topicId;
    } catch (error) {
      console.warn("Gemini Orchestrator execution failed, using fallback:", error.message);
      intent = detectIntentFallback(input);
    }
  } else {
    // If no key is set (e.g., in test environments), run fallback
    intent = detectIntentFallback(input);
  }

  const result = {
    userId,
    input,
    intent,
    executedAgents: []
  };

  switch (intent) {
    case "learn": {
      result.executedAgents = ["PlannerAgent", "QuizGeneratorAgent", "AnalyzerAgent"];
      
      const goal = detectedGoal || additionalParams.goal || "Frontend Developer";
      
      // 1. Run Planner
      const roadmap = generateRoadmap({ goal, learnerState, topics });
      result.roadmap = roadmap;

      // 2. Run Quiz Generator for the first next topic
      const nextTopicItem = roadmap.roadmap.find(node => node.status === "next");
      if (nextTopicItem) {
        const quiz = await generateQuiz({
          topicId: nextTopicItem.topicId,
          difficulty: additionalParams.difficulty || 50,
          questionCount: additionalParams.questionCount || 3
        });
        result.initialQuiz = quiz;
      }

      // 3. Run Analyzer
      const analysis = analyzeLearner({
        learnerState,
        roadmap,
        evidenceLog: learnerState.evidenceLog || []
      });
      result.analysis = analysis;
      break;
    }

    case "quiz": {
      result.executedAgents = ["QuizGeneratorAgent"];
      const topicId = detectedTopicId || additionalParams.topicId || "html-basics";
      const quiz = await generateQuiz({
        topicId,
        difficulty: additionalParams.difficulty || 50,
        questionCount: additionalParams.questionCount || 3
      });
      result.quiz = quiz;
      break;
    }

    case "submit": {
      result.executedAgents = ["MasteryEngine", "AnalyzerAgent"];
      const topicId = detectedTopicId || additionalParams.topicId;
      const questionResult = additionalParams.questionResult;

      if (!topicId || !questionResult) {
        throw new Error("Missing topicId or questionResult in additionalParams");
      }

      // 1. Run Mastery Engine
      const masteryResult = updateMastery({
        learnerState,
        topicId,
        questionResult
      });
      result.masteryUpdate = masteryResult;

      // Update state locally for the subsequent Analyzer run
      const localLearnerState = JSON.parse(JSON.stringify(learnerState));
      if (!localLearnerState.evidenceLog) {
        localLearnerState.evidenceLog = [];
      }
      localLearnerState.evidenceLog.push(masteryResult.evidence);
      localLearnerState.mastery = localLearnerState.mastery || {};
      localLearnerState.mastery[topicId] = masteryResult.newScore;

      // 2. Run Planner to get updated roadmap statuses
      const goal = additionalParams.goal || "Frontend Developer";
      const roadmap = generateRoadmap({ goal, learnerState: localLearnerState, topics });

      // 3. Run Analyzer
      const analysis = analyzeLearner({
        learnerState: localLearnerState,
        roadmap,
        evidenceLog: localLearnerState.evidenceLog
      });
      result.analysis = analysis;
      break;
    }

    case "analyze": {
      result.executedAgents = ["AnalyzerAgent"];
      const goal = additionalParams.goal || "Frontend Developer";
      const roadmap = generateRoadmap({ goal, learnerState, topics });
      const analysis = analyzeLearner({
        learnerState,
        roadmap,
        evidenceLog: learnerState.evidenceLog || []
      });
      result.analysis = analysis;
      break;
    }
  }

  return result;
}

module.exports = {
  orchestrate,
  detectIntent: detectIntentFallback
};
