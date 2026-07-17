const test = require('node:test');
const assert = require('node:assert');
const { generateRoadmap } = require('./planner');

const mockTopics = [
  { id: "html-basics", title: "HTML Basics", prerequisites: [] },
  { id: "css-basics", title: "CSS Basics", prerequisites: ["html-basics"] },
  { id: "javascript-basics", title: "JavaScript Basics", prerequisites: ["html-basics"] },
  { id: "dom-manipulation", title: "DOM Manipulation", prerequisites: ["css-basics", "javascript-basics"] },
  { id: "web-apis", title: "Web APIs", prerequisites: ["javascript-basics"] }
];

test('Planner Agent Tests', async (t) => {
  await t.test('Correct roadmap ordering & prerequisite enforcement', () => {
    const result = generateRoadmap({
      goal: "Frontend Developer",
      learnerState: {},
      topics: mockTopics
    });

    assert.strictEqual(result.goal, "Frontend Developer");
    assert.strictEqual(result.roadmap.length, 5);
    assert.strictEqual(result.progressPercentage, 0.0);

    const indices = {};
    result.roadmap.forEach((item, index) => {
      indices[item.topicId] = index;
    });

    assert.ok(indices["html-basics"] < indices["css-basics"]);
    assert.ok(indices["html-basics"] < indices["javascript-basics"]);
    assert.ok(indices["css-basics"] < indices["dom-manipulation"]);
    assert.ok(indices["javascript-basics"] < indices["dom-manipulation"]);
    assert.ok(indices["javascript-basics"] < indices["web-apis"]);
  });

  await t.test('Completed topics skipped (marked completed) and progressPercentage adjusted', () => {
    const result = generateRoadmap({
      goal: "Frontend Developer",
      learnerState: {
        mastery: {
          "html-basics": 85,
          "css-basics": 40
        }
      },
      topics: mockTopics
    });

    const htmlItem = result.roadmap.find(item => item.topicId === "html-basics");
    const cssItem = result.roadmap.find(item => item.topicId === "css-basics");
    const jsItem = result.roadmap.find(item => item.topicId === "javascript-basics");

    assert.strictEqual(htmlItem.status, "completed");
    assert.strictEqual(cssItem.status, "next");
    assert.strictEqual(jsItem.status, "next");

    assert.deepStrictEqual(result.completedTopics, ["html-basics"]);
    assert.strictEqual(result.remainingTopics.length, 4);
    assert.ok(result.remainingTopics.includes("css-basics"));
    assert.ok(result.remainingTopics.includes("javascript-basics"));
    assert.ok(result.remainingTopics.includes("dom-manipulation"));
    assert.ok(result.remainingTopics.includes("web-apis"));
    assert.strictEqual(result.estimatedSteps, 4);
    // 1 completed out of 5 = 20.0%
    assert.strictEqual(result.progressPercentage, 20.0);
  });

  await t.test('Locked topic detection', () => {
    const result = generateRoadmap({
      goal: "Frontend Developer",
      learnerState: {
        mastery: {
          "html-basics": 50
        }
      },
      topics: mockTopics
    });

    const htmlItem = result.roadmap.find(item => item.topicId === "html-basics");
    const cssItem = result.roadmap.find(item => item.topicId === "css-basics");

    assert.strictEqual(htmlItem.status, "next");
    assert.strictEqual(cssItem.status, "locked");
  });

  await t.test('Invalid graph detection: cycle detection', () => {
    const cycleTopics = [
      { id: "topic-a", title: "Topic A", prerequisites: ["topic-b"] },
      { id: "topic-b", title: "Topic B", prerequisites: ["topic-a"] }
    ];

    assert.throws(() => {
      generateRoadmap({
        goal: "Frontend Developer",
        learnerState: {},
        topics: cycleTopics
      });
    }, /Invalid graph: cycle detected/);
  });

  await t.test('Invalid graph detection: missing prerequisite', () => {
    const brokenTopics = [
      { id: "topic-a", title: "Topic A", prerequisites: ["non-existent"] }
    ];

    assert.throws(() => {
      generateRoadmap({
        goal: "Frontend Developer",
        learnerState: {},
        topics: brokenTopics
      });
    }, /Invalid graph: missing prerequisite/);
  });

  await t.test('Deterministic output', () => {
    const params = {
      goal: "Frontend Developer",
      learnerState: { mastery: { "html-basics": 90 } },
      topics: mockTopics
    };

    const res1 = generateRoadmap(params);
    const res2 = generateRoadmap(params);

    assert.deepStrictEqual(res1, res2);
  });

  await t.test('Empty learner state', () => {
    const result = generateRoadmap({
      goal: "Frontend Developer",
      learnerState: {},
      topics: mockTopics
    });

    assert.strictEqual(result.completedTopics.length, 0);
    assert.strictEqual(result.remainingTopics.length, 5);
    assert.strictEqual(result.estimatedSteps, 5);
    assert.strictEqual(result.progressPercentage, 0.0);
  });

  await t.test('Unknown goal handling (returns empty roadmap with message)', () => {
    const result = generateRoadmap({
      goal: "Backend Developer",
      learnerState: {},
      topics: []
    });

    assert.strictEqual(result.goal, "Backend Developer");
    assert.deepStrictEqual(result.roadmap, []);
    assert.deepStrictEqual(result.completedTopics, []);
    assert.deepStrictEqual(result.remainingTopics, []);
    assert.strictEqual(result.estimatedSteps, 0);
    assert.strictEqual(result.progressPercentage, 0.0);
    assert.strictEqual(result.message, "Unknown goal");
  });
});
