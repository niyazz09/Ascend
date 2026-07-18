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
async function mentor({
  message,
  history = [],
  goal,
  completedNodes = [],
  weakTopics = [],
  currentNode,
  nextNode,
  difficulty,
  streak = 0,
  xp = 0,
  lessonContext = null,
  mode = 'teaching'
}) {
  if (!message || typeof message !== 'string') {
    throw new Error("Message is required for the AI Mentor");
  }

  const modeInstructions = {
    teaching: "Focus on clear, intuitive explanations, real-world analogies, and foundational mechanics.",
    hint: "Do NOT reveal the answer directly! Give a subtle nudge or key question to guide the student's thinking.",
    debugging: "Act as a senior software engineer helping debug code syntax, logic bounds, and edge cases.",
    revision: "Provide high-yield bulleted review points, key formulas, and quick conceptual checks.",
    interview: "Act as a tech interviewer asking targeted technical follow-ups and assessing depth."
  };

  const selectedModeGuidance = modeInstructions[mode] || modeInstructions.teaching;

  let lessonMemorySnippet = "";
  if (lessonContext) {
    lessonMemorySnippet = `
  Active Grounded Lesson Context:
  - Lesson Title: "${lessonContext.lessonTitle || currentNode || ''}"
  - Why It Matters: "${lessonContext.whyItMatters || ''}"
  - Core Theory Summary: "${(lessonContext.theory || '').slice(0, 800)}"
  - Grounded Verified Sources: [${(lessonContext.sources || []).map(s => s.websiteName).join(', ')}]
  `;
  }

  const systemInstruction = `You are the ASCEND AI Learning OS Coach (${mode.toUpperCase()} MODE).
  Your mission is to guide the student to master their objective: "${goal || 'General Goal'}".
  
  Selected Mentor Mode: ${mode.toUpperCase()}
  Guidance: ${selectedModeGuidance}
  
  Student Context:
  - Current Goal: "${goal || 'General Goal'}"
  - Course Difficulty: ${difficulty || 'Beginner'}
  - Current Learning Streak: ${streak} days | XP: ${xp} XP
  - Completed Topics: [${(completedNodes || []).join(', ')}]
  - Weak Topics Needing Revision: [${(weakTopics || []).join(', ')}]
  - Current Active Topic: "${currentNode || 'Not started'}"
  - Next Recommended Topic: "${nextNode || 'N/A'}"
  ${lessonMemorySnippet}
  
  Guidelines:
  1. Act as a motivational, highly knowledgeable professor and senior engineer.
  2. Maintain lesson memory persistence — reference the active lesson context and verified sources if available.
  3. Keep responses structured, readable in dark UI, concise (2-3 short paragraphs), and encourage active practice.`;

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
    return `[Offline Fallback Mode] I'm currently running in local offline mode. I see you're studying "${currentNode || goal}". Review the active lesson theory and practice exercises to build your mastery!`;
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
        return `[AI Core Unavailable] I am currently experiencing connection issues, but I see you are working on "${currentNode || goal}". Keep practicing!`;
      }
    }
  }
}

module.exports = {
  mentor
};
