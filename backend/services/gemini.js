const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let genAI = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

/**
 * Invokes the Gemini API using @google/generative-ai.
 *
 * @param {Object} params
 * @param {string} params.prompt - Main user objective/prompt
 * @param {string} [params.systemInstruction] - Role instruction for system
 * @param {Object} [params.responseSchema] - Optional JSON schema for structured outputs
 * @returns {Promise<string>} Model output string
 */
async function generateContent({ prompt, systemInstruction, responseSchema }) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is missing. Please add it to your .env file.");
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  const modelOptions = {
    model: "gemini-1.5-flash",
  };

  if (systemInstruction) {
    modelOptions.systemInstruction = systemInstruction;
  }

  const generationConfig = {};
  if (responseSchema) {
    generationConfig.responseMimeType = "application/json";
    generationConfig.responseSchema = responseSchema;
  }

  const model = genAI.getGenerativeModel(modelOptions);
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig
  });

  return result.response.text();
}

module.exports = {
  generateContent
};
