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

  const runFallback = () => {
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

  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY environment variable is missing. Running in local fallback mode.");
    return runFallback();
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
      try {
        const responseText = await geminiService.generateContent({
          prompt,
          systemInstruction: "You are the ASCEND Learning Goal Analyzer. Your role is to deconstruct any learning goal into a highly structured, valid curriculum DAG (Directed Acyclic Graph) formatted in JSON matching the requested schema.",
          responseSchema: analyzerResponseSchema
        });

        const cleanedJson = repairJson(responseText);
        const parsed = JSON.parse(cleanedJson);

        if (validateTopics(parsed.topics)) {
          parsed.source = "generated";
          return parsed;
        }

        console.warn(`Attempt ${attempts} generated invalid prerequisites/topics. Retrying...`);
        prompt = `${basePrompt}
        
        WARNING: Your previous attempt failed validation (either there were cyclic prerequisites or missing topic IDs).
        Please ensure all prerequisite IDs exist in the topics list, and that there are absolutely no loops/cycles.`;
        
      } catch (error) {
        console.warn(`Attempt ${attempts} failed to generate or parse roadmap:`, error.message);
        if (attempts >= maxAttempts) {
          console.warn("Exceeded max attempts. Falling back to structured fallback roadmap.");
          return runFallback();
        }
        prompt = `${basePrompt}
        
        WARNING: The previous attempt threw a parsing or generation error: "${error.message}". Please ensure valid JSON formatting.`;
      }
    }

    console.warn("Roadmap validation failed after all attempts. Falling back to structured fallback roadmap.");
    return runFallback();
  } catch (globalError) {
    console.warn("Gemini service failed globally. Falling back to structured fallback roadmap:", globalError.message);
    return runFallback();
  }
}

module.exports = {
  analyzeGoal,
  validateTopics
};
