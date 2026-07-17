const test = require('node:test');
const assert = require('node:assert');
const { updateMastery } = require('./mastery');

test('Mastery Engine Tests', async (t) => {
  await t.test('Easy-correct: mastery=70, difficulty=30, correct=true', () => {
    // scale = 20
    // difficulty - mastery = 30 - 70 = -40
    // exponent = -40 / 20 = -2
    // expected = 1 / (1 + 10^-2) = 1 / 1.01 = 0.9900990099...
    // delta = 15 * (1 - 0.9900990099) = 15 * 0.00990099 = 0.1485... -> rounded to 0.15
    // newScore = 70 + 0.15 = 70.15
    const learnerState = { mastery: { 'html-basics': 70 } };
    const result = updateMastery({
      learnerState,
      topicId: 'html-basics',
      questionResult: {
        difficulty: 30,
        correct: true,
        questionType: 'mcq',
        timestamp: 1752740000
      }
    });

    assert.strictEqual(result.previousScore, 70);
    assert.strictEqual(result.actualPerformance, 1);
    assert.strictEqual(result.delta, 0.15);
    assert.strictEqual(result.newScore, 70.15);
    assert.strictEqual(learnerState.mastery['html-basics'], 70.15);
  });

  await t.test('Easy-wrong: mastery=70, difficulty=30, correct=false', () => {
    // scale = 20
    // difficulty - mastery = 30 - 70 = -40
    // exponent = -40 / 20 = -2
    // expected = 1 / (1 + 10^-2) = 1 / 1.01 = 0.9900990099...
    // delta = 15 * (0 - 0.9900990099) = -14.851... -> rounded to -14.85
    // newScore = 70 - 14.85 = 55.15
    const learnerState = { mastery: { 'html-basics': 70 } };
    const result = updateMastery({
      learnerState,
      topicId: 'html-basics',
      questionResult: {
        difficulty: 30,
        correct: false,
        questionType: 'mcq',
        timestamp: 1752740000
      }
    });

    assert.strictEqual(result.previousScore, 70);
    assert.strictEqual(result.actualPerformance, 0);
    assert.strictEqual(result.delta, -14.85);
    assert.strictEqual(result.newScore, 55.15);
    assert.strictEqual(learnerState.mastery['html-basics'], 55.15);
  });

  await t.test('Hard-correct: mastery=30, difficulty=70, correct=true', () => {
    // scale = 20
    // difficulty - mastery = 70 - 30 = 40
    // exponent = 40 / 20 = 2
    // expected = 1 / (1 + 10^2) = 1 / 101 = 0.009900990099...
    // delta = 15 * (1 - 0.009900990099) = 15 * 0.99009901 = 14.851... -> rounded to 14.85
    // newScore = 30 + 14.85 = 44.85
    const learnerState = { mastery: { 'html-basics': 30 } };
    const result = updateMastery({
      learnerState,
      topicId: 'html-basics',
      questionResult: {
        difficulty: 70,
        correct: true,
        questionType: 'mcq',
        timestamp: 1752740000
      }
    });

    assert.strictEqual(result.previousScore, 30);
    assert.strictEqual(result.actualPerformance, 1);
    assert.strictEqual(result.delta, 14.85);
    assert.strictEqual(result.newScore, 44.85);
    assert.strictEqual(learnerState.mastery['html-basics'], 44.85);
  });

  await t.test('Hard-wrong: mastery=30, difficulty=70, correct=false', () => {
    // scale = 20
    // difficulty - mastery = 70 - 30 = 40
    // exponent = 40 / 20 = 2
    // expected = 1 / (1 + 10^2) = 1 / 101 = 0.009900990099...
    // delta = 15 * (0 - 0.009900990099) = -0.1485... -> rounded to -0.15
    // newScore = 30 - 0.15 = 29.85
    const learnerState = { mastery: { 'html-basics': 30 } };
    const result = updateMastery({
      learnerState,
      topicId: 'html-basics',
      questionResult: {
        difficulty: 70,
        correct: false,
        questionType: 'mcq',
        timestamp: 1752740000
      }
    });

    assert.strictEqual(result.previousScore, 30);
    assert.strictEqual(result.actualPerformance, 0);
    assert.strictEqual(result.delta, -0.15);
    assert.strictEqual(result.newScore, 29.85);
    assert.strictEqual(learnerState.mastery['html-basics'], 29.85);
  });

  await t.test('Expert-misses-easy vs Novice-misses-hard comparison', () => {
    // Expert misses easy: mastery=90, difficulty=10, correct=false
    // Expected expectedPerformance = 1 / (1 + 10^-4) = 1 / 1.0001 ≈ 0.99990001
    // Expected delta = 15 * (0 - 0.99990001) = -14.9985 -> rounded to -15.00
    const expertState = { mastery: { 'guitar': 90 } };
    const expertResult = updateMastery({
      learnerState: expertState,
      topicId: 'guitar',
      questionResult: {
        difficulty: 10,
        correct: false,
        questionType: 'mcq',
        timestamp: 1752740000
      }
    });

    // Novice misses hard: mastery=10, difficulty=90, correct=false
    // Expected expectedPerformance = 1 / (1 + 10^4) = 1 / 10001 ≈ 0.00009999
    // Expected delta = 15 * (0 - 0.00009999) = -0.0014998 -> rounded to -0.00
    const noviceState = { mastery: { 'guitar': 10 } };
    const noviceResult = updateMastery({
      learnerState: noviceState,
      topicId: 'guitar',
      questionResult: {
        difficulty: 90,
        correct: false,
        questionType: 'mcq',
        timestamp: 1752740000
      }
    });

    assert.strictEqual(expertResult.delta, -15.00);
    assert.strictEqual(noviceResult.delta, -0.00);
    assert.ok(expertResult.delta !== noviceResult.delta);
    assert.ok(expertResult.delta < noviceResult.delta);
  });

  await t.test('Clamping at 0 and 100', () => {
    // Exceeds 100: mastery=95, difficulty=95, correct=true, k=200
    // expected = 1 / (1 + 10^0) = 0.5
    // delta = 200 * (1 - 0.5) = 100
    // newScore = 95 + 100 = 195 -> clamped to 100
    const stateHigh = { mastery: { 'guitar': 95 } };
    const resultHigh = updateMastery({
      learnerState: stateHigh,
      topicId: 'guitar',
      questionResult: {
        difficulty: 95,
        correct: true,
        questionType: 'mcq',
        timestamp: 1752740000
      },
      k: 200
    });
    assert.strictEqual(resultHigh.newScore, 100);

    // Drops below 0: mastery=5, difficulty=5, correct=false, k=200
    // expected = 1 / (1 + 10^0) = 0.5
    // delta = 200 * (0 - 0.5) = -100
    // newScore = 5 - 100 = -95 -> clamped to 0
    const stateLow = { mastery: { 'guitar': 5 } };
    const resultLow = updateMastery({
      learnerState: stateLow,
      topicId: 'guitar',
      questionResult: {
        difficulty: 5,
        correct: false,
        questionType: 'mcq',
        timestamp: 1752740000
      },
      k: 200
    });
    assert.strictEqual(resultLow.newScore, 0);
  });

  await t.test('Determinism (same input -> same output)', () => {
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
