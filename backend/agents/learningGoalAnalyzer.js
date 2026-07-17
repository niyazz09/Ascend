const geminiService = require('../services/gemini');
const fallbackTopics = require('../data/topics.json');

/**
 * Validates a generated topics list to ensure:
 * 1. It is a non-empty array.
 * 2. All prerequisite IDs actually exist in the topics list.
 * 3. The prerequisites do not form any cyclic dependencies.
 * 
 * @param {Array<Object>} topics - List of topics to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateTopics(topics) {
  if (!Array.isArray(topics) || topics.length === 0) {
    return false;
  }

  const topicIds = new Set(topics.map(t => t.id));
  const adjList = new Map();

  for (const topic of topics) {
    if (!topic.id || !topic.title || !Array.isArray(topic.prerequisites)) {
      return false;
    }
    // Verify prerequisites exist in the topics list
    for (const prereqId of topic.prerequisites) {
      if (!topicIds.has(prereqId)) {
        return false;
      }
    }
    adjList.set(topic.id, topic.prerequisites);
  }

  // Cycle detection via DFS
  const visited = new Set();
  const visiting = new Set();

  function hasCycle(nodeId) {
    if (visiting.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;

    visiting.add(nodeId);
    const prereqs = adjList.get(nodeId) || [];
    for (const prereqId of prereqs) {
      if (hasCycle(prereqId)) return true;
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  }

  for (const topic of topics) {
    if (hasCycle(topic.id)) {
      return false;
    }
  }

  return true;
}

/**
 * Attempts to repair common JSON syntax issues.
 * 
 * @param {string} str - Raw string response
 * @returns {string} Cleaned JSON string
 */
function repairJson(str) {
  let cleaned = str.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
  }
  return cleaned.trim();
}

/**
 * Structured schema to enforce response schema structure with Gemini.
 */
const analyzerResponseSchema = {
  type: "OBJECT",
  properties: {
    goal: { type: "STRING" },
    category: { type: "STRING", enum: ["Programming", "Academic", "Languages", "Creative", "Professional Certifications"] },
    domain: { type: "STRING" },
    difficulty: { type: "STRING", enum: ["Beginner", "Intermediate", "Advanced", "Expert"] },
    estimatedDuration: { type: "STRING" },
    prerequisites: { type: "ARRAY", items: { type: "STRING" } },
    recommendedStyle: { type: "STRING" },
    topics: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          title: { type: "STRING" },
          prerequisites: { type: "ARRAY", items: { type: "STRING" } },
          resources: {
            type: "OBJECT",
            properties: {
              documentation: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  description: { type: "STRING" },
                  link: { type: "STRING" }
                },
                required: ["title", "description", "link"]
              },
              videos: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  description: { type: "STRING" },
                  link: { type: "STRING" }
                },
                required: ["title", "description", "link"]
              },
              books: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  description: { type: "STRING" },
                  link: { type: "STRING" }
                },
                required: ["title", "description", "link"]
              },
              practice: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  description: { type: "STRING" },
                  link: { type: "STRING" }
                },
                required: ["title", "description", "link"]
              },
              interactive: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  description: { type: "STRING" },
                  link: { type: "STRING" }
                },
                required: ["title", "description", "link"]
              }
            },
            required: ["documentation", "videos", "books", "practice", "interactive"]
          }
        },
        required: ["id", "title", "prerequisites", "resources"]
      }
    }
  },
  required: ["goal", "category", "domain", "difficulty", "estimatedDuration", "prerequisites", "recommendedStyle", "topics"]
};

/**
 * Analyzes a learning goal input and generates a structured topic path.
 * Retries once with a stricter prompt if validation fails.
 * 
 * @param {Object} params
 * @param {string} params.goal - Raw goal string input
 * @returns {Promise<Object>} Analyzed goal and validated topics list
 */
async function analyzeGoal({ goal }) {
  if (!goal || typeof goal !== 'string' || goal.trim() === '') {
    throw new Error("Invalid learning goal");
  }

  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY environment variable is missing. Running in local fallback mode.");
    const enrichedTopics = fallbackTopics.map(topic => ({
      ...topic,
      resources: {
        documentation: { title: "Official Documentation", description: `Learn core guidelines of ${topic.title}.`, link: `https://google.com/search?q=${encodeURIComponent(topic.title + ' documentation')}` },
        videos: { title: "YouTube Tutorials Playlist", description: `Watch deep-dive walkthroughs on ${topic.title}.`, link: `https://youtube.com/results?search_query=${encodeURIComponent(topic.title)}` },
        books: { title: "Recommended Textbooks", description: `Read popular guides covering ${topic.title}.`, link: `https://google.com/search?q=${encodeURIComponent(topic.title + ' books')}` },
        practice: { title: "Practice Platform Exercises", description: `Interactive challenges for ${topic.title}.`, link: `https://google.com/search?q=${encodeURIComponent(topic.title + ' practice exercises')}` },
        interactive: { title: "Interactive Sandbox Tools", description: `Play around with live models of ${topic.title}.`, link: `https://google.com/search?q=${encodeURIComponent(topic.title + ' sandbox')}` }
      }
    }));
    return {
      goal: goal,
      category: "Programming",
      domain: "Web Development",
      difficulty: "Beginner",
      estimatedDuration: "2 months",
      prerequisites: [],
      recommendedStyle: "Project-based learning",
      topics: enrichedTopics
    };
  }

  const basePrompt = `Analyze the learning goal: "${goal}".
  Deconstruct it into a structured learning path with between 4 and 8 topics.
  Map logical prerequisites between these topics. Ensure that:
  1. Every prerequisite ID matches one of the topic IDs in your topics array.
  2. There are absolutely no circular dependencies (e.g. Topic A depending on Topic B, while Topic B depends on Topic A).
  3. The topic IDs should be short, URL-friendly kebab-case strings.`;

  let prompt = basePrompt;
  let attempts = 0;
  const maxAttempts = 2;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const responseText = await geminiService.generateContent({
        prompt,
        systemInstruction: "You are the ASCEND Learning Goal Analyzer. Your role is to deconstruct any learning goal into a highly structured, valid curriculum DAG (Directed Acyclic Graph) formatted in JSON matching the requested schema.",
        responseSchema: analyzerResponseSchema
      });

      const cleanedJson = repairJson(responseText);
      const parsed = JSON.parse(cleanedJson);

      // Validate structure and prerequisite connections
      if (validateTopics(parsed.topics)) {
        return parsed;
      }

      console.warn(`Attempt ${attempts} generated invalid prerequisites/topics. Retrying...`);
      // Update prompt for retry with stricter warnings
      prompt = `${basePrompt}
      
      WARNING: Your previous attempt failed validation (either there were cyclic prerequisites or missing topic IDs).
      Please ensure all prerequisite IDs exist in the topics list, and that there are absolutely no loops/cycles.`;
      
    } catch (error) {
      console.warn(`Attempt ${attempts} failed to generate or parse roadmap:`, error.message);
      if (attempts >= maxAttempts) {
        throw new Error(`Failed to generate a valid roadmap after ${maxAttempts} attempts.`);
      }
      prompt = `${basePrompt}
      
      WARNING: The previous attempt threw a parsing or generation error: "${error.message}". Please ensure valid JSON formatting.`;
    }
  }

  throw new Error("Roadmap generation failed validation.");
}

module.exports = {
  analyzeGoal,
  validateTopics
};
