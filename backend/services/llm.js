const axios = require('axios');

const CANDIDATE_MODELS = [
  process.env.OPENROUTER_MODEL,
  'google/gemini-2.0-flash-lite:free',
  'google/gemini-flash-1.5-exp:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'deepseek/deepseek-r1:free',
  'openrouter/auto'
].filter(Boolean);

/**
 * Invokes OpenRouter LLM API with structured outputs, model fallbacks, retries, and timeout handling.
 * Exact interface contract matching gemini.js so business logic remains untouched.
 *
 * @param {Object} params
 * @param {string} params.prompt - Main user objective/prompt
 * @param {string} [params.systemInstruction] - System role instruction
 * @param {Object} [params.responseSchema] - Optional JSON schema description
 * @returns {Promise<string>} Model response text string
 */
async function generateContent({ prompt, systemInstruction, responseSchema }) {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY (or GEMINI_API_KEY) environment variable is missing.");
  }

  const timeoutMs = 25000;
  const messages = [];

  if (systemInstruction) {
    let sysContent = systemInstruction;
    if (responseSchema) {
      sysContent += `\nCRITICAL: You MUST respond strictly with valid raw JSON matching this schema structure:\n${JSON.stringify(responseSchema, null, 2)}\nDo not wrap output in markdown codeblocks or extra text. Output ONLY valid JSON.`;
    }
    messages.push({ role: 'system', content: sysContent });
  } else if (responseSchema) {
    messages.push({ role: 'system', content: `You MUST respond strictly with valid raw JSON matching this schema:\n${JSON.stringify(responseSchema, null, 2)}\nDo not wrap output in markdown codeblocks.` });
  }

  messages.push({ role: 'user', content: prompt });

  let lastError = null;

  // Try candidate models in sequence
  for (const model of CANDIDATE_MODELS) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[LLM Service OpenRouter] Attempting Model: ${model}`);
    }

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model,
          messages,
          temperature: 0.3,
          response_format: responseSchema ? { type: "json_object" } : undefined
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://ascend-ai.app',
            'X-Title': 'ASCEND AI Learning Platform',
            'Content-Type': 'application/json'
          },
          timeout: timeoutMs
        }
      );

      if (!response.data || !response.data.choices || response.data.choices.length === 0) {
        throw new Error("OpenRouter API returned empty response choices array.");
      }

      let content = response.data.choices[0].message?.content || "";
      content = content.trim();

      if (process.env.NODE_ENV !== 'production') {
        console.log(`[LLM Service OpenRouter Succeeded] Model: ${model} | Response length: ${content.length} chars.`);
      }

      return content;
    } catch (err) {
      const status = err.response ? err.response.status : 'NO_RESPONSE';
      const msg = err.response?.data?.error?.message || err.message;
      console.warn(`[LLM Service Model Failed] Model: ${model} | Status: ${status} | Error: ${msg}`);
      lastError = new Error(`OpenRouter API failed for ${model} (${status}): ${msg}`);
    }
  }

  throw lastError;
}

module.exports = {
  generateContent
};
