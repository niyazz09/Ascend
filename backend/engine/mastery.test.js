const test = require('node:test');
const assert = require('node:assert');
const { updateMastery } = require('./mastery');

test('Mastery Engine Tests', async (t) => {
  await t.test('Correct answer increases mastery', () => {
    const learnerState = { mastery: { 'html-basics': 60 } };
    const result = updateMastery({
      learnerState,
      topicId: 'html-basics',
      questionResult: {
        difficulty: 80,
        correct: true,
        questionType: 'mcq',
        timestamp: 1752740000
      }
    });

    assert.strictEqual(result.previousScore, 60);
    assert.strictEqual(result.expectedPerformance, 0.6);
    assert.strictEqual(result.actualPerformance, 1);
    assert.strictEqual(result.delta, 4.8);
    assert.strictEqual(result.newScore, 64.8);
    assert.strictEqual(learnerState.mastery['html-basics'], 64.8);
  });

  await t.test('Wrong answer decreases mastery', () => {
    const learnerState = { mastery: { 'html-basics': 60 } };
    const result = updateMastery({
      learnerState,
      topicId: 'html-basics',
      questionResult: {
        difficulty: 80,
        correct: false,
        questionType: 'mcq',
        timestamp: 1752740000
      }
    });

    assert.strictEqual(result.previousScore, 60);
    assert.strictEqual(result.expectedPerformance, 0.6);
    assert.strictEqual(result.actualPerformance, 0);
    assert.strictEqual(result.delta, -7.2);
    assert.strictEqual(result.newScore, 52.8);
    assert.strictEqual(learnerState.mastery['html-basics'], 52.8);
  });

  await t.test('Score never exceeds 100', () => {
    const learnerState = { mastery: { 'html-basics': 95 } };
    const result = updateMastery({
      learnerState,
      topicId: 'html-basics',
      questionResult: {
        difficulty: 100,
        correct: true,
        questionType: 'mcq',
        timestamp: 1752740000
      },
      k: 200
    });

    assert.strictEqual(result.newScore, 100);
    assert.strictEqual(learnerState.mastery['html-basics'], 100);
  });

  await t.test('Score never drops below 0', () => {
    const learnerState = { mastery: { 'html-basics': 5 } };
    const result = updateMastery({
      learnerState,
      topicId: 'html-basics',
      questionResult: {
        difficulty: 100,
        correct: false,
        questionType: 'mcq',
        timestamp: 1752740000
      },
      k: 200
    });

    assert.strictEqual(result.newScore, 0);
    assert.strictEqual(learnerState.mastery['html-basics'], 0);
  });

  await t.test('Evidence object contains expected fields', () => {
    const learnerState = { mastery: { 'html-basics': 60 } };
    const result = updateMastery({
      learnerState,
      topicId: 'html-basics',
      questionResult: {
        difficulty: 80,
        correct: true,
        questionType: 'mcq',
        timestamp: 1752740000
      }
    });

    const ev = result.evidence;
    assert.ok(ev);
    assert.strictEqual(ev.topicId, 'html-basics');
    assert.strictEqual(ev.timestamp, 1752740000);
    assert.strictEqual(ev.questionType, 'mcq');
    assert.strictEqual(ev.difficulty, 80);
    assert.strictEqual(ev.correct, true);
    assert.strictEqual(ev.previousScore, 60);
    assert.strictEqual(ev.delta, 4.8);
    assert.strictEqual(ev.newScore, 64.8);
  });

  await t.test('Same input always produces same output (determinism)', () => {
    const getParams = () => ({
      learnerState: { mastery: { 'html-basics': 50 } },
      topicId: 'html-basics',
      questionResult: {
        difficulty: 50,
        correct: true,
        questionType: 'mcq',
        timestamp: 12345
      }
    });

    const res1 = updateMastery(getParams());
    const res2 = updateMastery(getParams());

    assert.deepStrictEqual(res1, res2);
  });
});
