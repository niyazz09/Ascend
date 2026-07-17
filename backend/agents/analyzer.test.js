const test = require('node:test');
const assert = require('node:assert');
const { analyzeLearner } = require('./analyzer');

test('Analyzer Agent Tests', async (t) => {
  await t.test('Weak and strong topic detection', () => {
    const learnerState = {
      mastery: {
        "html-basics": 45, // weak
        "css-basics": 60,  // neutral
        "javascript-basics": 85 // strong
      }
    };
    const roadmap = {
      completedTopics: ["javascript-basics"],
      progressPercentage: 33.3,
      roadmap: [
        { topicId: "html-basics", status: "next" },
        { topicId: "css-basics", status: "locked" },
        { topicId: "javascript-basics", status: "completed" }
      ]
    };

    const result = analyzeLearner({ learnerState, roadmap, evidenceLog: [] });

    assert.deepStrictEqual(result.summary.weakTopics, ["html-basics"]);
    assert.deepStrictEqual(result.summary.strongTopics, ["javascript-basics"]);
    assert.deepStrictEqual(result.summary.completedTopics, ["javascript-basics"]);
    assert.strictEqual(result.summary.progressPercentage, 33.3);
  });

  await t.test('Review recommendation logic (consecutive negative deltas)', () => {
    const evidenceLog = [
      // css-basics: negative delta first, then positive, then negative (most recent is negative, second is positive -> NO review)
      { topicId: "css-basics", timestamp: 1000, delta: -5 },
      { topicId: "css-basics", timestamp: 2000, delta: 3 },
      { topicId: "css-basics", timestamp: 3000, delta: -2 },

      // html-basics: two consecutive negative deltas at the end (most recent: 3000 and 2000 are both negative -> review!)
      { topicId: "html-basics", timestamp: 1000, delta: 8 },
      { topicId: "html-basics", timestamp: 2000, delta: -4 },
      { topicId: "html-basics", timestamp: 3000, delta: -1 }
    ];

    const result = analyzeLearner({
      learnerState: { mastery: { "html-basics": 60, "css-basics": 60 } },
      roadmap: {},
      evidenceLog
    });

    assert.deepStrictEqual(result.recommendations.reviewTopics, ["html-basics"]);
  });

  await t.test('Roadmap recommendation (first "next" item)', () => {
    const roadmap = {
      roadmap: [
        { topicId: "html-basics", status: "completed" },
        { topicId: "css-basics", status: "next" },
        { topicId: "javascript-basics", status: "locked" }
      ]
    };

    const result = analyzeLearner({
      learnerState: {},
      roadmap,
      evidenceLog: []
    });

    assert.strictEqual(result.recommendations.nextTopic, "css-basics");
  });

  await t.test('Empty evidence log and learner state resilience', () => {
    const result = analyzeLearner({
      learnerState: {},
      roadmap: {},
      evidenceLog: []
    });

    assert.deepStrictEqual(result.summary.weakTopics, []);
    assert.deepStrictEqual(result.summary.strongTopics, []);
    assert.deepStrictEqual(result.summary.completedTopics, []);
    assert.strictEqual(result.summary.progressPercentage, 0.0);
    assert.strictEqual(result.recommendations.nextTopic, null);
    assert.deepStrictEqual(result.recommendations.reviewTopics, []);
    assert.deepStrictEqual(result.recommendations.focusAreas, []);
  });

  await t.test('Deterministic output', () => {
    const params = {
      learnerState: { mastery: { "html-basics": 40 } },
      roadmap: {
        roadmap: [{ topicId: "html-basics", status: "next" }]
      },
      evidenceLog: [
        { topicId: "html-basics", timestamp: 1000, delta: -2 },
        { topicId: "html-basics", timestamp: 2000, delta: -3 }
      ]
    };

    const res1 = analyzeLearner(params);
    const res2 = analyzeLearner(params);

    assert.deepStrictEqual(res1, res2);
  });
});
