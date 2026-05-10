function analyzeTicketWithMockRules(ticketText) {
  const text = ticketText.toLowerCase();

  let category = "General IT Support";
  let priority = "Medium";
  let suggestedAction =
    "Review the ticket details and assign it to the appropriate support team.";

  if (
    text.includes("login") ||
    text.includes("password") ||
    text.includes("authentication") ||
    text.includes("locked") ||
    text.includes("idm")
  ) {
    category = "Identity and Access Management";
    priority = "High";
    suggestedAction =
      "Check user lock status, password synchronization, authentication logs, and identity management provisioning status.";
  } else if (
    text.includes("database") ||
    text.includes("sql") ||
    text.includes("hana") ||
    text.includes("connection timeout")
  ) {
    category = "Database";
    priority = "High";
    suggestedAction =
      "Check database availability, connection pool usage, SQL errors, and recent database changes.";
  } else if (
    text.includes("performance") ||
    text.includes("slow") ||
    text.includes("latency") ||
    text.includes("timeout")
  ) {
    category = "Performance";
    priority = "Medium";
    suggestedAction =
      "Check application logs, response times, recent deployments, and system resource usage.";
  } else if (
    text.includes("authorization") ||
    text.includes("access denied") ||
    text.includes("permission") ||
    text.includes("role")
  ) {
    category = "Authorization";
    priority = "Medium";
    suggestedAction =
      "Verify assigned roles, authorization objects, role collections, and recent access changes.";
  }

  const summary =
    ticketText.length > 120
      ? ticketText.substring(0, 120).trim() + "..."
      : ticketText;

  return {
    summary,
    category,
    priority,
    suggestedAction,
    mode: "mock-ai"
  };
}

module.exports = {
  analyzeTicketWithMockRules
};