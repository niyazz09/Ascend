const llmService = require('../services/llm');
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
    console.warn("[Schema Validation Error] 'topics' field is not an array or is empty.");
    return false;
  }

  const topicIds = new Set(topics.map(t => t.id));
  const adjList = new Map();

  for (const topic of topics) {
    if (!topic.id || !topic.title || !Array.isArray(topic.prerequisites)) {
      console.warn(`[Schema Validation Error] Topic missing required field (id, title, or prerequisites array):`, topic);
      return false;
    }
    for (const prereqId of topic.prerequisites) {
      if (!topicIds.has(prereqId)) {
        console.warn(`[Schema Validation Error] Topic '${topic.id}' references non-existent prerequisite ID '${prereqId}'.`);
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
      if (hasCycle(prereqId)) {
        console.warn(`[Schema Validation Error] Cyclic prerequisite dependency detected involving topic '${nodeId}'.`);
        return true;
      }
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

function cleanGoal(goal) {
  let clean = goal.replace(/^(learn|study|how to|getting started with|basics of|mastering|introduction to)\s+/i, '');
  clean = clean.trim();
  return clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

function getOfflineFallbackTopics(goal) {
  const g = goal.toLowerCase();
  
  if (g.includes('guitar') || g.includes('music') || g.includes('instrument')) {
    return [
      { id: "guitar-anatomy", title: "Guitar Anatomy & Proper Holding Position", prerequisites: [] },
      { id: "guitar-tuning", title: "Standard Tuning & Pitch Recognition", prerequisites: ["guitar-anatomy"] },
      { id: "guitar-basic-chords", title: "Basic Open Chords (G, C, D, Em)", prerequisites: ["guitar-tuning"] },
      { id: "guitar-strumming", title: "Strumming Patterns & Rhythm Keeping", prerequisites: ["guitar-basic-chords"] },
      { id: "guitar-transitions", title: "Smooth Chord Transitions", prerequisites: ["guitar-strumming"] },
      { id: "guitar-songs", title: "Playing Simple Three-Chord Songs", prerequisites: ["guitar-transitions"] }
    ];
  }
  
  if (g.includes('blender') || g.includes('3d') || g.includes('modeling') || g.includes('sculpting')) {
    return [
      { id: "blender-interface", title: "Blender Viewport & Navigation Basics", prerequisites: [] },
      { id: "blender-primitives", title: "Basic 3D Modeling with Primitives", prerequisites: ["blender-interface"] },
      { id: "blender-edit-mode", title: "Edit Mode: Vertices, Edges & Faces", prerequisites: ["blender-primitives"] },
      { id: "blender-shaders", title: "Applying Shaders & PBR Materials", prerequisites: ["blender-edit-mode"] },
      { id: "blender-lighting", title: "3-Point Lighting Setup", prerequisites: ["blender-shaders"] },
      { id: "blender-rendering", title: "Cycles & Eevee Rendering Basics", prerequisites: ["blender-lighting"] }
    ];
  }
  
  if (g.includes('german') || g.includes('spanish') || g.includes('french') || g.includes('language') || g.includes('speak')) {
    return [
      { id: "lang-greetings", title: "Common Greetings & Personal Introductions", prerequisites: [] },
      { id: "lang-pronunciation", title: "Alphabet, Phonetics & Pronunciation Rules", prerequisites: ["lang-greetings"] },
      { id: "lang-numbers", title: "Numbers, Telling Time & Essential Quantities", prerequisites: ["lang-pronunciation"] },
      { id: "lang-nouns", title: "Nouns, Articles & Basic Case Agreement", prerequisites: ["lang-numbers"] },
      { id: "lang-verbs", title: "Verbs Conjugation & Present Tense Structures", prerequisites: ["lang-nouns"] },
      { id: "lang-sentences", title: "Forming Simple Inquiries & Sentences", prerequisites: ["lang-verbs"] }
    ];
  }
  
  if (g.includes('chemistry') || g.includes('chem') || g.includes('organic')) {
    return [
      { id: "chem-bonding", title: "Carbon Hybridization & Covalent Bonding", prerequisites: [] },
      { id: "chem-nomenclature", title: "IUPAC Nomenclature of Organic Compounds", prerequisites: ["chem-bonding"] },
      { id: "chem-functional", title: "Identifying Key Organic Functional Groups", prerequisites: ["chem-nomenclature"] },
      { id: "chem-resonance", title: "Resonance Structures & Electron Delocalization", prerequisites: ["chem-functional"] },
      { id: "chem-mechanisms", title: "Nucleophilic Substitution (Sn1/Sn2) Mechanisms", prerequisites: ["chem-resonance"] }
    ];
  }

  if (g.includes('history') || g.includes('upsc') || g.includes('civilization')) {
    return [
      { id: "hist-ancient", title: "Ancient Civilizations & Social Foundations", prerequisites: [] },
      { id: "hist-medieval", title: "Medieval Administrative Structures & Trade", prerequisites: ["hist-ancient"] },
      { id: "hist-modern", title: "Colonial Impact & Modern Freedom Movements", prerequisites: ["hist-medieval"] },
      { id: "hist-post", title: "Post-Independence Constitution & Reforms", prerequisites: ["hist-modern"] }
    ];
  }

  if (g.includes('frontend') || g.includes('developer') || g.includes('web') || g.includes('programming') || g.includes('javascript') || g.includes('html') || g.includes('css')) {
    return [
      { id: "html-basics", title: "HTML Basics & Document Structure", prerequisites: [] },
      { id: "css-basics", title: "CSS Basics & Layout Styling", prerequisites: ["html-basics"] },
      { id: "javascript-basics", title: "JavaScript Basics & Dynamic Scripting", prerequisites: ["css-basics"] },
      { id: "web-apis", title: "Web APIs & Asynchronous HTTP Fetching", prerequisites: ["javascript-basics"] },
      { id: "dom-manipulation", title: "DOM Manipulation & User Interaction Events", prerequisites: ["javascript-basics"] }
    ];
  }

  const name = cleanGoal(goal);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || "goal";
  return [
    { id: `${slug}-intro`, title: `Introduction to ${name}`, prerequisites: [] },
    { id: `${slug}-core`, title: `Core Concepts of ${name}`, prerequisites: [`${slug}-intro`] },
    { id: `${slug}-tools`, title: `Essential Tools & Techniques`, prerequisites: [`${slug}-core`] },
    { id: `${slug}-practice`, title: `Practical Applications & Exercises`, prerequisites: [`${slug}-tools`] },
    { id: `${slug}-strategies`, title: `Intermediate & Advanced Strategies`, prerequisites: [`${slug}-practice`] },
    { id: `${slug}-projects`, title: `Real-world Projects & Capstone`, prerequisites: [`${slug}-strategies`] }
  ];
}

function getOfflineFallbackMetadata(goal) {
  const g = goal.toLowerCase();
  if (g.includes('guitar') || g.includes('music') || g.includes('instrument')) {
    return {
      category: "Creative",
      domain: "Music",
      difficulty: "Beginner",
      estimatedDuration: "3 months",
      recommendedStyle: "Practical & auditory practice"
    };
  }
  if (g.includes('blender') || g.includes('3d') || g.includes('modeling') || g.includes('sculpting')) {
    return {
      category: "Creative",
      domain: "3D Design",
      difficulty: "Beginner",
      estimatedDuration: "1 month",
      recommendedStyle: "Visual & step-by-step tutorial reviews"
    };
  }
  if (g.includes('german') || g.includes('spanish') || g.includes('french') || g.includes('language') || g.includes('speak')) {
    return {
      category: "Languages",
      domain: "Linguistics",
      difficulty: "Beginner",
      estimatedDuration: "2 months",
      recommendedStyle: "Spaced repetition & conversational drill"
    };
  }
  if (g.includes('chemistry') || g.includes('chem') || g.includes('organic')) {
    return {
      category: "Academic",
      domain: "Science",
      difficulty: "Intermediate",
      estimatedDuration: "2 months",
      recommendedStyle: "Diagram-based & mechanical reviews"
    };
  }
  if (g.includes('history') || g.includes('upsc') || g.includes('civilization')) {
    return {
      category: "Academic",
      domain: "Social Studies",
      difficulty: "Intermediate",
      estimatedDuration: "3 months",
      recommendedStyle: "Chronological narrative reading"
    };
  }
  if (g.includes('frontend') || g.includes('developer') || g.includes('web') || g.includes('programming') || g.includes('javascript') || g.includes('html') || g.includes('css')) {
    return {
      category: "Programming",
      domain: "Web Development",
      difficulty: "Beginner",
      estimatedDuration: "2 months",
      recommendedStyle: "Project-based learning"
    };
  }
  return {
    category: "Professional Certifications",
    domain: "General Studies",
    difficulty: "Beginner",
    estimatedDuration: "1 month",
    recommendedStyle: "Structured milestones review"
  };
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
    category: { type: "STRING" },
    domain: { type: "STRING" },
    difficulty: { type: "STRING" },
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
 * @param {Object|string} input
 * @returns {Promise<Object>} Analyzed goal and validated topics list
 */
async function analyzeGoal(input) {
  const goal = typeof input === 'string' ? input : (input && input.goal);
  console.log(`[Planner Pipeline Stage 1] learningGoalAnalyzer invoked for goal: "${goal}"`);

  if (!goal || typeof goal !== 'string' || goal.trim() === '') {
    throw new Error("Invalid learning goal");
  }

  const runFallback = (reason) => {
    console.error(`[Planner Fallback Triggered] Exact Fallback Reason: ${reason}`);
    const customTopics = getOfflineFallbackTopics(goal);
    const meta = getOfflineFallbackMetadata(goal);
    const enrichedTopics = customTopics.map(topic => ({
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
      category: meta.category,
      domain: meta.domain,
      difficulty: meta.difficulty,
      estimatedDuration: meta.estimatedDuration,
      prerequisites: [],
      recommendedStyle: meta.recommendedStyle,
      topics: enrichedTopics,
      source: "fallback"
    };
  };

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return runFallback("LLM API key (OPENROUTER_API_KEY / GEMINI_API_KEY) is missing or empty.");
  }

  try {
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
      console.log(`[Planner Pipeline Stage 2] llm.generateContent() Attempt ${attempts}/${maxAttempts} started for goal: "${goal}"`);
      let responseText;
      try {
        responseText = await llmService.generateContent({
          prompt,
          systemInstruction: "You are the ASCEND Learning Goal Analyzer. Your role is to deconstruct any learning goal into a highly structured, valid curriculum DAG (Directed Acyclic Graph) formatted in JSON matching the requested schema.",
          responseSchema: analyzerResponseSchema
        });
        console.log(`[Planner Pipeline Stage 3] llm.generateContent() succeeded. Response length: ${responseText.length} chars.`);
      } catch (geminiErr) {
        console.error(`[Planner Gemini Error] Attempt ${attempts} failed:`, geminiErr.message, geminiErr.stack);
        if (attempts >= maxAttempts) {
          return runFallback(`Gemini API call failed after ${maxAttempts} attempts: ${geminiErr.message}`);
        }
        prompt = `${basePrompt}\n\nWARNING: Previous attempt failed with error: "${geminiErr.message}". Ensure valid output.`;
        continue;
      }

      let cleanedJson;
      let parsed;
      try {
        cleanedJson = repairJson(responseText);
        parsed = JSON.parse(cleanedJson);
        console.log(`[Planner Pipeline Stage 4] JSON parse succeeded.`);
      } catch (jsonErr) {
        console.error(`[Planner JSON Parse Failure] Error: ${jsonErr.message}`);
        console.error(`[Planner JSON Parse Failure] Raw Gemini Response:\n${responseText}`);
        if (attempts >= maxAttempts) {
          return runFallback(`JSON parsing failed after ${maxAttempts} attempts: ${jsonErr.message}`);
        }
        prompt = `${basePrompt}\n\nWARNING: The previous attempt threw a JSON syntax error: "${jsonErr.message}". Ensure valid JSON formatting.`;
        continue;
      }

      const isValid = validateTopics(parsed.topics);
      if (isValid) {
        console.log(`[Planner Pipeline Stage 5] Schema validation succeeded for goal "${goal}". Source: "generated".`);
        parsed.source = "generated";
        return parsed;
      } else {
        console.warn(`[Planner Pipeline Stage 5] Schema validation failed for Attempt ${attempts}.`);
        if (attempts >= maxAttempts) {
          return runFallback(`Schema validation failed on topics array after ${maxAttempts} attempts.`);
        }
        prompt = `${basePrompt}\n\nWARNING: Your previous attempt failed topic/prerequisite validation. Ensure all prerequisite IDs exist in the topics list and there are no loops.`;
      }
    }

    return runFallback(`Exceeded max attempts (${maxAttempts}) without valid DAG structure.`);
  } catch (globalError) {
    return runFallback(`Uncaught Exception in analyzeGoal: ${globalError.message}\nStack: ${globalError.stack}`);
  }
}

module.exports = {
  analyzeGoal,
  validateTopics
};
