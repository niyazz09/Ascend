const llmService = require('../services/llm');
const topicsList = require('../data/topics.json');

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
      explanation: "HTML stands for Hyper Text Markup Language and defines the structure of web pages."
    },
    {
      id: "html-q2",
      type: "mcq",
      question: "Which HTML element is used to define the title of a document?",
      options: [
        "<title>",
        "<head>",
        "<header>",
        "<meta>"
      ],
      correctAnswer: "<title>",
      explanation: "The <title> element specifies a title for the HTML document."
    },
    {
      id: "html-q3",
      type: "true_false",
      question: "True or False: The <a> tag is used to create hyperlinks in HTML.",
      options: ["True", "False"],
      correctAnswer: "True",
      explanation: "The <a> (anchor) tag specifies a hyperlink to another page or resource."
    }
  ],
  "css-flexbox": [
    {
      id: "css-q1",
      type: "mcq",
      question: "Which CSS property initiates a flex container?",
      options: [
        "display: flex;",
        "position: absolute;",
        "float: left;",
        "align-items: flex-start;"
      ],
      correctAnswer: "display: flex;",
      explanation: "display: flex transforms an element into a flex container."
    }
  ]
};

class QuizProvider {
  async generateQuestions({ topicId, difficulty, questionCount, topicTitle, goalTitle }) {
    throw new Error("generateQuestions must be implemented by concrete provider");
  }
}

class MockQuizProvider extends QuizProvider {
  async generateQuestions({ topicId, difficulty, questionCount, topicTitle, goalTitle }) {
    if (topicId === "unknown-topic") {
      throw new Error("Topic not found");
    }

    const title = topicTitle || topicId;
    const preExisting = MOCK_QUESTIONS[topicId] || [];
    const results = [...preExisting];

    while (results.length < questionCount) {
      const idx = results.length + 1;
      if (idx % 2 === 0) {
        results.push({
          id: `${topicId}-q${idx}`,
          type: "true_false",
          question: `True or False: Mastering key principles of "${title}" is critical for proficiency in "${goalTitle || 'this subject'}".`,
          options: ["True", "False"],
          correctAnswer: "True",
          explanation: `In the study of "${goalTitle || 'this subject'}", "${title}" forms a core foundational component.`
        });
      } else {
        results.push({
          id: `${topicId}-q${idx}`,
          type: "mcq",
          question: `Which of the following is a key best practice for "${title}"?`,
          options: [
            `Consistently applying structured principles for "${title}"`,
            "Completely ignoring basic prerequisites",
            "Skipping review sessions and practice",
            "Using invalid syntax patterns"
          ],
          correctAnswer: `Consistently applying structured principles for "${title}"`,
          explanation: `Applying structured principles is essential to master "${title}".`
        });
      }
    }

    const finalQuestions = results.slice(0, questionCount);
    finalQuestions.source = "template";
    return finalQuestions;
  }
}

class AIQuizProvider extends QuizProvider {
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

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      attempts = maxAttempts;
    }

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const responseText = await llmService.generateContent({
          prompt,
          systemInstruction: "You are an expert exam generator for the ASCEND learning platform. Generate high-quality questions in JSON matching the schema.",
          responseSchema
        });
        const parsed = JSON.parse(responseText);
        const questions = parsed.questions || [];
        questions.source = "generated";
        return questions;
      } catch (error) {
        if (attempts >= maxAttempts) {
          console.warn("Exceeded max attempts. Falling back to MockQuizProvider.");
        }
      }
    }

    const mock = new MockQuizProvider();
    return mock.generateQuestions({ topicId, difficulty, questionCount, topicTitle, goalTitle });
  }
}

const GeminiQuizProvider = AIQuizProvider;

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
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
    provider = apiKey ? new AIQuizProvider() : new MockQuizProvider();
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
  generateQuiz,
  QuizProvider,
  MockQuizProvider,
  AIQuizProvider,
  GeminiQuizProvider,
  MOCK_QUESTIONS
};
