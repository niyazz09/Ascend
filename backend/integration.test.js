const test = require('node:test');
const assert = require('node:assert');
const app = require('./server');

test('E2E Integration Flow Tests', async (t) => {
  let server;
  let port;
  let baseUrl;

  t.before(() => {
    server = app.listen(0);
    port = server.address().port;
    baseUrl = `http://localhost:${port}`;
  });

  t.after(() => {
    server.close();
  });

  await t.test('GET /health endpoint', async () => {
    const res = await fetch(`${baseUrl}/health`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.deepStrictEqual(data, { status: "ok" });
  });

  await t.test('Full Flow: Planner -> Quiz -> Submit -> Analysis', async () => {
    // 1. POST /planner
    const plannerRes = await fetch(`${baseUrl}/planner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal: "Frontend Developer" })
    });
    const roadmap = await plannerRes.json();
    assert.strictEqual(plannerRes.status, 200);
    assert.strictEqual(roadmap.goal, "Frontend Developer");
    assert.ok(Array.isArray(roadmap.roadmap));
    assert.strictEqual(roadmap.roadmap[0].topicId, "html-basics");
    assert.strictEqual(roadmap.roadmap[0].status, "next");

    // 2. POST /quiz
    const quizRes = await fetch(`${baseUrl}/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId: "html-basics", difficulty: 60, questionCount: 2 })
    });
    const quiz = await quizRes.json();
    assert.strictEqual(quizRes.status, 200);
    assert.strictEqual(quiz.topicId, "html-basics");
    assert.strictEqual(quiz.questions.length, 2);

    // 3. POST /submit (correct answer)
    const submitRes = await fetch(`${baseUrl}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topicId: "html-basics",
        questionResult: {
          difficulty: 80,
          correct: true,
          questionType: "mcq",
          timestamp: Date.now()
        }
      })
    });
    const submitResult = await submitRes.json();
    assert.strictEqual(submitRes.status, 200);
    assert.strictEqual(submitResult.previousScore, 0);
    assert.strictEqual(submitResult.newScore, 12);

    // 4. GET /analysis
    const analysisRes = await fetch(`${baseUrl}/analysis`);
    const analysis = await analysisRes.json();
    assert.strictEqual(analysisRes.status, 200);
    assert.ok(analysis.summary.weakTopics.includes("html-basics"));
    assert.strictEqual(analysis.recommendations.nextTopic, "html-basics");
  });
});
