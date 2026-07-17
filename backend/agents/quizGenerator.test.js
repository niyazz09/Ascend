const test = require('node:test');
const assert = require('node:assert');
const { generateQuiz } = require('./quizGenerator');

test('Quiz Generator Agent Tests', async (t) => {
  await t.test('Valid quiz generation & schema validation', async () => {
    const result = await generateQuiz({
      topicId: "html-basics",
      difficulty: 60,
      questionCount: 3
    });

    assert.strictEqual(result.topicId, "html-basics");
    assert.strictEqual(result.difficulty, 60);
    assert.strictEqual(result.questions.length, 3);

    // Validate the questions schema structure
    result.questions.forEach(q => {
      assert.ok(q.id);
      assert.ok(q.type === 'mcq' || q.type === 'true_false');
      assert.ok(q.question);
      assert.ok(Array.isArray(q.options));
      assert.ok(q.correctAnswer);
      assert.ok(q.explanation);
    });
  });

  await t.test('Invalid topic handling', async () => {
    await assert.rejects(async () => {
      await generateQuiz({
        topicId: "unknown-topic",
        difficulty: 50,
        questionCount: 3
      });
    }, /Topic not found/);

    await assert.rejects(async () => {
      await generateQuiz({
        topicId: "",
        difficulty: 50,
        questionCount: 3
      });
    }, /Invalid topicId/);

    await assert.rejects(async () => {
      await generateQuiz({
        topicId: 123,
        difficulty: 50,
        questionCount: 3
      });
    }, /Invalid topicId/);
  });

  await t.test('Invalid difficulty handling', async () => {
    await assert.rejects(async () => {
      await generateQuiz({
        topicId: "html-basics",
        difficulty: -10,
        questionCount: 3
      });
    }, /Invalid difficulty/);

    await assert.rejects(async () => {
      await generateQuiz({
        topicId: "html-basics",
        difficulty: 105,
        questionCount: 3
      });
    }, /Invalid difficulty/);

    await assert.rejects(async () => {
      await generateQuiz({
        topicId: "html-basics",
        difficulty: "hard",
        questionCount: 3
      });
    }, /Invalid difficulty/);
  });

  await t.test('Invalid question count handling', async () => {
    await assert.rejects(async () => {
      await generateQuiz({
        topicId: "html-basics",
        difficulty: 50,
        questionCount: -1
      });
    }, /Invalid questionCount/);

    await assert.rejects(async () => {
      await generateQuiz({
        topicId: "html-basics",
        difficulty: 50,
        questionCount: 2.5
      });
    }, /Invalid questionCount/);

    await assert.rejects(async () => {
      await generateQuiz({
        topicId: "html-basics",
        difficulty: 50,
        questionCount: "five"
      });
    }, /Invalid questionCount/);
  });

  await t.test('Deterministic mock output', async () => {
    const params = {
      topicId: "html-basics",
      difficulty: 60,
      questionCount: 5
    };

    const res1 = await generateQuiz(params);
    const res2 = await generateQuiz(params);

    assert.deepStrictEqual(res1, res2);
  });
});
