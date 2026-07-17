const test = require('node:test');
const assert = require('node:assert');
const { orchestrate, detectIntent } = require('./orchestrator');
const llmService = require('../services/llm');

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
      input: "I want to learn HTML",
      learnerState: {},
      topics: mockTopics,
      additionalParams: { goal: "Frontend Developer" }
    });

    assert.strictEqual(result.intent, "learn");
    assert.deepStrictEqual(result.executedAgents, ["PlannerAgent", "QuizGeneratorAgent", "AnalyzerAgent"]);
    assert.ok(result.roadmap);
    assert.ok(result.initialQuiz);
    assert.ok(result.analysis);
  });

  await t.test('Quiz flow executes only QuizGeneratorAgent', async () => {
    const result = await orchestrate({
      userId: "user-123",
      input: "Generate a quiz for HTML",
      learnerState: {},
      topics: mockTopics,
      additionalParams: { topicId: "html-basics", difficulty: 50, questionCount: 2 }
    });

    assert.strictEqual(result.intent, "quiz");
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
        questionResult: { difficulty: 50, correct: true, questionType: "mcq" }
      }
    });

    assert.strictEqual(result.intent, "submit");
    assert.deepStrictEqual(result.executedAgents, ["MasteryEngine", "AnalyzerAgent"]);
    assert.ok(result.masteryUpdate);
    assert.ok(result.analysis);
  });

  await t.test('Analyze flow executes only AnalyzerAgent', async () => {
    const result = await orchestrate({
      userId: "user-123",
      input: "Analyze my progress",
      learnerState: {
        mastery: { "html-basics": 85 },
        evidenceLog: [
          { topicId: "html-basics", difficulty: 50, correct: true, questionType: "mcq", delta: 10, previousScore: 75, newScore: 85, timestamp: Date.now() }
        ]
      },
      topics: mockTopics,
      additionalParams: {}
    });

    assert.strictEqual(result.intent, "analyze");
    assert.deepStrictEqual(result.executedAgents, ["AnalyzerAgent"]);
    assert.ok(result.analysis);
    assert.deepStrictEqual(result.analysis.summary.strongTopics, ["html-basics"]);
  });

  await t.test('AI-driven Orchestration flow with mocked LLM SDK', async () => {
    process.env.OPENROUTER_API_KEY = "test_key";
    
    const originalGenerateContent = llmService.generateContent;

    llmService.generateContent = async ({ prompt }) => {
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
      assert.strictEqual(result.roadmap.goal, "Machine Learning");

    } finally {
      llmService.generateContent = originalGenerateContent;
      delete process.env.OPENROUTER_API_KEY;
    }
  });
});
