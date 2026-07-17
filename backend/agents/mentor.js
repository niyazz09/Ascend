const geminiService = require('../services/gemini');

/**
 * Invokes Gemini to act as a structured learning coach for the student.
 *
 * @param {Object} params
 * @param {string} params.message - The latest user message
 * @param {Array<Object>} [params.history=[]] - Chat history array of { role: 'user'|'model', parts: [{ text: string }] }
 * @param {string} params.goal - Learning goal
 * @param {Array<string>} [params.completedNodes=[]] - Already completed topics
 * @param {string} params.currentNode - Current topic the student is studying
 * @param {string} params.nextNode - Next topic in the roadmap sequence
 * @param {string} params.difficulty - Course difficulty
 * @returns {Promise<string>} Dynamic responder text
 */
async function mentor({ message, history = [], goal, completedNodes = [], currentNode, nextNode, difficulty }) {
  if (!message || typeof message !== 'string') {
    throw new Error("Message is required for the AI Mentor");
  }

  const systemInstruction = `You are the ASCEND AI Learning Coach. Your mission is to guide the student to master their objective: "${goal || 'General Goal'}".
  
  Student Context:
  - Course Difficulty: ${difficulty || 'Beginner'}
  - Completed Topics: [${(completedNodes || []).join(', ')}]
  - Current Topic: "${currentNode || 'Not started'}"
  - Next Recommended Topic: "${nextNode || 'N/A'}"
  
  Guidelines:
  1. Act as a motivational, helpful, and concise mentor.
  2. Do not give away complete answers immediately; guide the student through conceptual steps.
  3. Relate your suggestions back to their current topic ("${currentNode}") or next steps ("${nextNode}") where applicable.
  4. Keep responses under 3 short paragraphs. Use bullet points for structural clarity if explaining concepts.`;

  // Format history for Gemini contents array (if provided)
  const contents = [];
  for (const h of history) {
    if (h.role && h.parts) {
      contents.push(h);
    }
  }
  // Add the final user message
  contents.push({ role: "user", parts: [{ text: message }] });

  // Call Gemini generate content using custom prompt
  // If history is passed, we can merge or use it. But generateContent helper takes prompt directly.
  // Let's serialize the history and prompt together for the simple generateContent helper.
  let fullPrompt = "";
  if (history.length > 0) {
    fullPrompt += "Conversational history:\n";
    for (const msg of history) {
      const speaker = msg.role === 'user' ? 'Student' : 'Coach';
      const text = msg.parts?.[0]?.text || '';
      fullPrompt += `${speaker}: ${text}\n`;
    }
    fullPrompt += "\n";
  }
  fullPrompt += `Student: ${message}`;

  if (!process.env.GEMINI_API_KEY) {
    return `[Offline Fallback Mode] I'm currently running in local offline mode. I see you're studying "${currentNode || goal}". Take a look at the recommended study resources or practice questions to increase your mastery!`;
  }

  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const coachResponse = await geminiService.generateContent({
        prompt: fullPrompt,
        systemInstruction
      });
      return coachResponse;
    } catch (error) {
      console.warn(`Attempt ${attempts} failed for mentor:`, error.message);
      if (attempts >= maxAttempts) {
        console.warn("Exceeded max attempts. Returning fallback coach response.");
        return `[AI Core Unavailable] I am currently experiencing connection issues with my AI core, but I see you are working on "${currentNode || goal}". Keep practicing and attempting the checkpoints to build your mastery!`;
      }
    }
  }
}

module.exports = {
  mentor
};
