const { analyzeTicketWithMockRules } = require("./mockAnalyzer");

/**
 * Future SAP Generative AI Hub integration point.
 *
 * Planned flow:
 * 1. Read SAP AI Core credentials from service binding / VCAP_SERVICES.
 * 2. Build a prompt for ticket analysis.
 * 3. Call SAP Generative AI Hub orchestration or foundation model endpoint.
 * 4. Ask model to return structured JSON.
 * 5. Validate and normalize the model response.
 *
 * Current trial-safe behavior:
 * If SAP AI Core credentials are not available, fallback to mock analyzer.
 */
async function analyzeTicketWithGenAI(ticketText) {
  const hasAiCoreConfig =
    process.env.AICORE_CLIENT_ID &&
    process.env.AICORE_CLIENT_SECRET &&
    process.env.AICORE_AUTH_URL &&
    process.env.AICORE_BASE_URL &&
    process.env.AICORE_RESOURCE_GROUP;

  if (!hasAiCoreConfig) {
    console.warn(
      "SAP AI Core / Generative AI Hub configuration not found. Falling back to mock analyzer."
    );

    const fallbackResult = analyzeTicketWithMockRules(ticketText);

    return {
      ...fallbackResult,
      mode: "mock-ai-fallback-genai-not-configured"
    };
  }

  /**
   * TODO:
   * Implement real SAP Generative AI Hub call here when AI Core credentials
   * are available.
   *
   * Future implementation may use:
   * - SAP Cloud SDK for AI
   * - SAP AI Core service binding
   * - Generative AI Hub orchestration API
   */

  throw new Error(
    "Generative AI Hub integration placeholder reached, but real AI call is not implemented yet."
  );
}

module.exports = {
  analyzeTicketWithGenAI
};