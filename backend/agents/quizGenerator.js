const geminiService = require('../services/gemini');

const MOCK_QUESTIONS = {
  "html-basics": [
    {
      id: "html-q1",
      type: "mcq",
      question: "What does HTML stand for?",
      options: [
        "Hyper Text Markup Language",
        "Home Tool Markup Language",
        "Hyperlinks and Text Markup Language",
        "Hyper Tool Markup Language"
      ],
      correctAnswer: "Hyper Text Markup Language",
      explanation: "HTML stands for Hyper Text Markup Language, which is the standard markup language for creating web pages."
    },
    {
      id: "html-q2",
      type: "true_false",
      question: "The <title> element is placed inside the <body> element.",
      options: ["True", "False"],
      correctAnswer: "False",
      explanation: "The <title> element belongs in the <head> element of an HTML document."
    },
    {
      id: "html-q3",
      type: "mcq",
      question: "Which HTML element is used for the largest heading?",
      options: ["<h6>", "<heading>", "<h1>", "<head>"],
      correctAnswer: "<h1>",
      explanation: "<h1> defines the most important and largest heading."
    },
    {
      id: "html-q4",
      type: "true_false",
      question: "The <img> element is an empty element and does not require a closing tag.",
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: "The <img> tag is self-closing/empty and contains attributes only."
    },
    {
      id: "html-q5",
      type: "mcq",
      question: "Which attribute is used to specify a unique identifier for an HTML element?",
      options: ["class", "id", "name", "style"],
      correctAnswer: "id",
      explanation: "The id attribute specifies a unique id for an HTML element."
    }
  ],
  "css-basics": [
    {
      id: "css-q1",
      type: "mcq",
      question: "What does CSS stand for?",
      options: [
        "Cascading Style Sheets",
        "Colorful Style Sheets",
        "Computer Style Sheets",
        "Creative Style Sheets"
      ],
      correctAnswer: "Cascading Style Sheets",
      explanation: "CSS stands for Cascading Style Sheets."
    },
    {
      id: "css-q2",
      type: "true_false",
      question: "External style sheets are defined within the <style> element inside the HTML body.",
      options: ["True", "False"],
      correctAnswer: "False",
      explanation: "External style sheets are referenced using the <link> tag inside the <head> section."
    }
  ]
};

/**
 * Base QuizProvider interface.
 * Abstract class defining the required contract for generating questions.
 */
class QuizProvider {
  /**
   * Generates questions for a given topic.
   * @param {Object} input
   * @param {string} input.topicId - The topic ID
   * @param {number} input.difficulty - The assessment difficulty (0-100)
   * @param {number} input.questionCount - The number of questions requested
   * @returns {Promise<Array<Object>>} A promise resolving to the list of structured questions
   */
  async generateQuestions(input) { // eslint-disable-line no-unused-vars
    throw new Error("generateQuestions() not implemented");
  }
}

/**
 * Mock implementation of QuizProvider returning pre-defined deterministic questions.
 */
const VALID_TOPIC_IDS = new Set([
  "html-basics", "css-basics", "javascript-basics", "web-apis", "dom-manipulation",
  "guitar-anatomy", "guitar-tuning", "guitar-basic-chords", "guitar-strumming", "guitar-transitions", "guitar-songs",
  "blender-interface", "blender-primitives", "blender-edit-mode", "blender-shaders", "blender-lighting", "blender-rendering",
  "lang-greetings", "lang-pronunciation", "lang-numbers", "lang-nouns", "lang-verbs", "lang-sentences",
  "chem-bonding", "chem-nomenclature", "chem-functional", "chem-resonance", "chem-mechanisms",
  "hist-ancient", "hist-medieval", "hist-modern", "hist-post"
]);

class MockQuizProvider extends QuizProvider {
  async generateQuestions({ topicId, difficulty, questionCount, topicTitle, goalTitle }) {
    if (!VALID_TOPIC_IDS.has(topicId)) {
      throw new Error("Topic not found");
    }
    const title = topicTitle || topicId;
    const questionsPool = MOCK_QUESTIONS[topicId];

    if (questionsPool) {
      const results = [];
      for (let i = 0; i < questionCount; i++) {
        const original = questionsPool[i % questionsPool.length];
        results.push({
          id: `${original.id}-${i + 1}`,
          type: original.type,
          question: original.question,
          options: [...original.options],
          correctAnswer: original.correctAnswer,
          explanation: original.explanation
        });
      }
      results.source = "curated";
      return results;
    }

    const results = [];
    for (let i = 0; i < questionCount; i++) {
      if (i % 2 === 0) {
        results.push({
          id: `${topicId}-q${i + 1}`,
          type: "true_false",
          question: `True or False: Mastering the foundational principles of "${title}" is highly critical for achieving proficiency in "${goalTitle || 'this subject'}".`,
          options: ["True", "False"],
          correctAnswer: "True",
          explanation: `In the study of "${goalTitle || 'this subject'}", "${title}" forms a vital core component that cannot be skipped.`
        });
      } else {
        results.push({
          id: `${topicId}-q${i + 1}`,
          type: "mcq",
          question: `Which of the following is considered a best practice when working with "${title}"?`,
          options: [
            `Consistently applying structured techniques for "${title}"`,
            "Completely ignoring basic prerequisites",
            "Skipping review sessions and quizzes",
            "Using incorrect reference structures"
          ],
          correctAnswer: `Consistently applying structured techniques for "${title}"`,
          explanation: `Applying structured techniques is the optimal way to master and apply "${title}" in practice.`
        });
      }
    }
    results.source = "template";
    return results;
  }
}

class GeminiQuizProvider extends QuizProvider {
  async generateQuestions({ topicId, difficulty, questionCount, topicTitle, goalTitle }) {
    const responseSchema = {
      type: "OBJECT",
      properties: {
        questions: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING" },
              type: { type: "STRING", enum: ["mcq", "true_false"] },
              question: { type: "STRING" },
              options: { type: "ARRAY", items: { type: "STRING" } },
              correctAnswer: { type: "STRING" },
              explanation: { type: "STRING" }
            },
            required: ["id", "type", "question", "options", "correctAnswer", "explanation"]
          }
        }
      },
      required: ["questions"]
    };

    const prompt = `Generate exactly ${questionCount} multiple choice questions (mcq or true_false) for the topic "${topicTitle || topicId}" inside the curriculum of "${goalTitle || 'General Study'}".
    The difficulty should be around ${difficulty} out of 100.
    Ensure the options array contains the correct answer. For true_false, options must be exactly ["True", "False"].`;

    let attempts = 0;
    const maxAttempts = 2;

    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY environment variable is missing. Falling back to mock provider directly.");
      attempts = maxAttempts;
    }

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const responseText = await geminiService.generateContent({
          prompt,
          systemInstruction: "You are an expert exam generator for the ASCEND learning platform. Generate high-quality questions in JSON matching the schema.",
          responseSchema
        });
        const parsed = JSON.parse(responseText);
        const questions = parsed.questions || [];
        questions.source = "generated";
        return questions;
      } catch (error) {
        console.warn(`Attempt ${attempts} failed for GeminiQuizProvider:`, error.message);
        if (attempts >= maxAttempts) {
          console.warn("Exceeded max attempts. Falling back to MockQuizProvider.");
        }
      }
    }

    const mock = new MockQuizProvider();
    return mock.generateQuestions({ topicId, difficulty, questionCount, topicTitle, goalTitle });
  }
}

/**
 * Generates a structured quiz for a requested topic.
 *
 * @param {Object} params
 * @param {string} params.topicId - Target topic
 * @param {number} params.difficulty - Target difficulty (0-100)
 * @param {number} params.questionCount - Number of questions requested
 * @param {string} [params.topicTitle] - Topic title
 * @param {string} [params.goalTitle] - Goal title
 * @param {QuizProvider} [provider] - Optional quiz provider implementation (defaults to MockQuizProvider)
 * @returns {Promise<Object>} Standardized quiz output
 */
async function generateQuiz({ topicId, difficulty, questionCount, topicTitle, goalTitle }, provider) {
  if (!topicId || typeof topicId !== "string" || topicId.trim() === "") {
    throw new Error("Invalid topicId");
  }
  if (typeof difficulty !== "number" || difficulty < 0 || difficulty > 100 || Number.isNaN(difficulty)) {
    throw new Error("Invalid difficulty");
  }
  if (typeof questionCount !== "number" || questionCount <= 0 || !Number.isInteger(questionCount)) {
    throw new Error("Invalid questionCount");
  }

  if (!provider) {
    provider = process.env.GEMINI_API_KEY ? new GeminiQuizProvider() : new MockQuizProvider();
  }

  const questions = await provider.generateQuestions({ topicId, difficulty, questionCount, topicTitle, goalTitle });
  const source = questions.source || "template";

  return {
    topicId,
    difficulty,
    questions,
    source
  };
}

module.exports = {
  QuizProvider,
  MockQuizProvider,
  GeminiQuizProvider,
  generateQuiz
};
