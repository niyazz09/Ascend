const llmService = require('../services/llm');

/**
 * Invokes OpenRouter LLM to act as a context-aware learning coach for the student.
 *
 * @param {Object} params
 * @param {string} params.message - The latest user message
 * @param {Array<Object>} [params.history=[]] - Chat history
 * @param {string} params.goal - Target learning goal
 * @param {Array<string>} [params.completedNodes=[]] - Already completed topics
 * @param {Array<string>} [params.weakTopics=[]] - Identified weak topics needing review
 * @param {string} params.currentNode - Current topic
 * @param {string} params.nextNode - Next topic
 * @param {string} params.difficulty - Course difficulty
 * @param {number} [params.streak=0] - Current learning streak
 * @param {number} [params.xp=0] - Total earned XP
 * @returns {Promise<string>} Dynamic responder text
 */
async function mentor({ message, history = [], goal, completedNodes = [], weakTopics = [], currentNode, nextNode, difficulty, streak = 0, xp = 0 }) {
  if (!message || typeof message !== 'string') {
    throw new Error("Message is required for the AI Mentor");
  }

  const systemInstruction = `You are the ASCEND AI Learning Coach. Your mission is to guide the student to master their objective: "${goal || 'General Goal'}".
  
  Student Context:
  - Current Goal: "${goal || 'General Goal'}"
  - Course Difficulty: ${difficulty || 'Beginner'}
  - Current Learning Streak: ${streak} days | Total Earned XP: ${xp} XP
  - Completed Topics: [${(completedNodes || []).join(', ')}]
  - Weak Topics Needing Revision: [${(weakTopics || []).join(', ')}]
  - Current Active Topic: "${currentNode || 'Not started'}"
  - Next Recommended Topic: "${nextNode || 'N/A'}"
  
  Guidelines:
  1. Act as a motivational, highly knowledgeable, and clear AI mentor.
  2. If the user asks for concept explanations, provide intuitive breakdowns with real-world examples.
  3. If the student has weak topics, proactively suggest quick revision steps or mini-projects.
  4. Keep responses structured, concise (2-3 short paragraphs), and encourage active practice.`;

  let fullPrompt = "";
  if (history.length > 0) {
    fullPrompt += "Conversational history:\n";
    for (const msg of history) {
      const speaker = msg.role === 'user' ? 'Student' : 'Coach';
      const text = msg.parts?.[0]?.text || msg.content || '';
      fullPrompt += `${speaker}: ${text}\n`;
    }
    fullPrompt += "\n";
  }
  fullPrompt += `Student: ${message}`;

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return `[Offline Fallback Mode] I'm currently running in local offline mode. I see you're studying "${currentNode || goal}". Take a look at the recommended study resources or practice questions to increase your mastery!`;
  }

  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const coachResponse = await llmService.generateContent({
        prompt: fullPrompt,
        systemInstruction
      });
      return coachResponse;
    } catch (error) {
      console.warn(`Attempt ${attempts} failed for mentor:`, error.message);
      if (attempts >= maxAttempts) {
        return `[AI Core Unavailable] I am currently experiencing connection issues with my AI core, but I see you are working on "${currentNode || goal}". Keep practicing and attempting the checkpoints to build your mastery!`;
      }
    }
  }
}

module.exports = {
  mentor
};
