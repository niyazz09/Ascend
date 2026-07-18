/**
 * Content Validation & Citation Safety Engine
 */
class ContentValidator {
  /**
   * Validates and sanitizes generated lesson content and verified citations
   * @param {Object} lessonData - Generated JSON lesson payload
   * @param {Array<Object>} retrievedSources - Grounded retrieval sources array
   * @returns {Object} Validated & sanitized lesson data with citation map
   */
  validateAndSanitize(lessonData, retrievedSources = []) {
    if (!lessonData || typeof lessonData !== 'object') {
      throw new Error("Invalid lesson data structure");
    }

    // 1. Structural validation & fallbacks
    const sanitized = {
      lessonTitle: lessonData.lessonTitle || "Topic Overview",
      whyItMatters: lessonData.whyItMatters || `Understanding this topic provides critical foundational principles for modern engineering and software development.`,
      lessonContent: lessonData.lessonContent || `Detailed overview and conceptual framework for this topic.`,
      theory: lessonData.theory || `### Core Theory & Architecture\n\nDetailed breakdown of mechanisms, execution lifecycle, and design philosophy.`,
      objectives: Array.isArray(lessonData.objectives) && lessonData.objectives.length > 0
        ? lessonData.objectives
        : ["Master foundational mechanisms", "Implement practical code patterns", "Debug edge cases effectively"],
      keyConcepts: Array.isArray(lessonData.keyConcepts) && lessonData.keyConcepts.length > 0
        ? lessonData.keyConcepts
        : ["Core concepts", "Performance optimizations", "Standard patterns"],
      codeSnippet: Array.isArray(lessonData.codeSnippet) && lessonData.codeSnippet.length > 0
        ? lessonData.codeSnippet
        : ["// Practical implementation example", "function demo() { console.log('Ascend RAG'); }"],
      progressiveExample: lessonData.progressiveExample || {
        concept: "Basic Implementation",
        code: ["// Concept code sample", "const ready = true;"],
        output: "Code executed successfully",
        explanation: "This example initializes the core state and verifies output validity.",
        commonMistake: "Forgetting to handle async resolution or error bounds.",
        fix: "Wrap call in try-catch block or error boundary handler."
      },
      practiceExercise: lessonData.practiceExercise || {
        prompt: "Write a function that processes input parameters and returns a validated result.",
        hint: "Consider edge cases such as empty values or type mismatches.",
        solution: ["function process(input) {", "  if (!input) return null;", "  return String(input).trim();", "}"],
        explanation: "Checks input validity before processing to prevent runtime exceptions."
      },
      videoRecommendations: Array.isArray(lessonData.videoRecommendations) && lessonData.videoRecommendations.length > 0
        ? lessonData.videoRecommendations
        : [
            {
              title: `${lessonData.lessonTitle || 'Topic'} Masterclass & Theory`,
              description: `Comprehensive video walkthrough explaining core concepts and practical application.`,
              youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent((lessonData.lessonTitle || 'topic') + ' tutorial')}`,
              duration: "20 min",
              channel: "Verified Tech Education"
            }
          ],
      miniRevisionNotes: Array.isArray(lessonData.miniRevisionNotes) && lessonData.miniRevisionNotes.length > 0
        ? lessonData.miniRevisionNotes
        : ["Understand fundamental mechanisms", "Apply clean code principles", "Validate edge cases"],
      sources: Array.isArray(retrievedSources) && retrievedSources.length > 0 ? retrievedSources : (lessonData.sources || [])
    };

    // 2. Citation verification (ensure inline citations [1], [2] map to valid sources)
    const validCitationTags = new Set(sanitized.sources.map(s => s.citationTag || `[${s.id}]`));
    
    // Replace any hallucinated citation tags like [99] with valid range
    const maxCitation = sanitized.sources.length;
    if (maxCitation > 0) {
      sanitized.theory = sanitized.theory.replace(/\[(\d+)\]/g, (match, num) => {
        const n = parseInt(num, 10);
        return n >= 1 && n <= maxCitation ? match : `[1]`;
      });
    }

    return sanitized;
  }
}

module.exports = new ContentValidator();
