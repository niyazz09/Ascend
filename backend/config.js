const JWT_SECRET = process.env.JWT_SECRET;

function validateConfig() {
  if (!process.env.JWT_SECRET) {
    throw new Error("[FATAL CONFIG ERROR] JWT_SECRET environment variable is missing. Please set JWT_SECRET in your .env file.");
  }
  const hasLLMKey = Boolean(
    (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim() !== "") ||
    (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== "")
  );
  console.log(`[Startup] LLM API Key detected: ${hasLLMKey}`);
}

module.exports = {
  JWT_SECRET,
  validateConfig
};
