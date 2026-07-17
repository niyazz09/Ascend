const test = require('node:test');
const assert = require('node:assert');

// Mock databases
const mockUserDb = {};
const mockMasteryDb = {};
const mockEvidenceDb = {};
const mockGoalDb = {};
const mockRoadmapDb = {};
const mockNodeDb = {};
const mockRecommendationDb = {};

// Replace the PrismaClient class entirely in the module cache
const prismaClientModule = require('@prisma/client');

prismaClientModule.PrismaClient = class MockPrismaClient {
  constructor() {
    this.user = {
      findUnique: async (args) => {
        const { where } = args;
        let user = null;
        if (where.email) {
          user = Object.values(mockUserDb).find(u => u.email === where.email);
        } else if (where.id) {
          user = mockUserDb[where.id];
        }
        if (!user) return null;

        const userMasteries = Object.values(mockMasteryDb).filter(m => m.userId === user.id);
        const userEvidence = Object.values(mockEvidenceDb).filter(e => e.userId === user.id);
        const userGoals = Object.values(mockGoalDb)
          .filter(g => g.userId === user.id)
          .sort((a, b) => b.createdAt - a.createdAt);

        const populatedGoals = userGoals.map(goal => {
          const roadmap = Object.values(mockRoadmapDb).find(r => r.goalId === goal.id);
          let populatedRoadmap = null;
          if (roadmap) {
            const nodes = Object.values(mockNodeDb).filter(n => n.roadmapId === roadmap.id);
            populatedRoadmap = { ...roadmap, nodes };
          }
          return { ...goal, roadmap: populatedRoadmap };
        });

        const recommendation = Object.values(mockRecommendationDb).find(r => r.userId === user.id) || null;

        return {
          ...user,
          masteries: userMasteries,
          evidenceLogs: userEvidence,
          goals: populatedGoals,
          recommendation
        };
      },
      create: async ({ data }) => {
        const id = data.id || `user-${Math.random()}`;
        const newUser = { id, email: data.email, passwordHash: data.passwordHash };
        mockUserDb[id] = newUser;
        return { ...newUser, masteries: [], evidenceLogs: [] };
      }
    };

    this.learningGoal = {
      create: async ({ data }) => {
        const id = `goal-${Math.random()}`;
        const record = { id, title: data.title, userId: data.userId, createdAt: new Date() };
        mockGoalDb[id] = record;
        return record;
      }
    };

    this.roadmap = {
      create: async ({ data }) => {
        const id = `roadmap-${Math.random()}`;
        const record = { id, goalId: data.goalId, progressPercentage: data.progressPercentage || 0 };
        mockRoadmapDb[id] = record;
        return record;
      }
    };

    this.roadmapNode = {
      create: async ({ data }) => {
        const id = `node-${Math.random()}`;
        const record = {
          id,
          roadmapId: data.roadmapId,
          topicId: data.topicId,
          title: data.title,
          status: data.status,
          prerequisites: data.prerequisites || []
        };
        mockNodeDb[id] = record;
        return record;
      }
    };

    this.mastery = {
      findUnique: async ({ where }) => {
        if (where.userId_topicId) {
          const { userId, topicId } = where.userId_topicId;
          return Object.values(mockMasteryDb).find(m => m.userId === userId && m.topicId === topicId) || null;
        }
        return null;
      },
      upsert: async ({ where, update, create }) => {
        const { userId, topicId } = where.userId_topicId;
        let record = Object.values(mockMasteryDb).find(m => m.userId === userId && m.topicId === topicId);
        if (record) {
          record.score = update.score;
          record.updatedAt = new Date();
        } else {
          const id = `mastery-${Math.random()}`;
          record = { id, userId, topicId, score: create.score, updatedAt: new Date() };
          mockMasteryDb[id] = record;
        }
        return record;
      },
      create: async ({ data }) => {
        const id = `mastery-${Math.random()}`;
        const record = { id, ...data, updatedAt: new Date() };
        mockMasteryDb[id] = record;
        return record;
      }
    };

    this.evidenceLog = {
      findMany: async ({ where }) => {
        return Object.values(mockEvidenceDb).filter(e => e.userId === where.userId);
      },
      create: async ({ data }) => {
        const id = `evidence-${Math.random()}`;
        const record = { id, ...data, timestamp: new Date() };
        mockEvidenceDb[id] = record;
        return record;
      },
      count: async ({ where }) => {
        return Object.values(mockEvidenceDb).filter(e => e.userId === where.userId).length;
      }
    };
  }
};

const app = require('./server');

test('E2E Integration & Authentication Flow Tests', async (t) => {
  let server;
  let port;
  let baseUrl;

  t.before(() => {
    // Clear mock DBs to prevent conflicts on repeated test runs
    for (const key of Object.keys(mockUserDb)) delete mockUserDb[key];
    for (const key of Object.keys(mockMasteryDb)) delete mockMasteryDb[key];
    for (const key of Object.keys(mockEvidenceDb)) delete mockEvidenceDb[key];
    for (const key of Object.keys(mockGoalDb)) delete mockGoalDb[key];
    for (const key of Object.keys(mockRoadmapDb)) delete mockRoadmapDb[key];
    for (const key of Object.keys(mockNodeDb)) delete mockNodeDb[key];
    for (const key of Object.keys(mockRecommendationDb)) delete mockRecommendationDb[key];

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

  await t.test('Authentication, E2E flow, & Dashboard API Checks', async () => {
    // 1. Verify protected endpoints return 401 without auth header
    const plannerRes1 = await fetch(`${baseUrl}/planner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal: "Frontend Developer" })
    });
    assert.strictEqual(plannerRes1.status, 401);

    // 2. Signup
    const signupRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: "dashboard@example.com", password: "password123" })
    });
    const signupData = await signupRes.json();
    assert.strictEqual(signupRes.status, 201);
    const token = signupData.token;

    // 3. GET /dashboard initially (should return empty defaults)
    const dashboardRes1 = await fetch(`${baseUrl}/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dashboard1 = await dashboardRes1.json();
    assert.strictEqual(dashboardRes1.status, 200);
    assert.strictEqual(dashboard1.user.email, "dashboard@example.com");
    assert.strictEqual(dashboard1.currentGoal, null);
    assert.strictEqual(dashboard1.roadmap.goal, "");
    assert.strictEqual(dashboard1.stats.overallProgress, 0.0);
    assert.strictEqual(dashboard1.stats.streak, 0);

    // 4. POST /planner (creates goal, roadmap, and nodes)
    const plannerRes2 = await fetch(`${baseUrl}/planner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ goal: "Frontend Developer" })
    });
    assert.strictEqual(plannerRes2.status, 200);

    // 5. POST /submit (adds mastery delta)
    const submitRes = await fetch(`${baseUrl}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
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
    assert.strictEqual(submitRes.status, 200);

    // 6. GET /dashboard again (should fetch populated roadmap, goals, stats, and streak)
    const dashboardRes2 = await fetch(`${baseUrl}/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dashboard2 = await dashboardRes2.json();
    assert.strictEqual(dashboardRes2.status, 200);
    assert.strictEqual(dashboard2.currentGoal.title, "Frontend Developer");
    assert.strictEqual(dashboard2.roadmap.roadmap[0].topicId, "html-basics");
    assert.strictEqual(dashboard2.stats.overallProgress, 0.0);
    assert.strictEqual(dashboard2.stats.quizAttempts, 1);
    assert.strictEqual(dashboard2.stats.streak, 1);
    assert.strictEqual(dashboard2.mastery[0].topicId, "html-basics");
    assert.strictEqual(dashboard2.mastery[0].score, 12);
  });

  await t.test('Orchestrator Agent Flow (POST /orchestrate)', async () => {
    // Signup another user for fresh stats
    const signupRes = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: "orch@example.com", password: "password123" })
    });
    const signupData = await signupRes.json();
    const token = signupData.token;

    // E2E call for "learn" intent
    const learnRes = await fetch(`${baseUrl}/orchestrate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        input: "I want to learn HTML",
        additionalParams: { goal: "Frontend Developer" }
      })
    });
    const data = await learnRes.json();
    assert.strictEqual(learnRes.status, 200);
    assert.deepStrictEqual(data.executedAgents, ["PlannerAgent", "QuizGeneratorAgent", "AnalyzerAgent"]);
    assert.ok(data.roadmap);
    assert.ok(data.initialQuiz);
    assert.ok(data.analysis);
  });
});
