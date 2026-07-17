const test = require('node:test');
const assert = require('node:assert');
const { orchestrate, detectIntent } = require('./orchestrator');
const geminiService = require('../services/gemini');

const mockTopics = [
  { id: "html-basics", title: "HTML Basics", prerequisites: [] }
];

test('Orchestrator Agent Tests', async (t) => {
  await t.test('Intent detection rules matching prompts', () => {
    assert.strictEqual(detectIntent("I want to learn HTML"), "learn");
    assert.strictEqual(detectIntent("Generate a quiz for CSS"), "quiz");
    assert.strictEqual(detectIntent("Submit my answers"), "submit");
    assert.strictEqual(detectIntent("Analyze my progress"), "analyze");
    assert.throws(() => detectIntent("Hello there"), /Unable to determine required agents/);
  });

  await t.test('Learn flow executes Planner, Quiz, and Analyzer', async () => {
    const result = await orchestrate({
      userId: "user-123",
      input: "I want to learn Frontend Developer",
      learnerState: { mastery: { "html-basics": 10 } },
      topics: mockTopics,
      additionalParams: { goal: "Frontend Developer" }
    });

    assert.deepStrictEqual(result.executedAgents, ["PlannerAgent", "QuizGeneratorAgent", "AnalyzerAgent"]);
    assert.ok(result.roadmap);
    assert.ok(result.initialQuiz);
    assert.ok(result.analysis);
    assert.strictEqual(result.roadmap.goal, "Frontend Developer");
    assert.strictEqual(result.initialQuiz.topicId, "html-basics");
  });

  await t.test('Quiz flow executes only QuizGeneratorAgent', async () => {
    const result = await orchestrate({
      userId: "user-123",
      input: "Generate a quiz for CSS",
      learnerState: {},
      topics: mockTopics,
      additionalParams: { topicId: "html-basics", difficulty: 50, questionCount: 2 }
    });

    assert.deepStrictEqual(result.executedAgents, ["QuizGeneratorAgent"]);
    assert.ok(result.quiz);
    assert.strictEqual(result.quiz.topicId, "html-basics");
    assert.strictEqual(result.quiz.questions.length, 2);
    assert.strictEqual(result.roadmap, undefined);
  });

  await t.test('Submit flow executes MasteryEngine and AnalyzerAgent', async () => {
    const result = await orchestrate({
      userId: "user-123",
      input: "Submit my answers",
      learnerState: { mastery: { "html-basics": 60 } },
      topics: mockTopics,
      additionalParams: {
        topicId: "html-basics",
        questionResult: {
          difficulty: 80,
          correct: true,
          questionType: "mcq",
          timestamp: 12345
        }
      }
    });

    assert.deepStrictEqual(result.executedAgents, ["MasteryEngine", "AnalyzerAgent"]);
    assert.ok(result.masteryUpdate);
    assert.ok(result.analysis);
    assert.strictEqual(result.masteryUpdate.newScore, 64.8);
    assert.ok(result.analysis.summary.weakTopics.length === 0);
  });

  await t.test('Analyze flow executes only AnalyzerAgent', async () => {
    const result = await orchestrate({
      userId: "user-123",
      input: "Analyze my progress",
      learnerState: { mastery: { "html-basics": 85 } },
      topics: mockTopics
    });

    assert.deepStrictEqual(result.executedAgents, ["AnalyzerAgent"]);
    assert.ok(result.analysis);
    assert.deepStrictEqual(result.analysis.summary.strongTopics, ["html-basics"]);
  });

  await t.test('AI-driven Orchestration flow with mocked Gemini SDK', async () => {
    // Inject API Key placeholder to enable the AI flow branch
    process.env.GEMINI_API_KEY = "test_key";
    
    // Save original method
    const originalGenerateContent = geminiService.generateContent;

    // Stub gemini call
    geminiService.generateContent = async ({ prompt }) => {
      if (prompt.includes("Machine Learning")) {
        return JSON.stringify({
          intent: "learn",
          goal: "Machine Learning",
          topicId: ""
        });
      }
      return JSON.stringify({
        intent: "analyze",
        goal: "",
        topicId: ""
      });
    };

    try {
      const result = await orchestrate({
        userId: "user-999",
        input: "I want to learn Machine Learning",
        learnerState: {},
        topics: mockTopics,
        additionalParams: {}
      });

      assert.strictEqual(result.intent, "learn");
      assert.deepStrictEqual(result.executedAgents, ["PlannerAgent", "QuizGeneratorAgent", "AnalyzerAgent"]);
      // Fallback goal will use what AI returned ("Machine Learning" instead of default "Frontend Developer")
      assert.strictEqual(result.roadmap.goal, "Machine Learning");

    } finally {
      // Clean up mock and env settings
      geminiService.generateContent = originalGenerateContent;
      delete process.env.GEMINI_API_KEY;
    }
  });
});
