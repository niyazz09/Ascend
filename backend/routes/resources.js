const express = require('express');
const router = express.Router();
const llmService = require('../services/llm');
const { authenticateToken } = require('../middleware/auth');

/**
 * Helper to generate smart fallbacks for search URLs if LLM is offline.
 */
function generateFallbackResources(topic, category = 'General') {
  const encoded = encodeURIComponent(topic);
  return [
    {
      title: `${topic} Official Documentation & Guides`,
      description: `Authoritative documentation, official getting-started guides, and reference manuals for ${topic}.`,
      type: "Official Documentation",
      difficulty: "All Levels",
      estimatedTime: "2-4 hours",
      tags: [category, topic, "Docs"],
      icon: "BookOpen",
      url: `https://www.google.com/search?q=${encoded}+official+documentation`
    },
    {
      title: `${topic} Masterclass & Video Playlist`,
      description: `Curated video walkthroughs, tutorials, and practical lectures for ${topic}.`,
      type: "YouTube Playlist",
      difficulty: "Beginner - Intermediate",
      estimatedTime: "3-6 hours",
      tags: [category, "Video", "Tutorial"],
      icon: "Video",
      url: `https://www.youtube.com/results?search_query=${encoded}+tutorial+course+playlist`
    },
    {
      title: `Top Open-Source ${topic} Repositories`,
      description: `Explore production codebases, starter templates, and tools built for ${topic} on GitHub.`,
      type: "GitHub Repository",
      difficulty: "Intermediate",
      estimatedTime: "1-3 hours",
      tags: ["Open Source", "GitHub", topic],
      icon: "Code",
      url: `https://github.com/search?q=${encoded}+awesome+learning`
    },
    {
      title: `${topic} Interactive Exercises & Labs`,
      description: `Hands-on coding challenges and online lab environments to practice ${topic}.`,
      type: "Practice Platform",
      difficulty: "Intermediate",
      estimatedTime: "2 hours",
      tags: ["Practice", "Exercises", category],
      icon: "Zap",
      url: `https://www.google.com/search?q=${encoded}+interactive+practice+exercises`
    },
    {
      title: `Recommended Reading: ${topic} Handbook`,
      description: `Comprehensive books, e-books, and in-depth reference guides covering ${topic}.`,
      type: "Book",
      difficulty: "Advanced",
      estimatedTime: "5+ hours",
      tags: ["Books", "Reading", topic],
      icon: "Book",
      url: `https://www.google.com/search?q=${encoded}+best+books+guide`
    },
    {
      title: `${topic} Global Developer Community`,
      description: `Join forums, Discord channels, and discussion groups dedicated to ${topic}.`,
      type: "Community",
      difficulty: "All Levels",
      estimatedTime: "Ongoing",
      tags: ["Community", "Discussion", topic],
      icon: "Users",
      url: `https://www.google.com/search?q=${encoded}+community+forum+discord`
    }
  ];
}

// POST /resources/recommend
router.post('/recommend', authenticateToken, async (req, res) => {
  const { topic, category } = req.body;
  const targetTopic = topic || "Web Development";
  const targetCategory = category || "Programming";

  const responseSchema = {
    type: "OBJECT",
    properties: {
      resources: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            description: { type: "STRING" },
            type: { type: "STRING" },
            difficulty: { type: "STRING" },
            estimatedTime: { type: "STRING" },
            tags: { type: "ARRAY", items: { type: "STRING" } },
            icon: { type: "STRING" },
            url: { type: "STRING" }
          },
          required: ["title", "description", "type", "difficulty", "estimatedTime", "tags", "icon", "url"]
        }
      }
    },
    required: ["resources"]
  };

  const prompt = `Generate a set of 6 high-quality, real, interactive learning resources for the topic "${targetTopic}" under the category "${targetCategory}".
  Resource types must include a mix of: Official Documentation, YouTube Playlist, GitHub Repository, Practice Platform, Course, Book, Interactive Playground, Community, Research Papers.
  For each resource provide a clean direct search or landing URL (e.g., https://google.com/search?q=..., https://github.com/..., https://youtube.com/...).`;

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.json({
      topic: targetTopic,
      category: targetCategory,
      source: "fallback",
      resources: generateFallbackResources(targetTopic, targetCategory)
    });
  }

  try {
    const responseText = await llmService.generateContent({
      prompt,
      systemInstruction: "You are the ASCEND AI Resource Recommendation Engine. Output structured JSON matching the requested schema.",
      responseSchema
    });
    const parsed = JSON.parse(responseText);
    return res.json({
      topic: targetTopic,
      category: targetCategory,
      source: "generated",
      resources: parsed.resources || generateFallbackResources(targetTopic, targetCategory)
    });
  } catch (err) {
    console.warn("LLM Resource Recommendation failed, returning intelligent fallbacks:", err.message);
    return res.json({
      topic: targetTopic,
      category: targetCategory,
      source: "fallback",
      resources: generateFallbackResources(targetTopic, targetCategory)
    });
  }
});

module.exports = router;
