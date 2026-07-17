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
class MockQuizProvider extends QuizProvider {
  async generateQuestions({ topicId, difficulty, questionCount }) { // eslint-disable-line no-unused-vars
    const questionsPool = MOCK_QUESTIONS[topicId];
    if (!questionsPool) {
      throw new Error("Topic not found");
    }

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
    return results;
  }
}

/**
 * Generates a structured quiz for a requested topic.
 *
 * @param {Object} params
 * @param {string} params.topicId - Target topic
 * @param {number} params.difficulty - Target difficulty (0-100)
 * @param {number} params.questionCount - Number of questions requested
 * @param {QuizProvider} [provider] - Optional quiz provider implementation (defaults to MockQuizProvider)
 * @returns {Promise<Object>} Standardized quiz output
 */
async function generateQuiz({ topicId, difficulty, questionCount }, provider = new MockQuizProvider()) {
  if (!topicId || typeof topicId !== "string" || topicId.trim() === "") {
    throw new Error("Invalid topicId");
  }
  if (typeof difficulty !== "number" || difficulty < 0 || difficulty > 100 || Number.isNaN(difficulty)) {
    throw new Error("Invalid difficulty");
  }
  if (typeof questionCount !== "number" || questionCount <= 0 || !Number.isInteger(questionCount)) {
    throw new Error("Invalid questionCount");
  }

  const questions = await provider.generateQuestions({ topicId, difficulty, questionCount });

  return {
    topicId,
    difficulty,
    questions
  };
}

module.exports = {
  QuizProvider,
  MockQuizProvider,
  generateQuiz
};
