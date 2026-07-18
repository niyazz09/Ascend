const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Ascend Observability & Telemetry Service
 */
class TelemetryService {
  /**
   * Logs an action metric to console and database
   * @param {Object} params
   * @param {string} params.action - e.g. "LESSON_GENERATION", "RAG_RETRIEVAL"
   * @param {number} params.latencyMs - Action duration in milliseconds
   * @param {boolean} [params.cacheHit=false] - Whether retrieved from cache
   * @param {string} [params.provider="System"] - e.g. "Tavily", "Brave", "Cache", "LLM"
   * @param {number} [params.citationCount=0] - Number of verified citations
   * @param {number} [params.confidenceScore=100] - RAG confidence score
   */
  async log({ action, latencyMs, cacheHit = false, provider = "System", citationCount = 0, confidenceScore = 100 }) {
    const summary = `[Telemetry] ${action} | Latency: ${latencyMs}ms | CacheHit: ${cacheHit} | Provider: ${provider} | Citations: ${citationCount} | Confidence: ${confidenceScore}%`;
    console.log(summary);

    try {
      await prisma.telemetryLog.create({
        data: {
          action,
          latencyMs,
          cacheHit,
          provider,
          citationCount,
          confidenceScore
        }
      });
    } catch (err) {
      console.warn("[Telemetry Warning] Failed to persist telemetry log to DB:", err.message);
    }
  }
}

module.exports = new TelemetryService();
