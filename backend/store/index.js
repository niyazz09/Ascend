const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Reconstructs the state expected by agents from database models.
 * @param {Object} user - User object with relations
 * @returns {Object|null} Reconstructed learner state
 */
function reconstructLearner(user) {
  if (!user) return null;
  const mastery = {};
  if (user.masteries) {
    for (const m of user.masteries) {
      mastery[m.topicId] = m.score;
    }
  }
  const evidenceLog = (user.evidenceLogs || []).map(log => ({
    topicId: log.topicId,
    difficulty: log.difficulty,
    correct: log.correct,
    questionType: log.questionType,
    delta: log.delta,
    previousScore: log.previousScore,
    newScore: log.newScore,
    timestamp: log.timestamp instanceof Date ? log.timestamp.getTime() : Number(log.timestamp)
  }));

  return {
    id: user.id,
    mastery,
    evidenceLog
  };
}

/**
 * Creates a new learner or returns the existing user.
 * @param {string} id - Learner ID
 * @param {Object} [data={}] - Initial state data
 * @returns {Promise<Object>} Reconstructed learner state
 */
async function createLearner(id, data = {}) {
  let user = await prisma.user.findUnique({
    where: { id },
    include: { masteries: true, evidenceLogs: true }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id,
        email: `${id}@example.com`,
        passwordHash: "dummy"
      },
      include: { masteries: true, evidenceLogs: true }
    });
  }

  if (data.mastery) {
    for (const [topicId, score] of Object.entries(data.mastery)) {
      await prisma.mastery.upsert({
        where: { userId_topicId: { userId: id, topicId } },
        update: { score },
        create: { userId: id, topicId, score }
      });
    }
    user = await prisma.user.findUnique({
      where: { id },
      include: { masteries: true, evidenceLogs: true }
    });
  }

  return reconstructLearner(user);
}

/**
 * Gets a learner state.
 * @param {string} id - Learner ID
 * @returns {Promise<Object|null>} Reconstructed learner state
 */
async function getLearner(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { masteries: true, evidenceLogs: true }
  });
  return reconstructLearner(user);
}

/**
 * Saves/updates a learner state.
 * @param {string} id - Learner ID
 * @param {Object} data - Updated state data
 * @returns {Promise<Object>} Updated learner state
 */
async function saveLearner(id, data, newEvidence = []) {
  if (data.mastery) {
    for (const [topicId, score] of Object.entries(data.mastery)) {
      await prisma.mastery.upsert({
        where: { userId_topicId: { userId: id, topicId } },
        update: { score },
        create: { userId: id, topicId, score }
      });
    }
  }

  if (newEvidence && newEvidence.length > 0) {
    for (const log of newEvidence) {
      const mastery = await prisma.mastery.findUnique({
        where: { userId_topicId: { userId: id, topicId: log.topicId } }
      });
      const masteryId = mastery ? mastery.id : (await prisma.mastery.create({
        data: { userId: id, topicId: log.topicId, score: log.newScore }
      })).id;

      await prisma.evidenceLog.create({
        data: {
          userId: id,
          masteryId,
          topicId: log.topicId,
          difficulty: log.difficulty,
          correct: log.correct,
          questionType: log.questionType,
          delta: log.delta,
          previousScore: log.previousScore,
          newScore: log.newScore,
          timestamp: new Date(log.timestamp)
        }
      });
    }
  }

  return getLearner(id);
}

module.exports = {
  createLearner,
  getLearner,
  saveLearner
};
