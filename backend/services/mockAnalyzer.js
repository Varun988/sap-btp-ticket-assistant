function normalizeText(text) {
  return (text || "").toLowerCase();
}

function buildSummary(ticketText) {
  if (!ticketText) {
    return "No ticket description provided.";
  }

  const trimmed = ticketText.trim();

  if (trimmed.length <= 180) {
    return trimmed;
  }

  return `${trimmed.substring(0, 177)}...`;
}

function countMatches(text, keywords) {
  return keywords.reduce((count, keyword) => {
    return text.includes(keyword) ? count + 1 : count;
  }, 0);
}

function analyzeCategory(text) {
  const categoryRules = [
    {
      category: "Identity and Access Management",
      team: "IAM Support",
      keywords: [
        "login",
        "log in",
        "password",
        "authentication",
        "invalid credentials",
        "locked",
        "idm",
        "user access",
        "account locked",
        "sso",
        "mfa"
      ],
      action:
        "Check password synchronization status, user lock status, authentication logs, pending provisioning tasks, and dispatcher/job status."
    },
    {
      category: "Database",
      team: "Database Support",
      keywords: [
        "database",
        "sql",
        "hana",
        "db",
        "connection timeout",
        "deadlock",
        "query",
        "table",
        "schema"
      ],
      action:
        "Check database connectivity, HANA/database availability, connection pool usage, SQL errors, locks, and recent database changes."
    },
    {
      category: "Performance",
      team: "Application Performance Team",
      keywords: [
        "performance",
        "slow",
        "latency",
        "timeout",
        "delay",
        "taking time",
        "response time",
        "hang",
        "stuck"
      ],
      action:
        "Review application logs, recent deployments, response times, system load, external dependencies, and performance monitoring dashboards."
    },
    {
      category: "Authorization",
      team: "Security / Authorization Team",
      keywords: [
        "authorization",
        "access denied",
        "permission",
        "role",
        "forbidden",
        "403",
        "not authorized",
        "privilege"
      ],
      action:
        "Validate user role assignments, authorization objects, scopes, group memberships, and recent access changes."
    },
    {
      category: "Integration / Interface",
      team: "Integration Support",
      keywords: [
        "api",
        "interface",
        "integration",
        "payload",
        "webhook",
        "destination",
        "http",
        "endpoint",
        "proxy",
        "connection refused"
      ],
      action:
        "Check API endpoint availability, destination configuration, authentication settings, payload format, network/proxy settings, and integration logs."
    }
  ];

  let bestMatch = {
    category: "General IT Support",
    team: "L1 Support",
    score: 0,
    action:
      "Review the ticket details, collect missing information, check application logs, and route to the appropriate support team."
  };

  for (const rule of categoryRules) {
    const score = countMatches(text, rule.keywords);

    if (score > bestMatch.score) {
      bestMatch = {
        category: rule.category,
        team: rule.team,
        score,
        action: rule.action
      };
    }
  }

  return bestMatch;
}

function analyzePriorityAndSeverity(text, category) {
  const criticalSignals = [
    "production down",
    "prod down",
    "system down",
    "outage",
    "all users",
    "multiple users",
    "business critical",
    "revenue impact",
    "sev1",
    "p1",
    "critical",
    "unable to work"
  ];

  const highSignals = [
    "unable to login",
    "cannot login",
    "cannot log in",
    "authentication fails",
    "database down",
    "connection timeout",
    "payment failed",
    "job failed",
    "high priority",
    "urgent"
  ];

  const mediumSignals = [
    "slow",
    "performance",
    "access denied",
    "authorization",
    "permission",
    "role",
    "timeout"
  ];

  if (countMatches(text, criticalSignals) > 0) {
    return {
      priority: "Critical",
      severity: "P1"
    };
  }

  if (
    countMatches(text, highSignals) > 0 ||
    category === "Identity and Access Management" ||
    category === "Database"
  ) {
    return {
      priority: "High",
      severity: "P2"
    };
  }

  if (countMatches(text, mediumSignals) > 0) {
    return {
      priority: "Medium",
      severity: "P3"
    };
  }

  return {
    priority: "Medium",
    severity: "P3"
  };
}

function calculateConfidence(categoryScore, ticketText) {
  const lengthScore = ticketText && ticketText.trim().length > 40 ? 0.2 : 0.05;
  const keywordScore = Math.min(categoryScore * 0.18, 0.55);
  const baseScore = 0.25;

  const confidence = baseScore + lengthScore + keywordScore;

  return Number(Math.min(confidence, 0.95).toFixed(2));
}

function buildMissingInformation(text, category) {
  const questions = [];

  if (
    !text.includes("one user") &&
    !text.includes("single user") &&
    !text.includes("multiple users") &&
    !text.includes("all users")
  ) {
    questions.push("Is the issue affecting one user, multiple users, or all users?");
  }

  if (
    !text.includes("error") &&
    !text.includes("exception") &&
    !text.includes("message") &&
    !text.includes("code")
  ) {
    questions.push("What is the exact error message or error code?");
  }

  if (
    !text.includes("today") &&
    !text.includes("yesterday") &&
    !text.includes("started") &&
    !text.includes("since") &&
    !text.includes("after")
  ) {
    questions.push("When did the issue start?");
  }

  if (
    !text.includes("production") &&
    !text.includes("prod") &&
    !text.includes("quality") &&
    !text.includes("qa") &&
    !text.includes("development") &&
    !text.includes("dev")
  ) {
    questions.push("Which environment is affected: production, QA, or development?");
  }

  if (category === "Identity and Access Management") {
    questions.push("Was there a recent password reset, role change, or account update?");
  }

  if (category === "Database") {
    questions.push("Are there recent database changes, deployments, or connection pool errors?");
  }

  if (category === "Performance") {
    questions.push("Is the slowness consistent or intermittent?");
  }

  return [...new Set(questions)].slice(0, 5);
}

function buildReasoning(text, categoryResult, priorityResult, confidence) {
  const reasoning = [];

  if (categoryResult.score > 0) {
    reasoning.push(
      `Detected ${categoryResult.score} keyword signal(s) related to ${categoryResult.category}.`
    );
  } else {
    reasoning.push("No strong category-specific keyword was found, so the ticket is treated as general support.");
  }

  reasoning.push(`Recommended team is ${categoryResult.team} based on the detected category.`);
  reasoning.push(`Priority is ${priorityResult.priority} with severity ${priorityResult.severity}.`);
  reasoning.push(`Confidence score is ${confidence}.`);

  if (text.includes("production") || text.includes("prod")) {
    reasoning.push("Ticket mentions a production-like environment.");
  }

  if (text.includes("all users") || text.includes("multiple users")) {
    reasoning.push("Ticket indicates wider user impact.");
  }

  return reasoning;
}

function buildDraftResponse(ticketText, category, suggestedAction, missingInformation) {
  const missingInfoText =
    missingInformation.length > 0
      ? `\n\nPlease confirm the following details:\n${missingInformation
          .map((item, index) => `${index + 1}. ${item}`)
          .join("\n")}`
      : "";

  return `Hi,

We have reviewed your ticket and identified it as a ${category} issue.

Initial understanding:
${buildSummary(ticketText)}

Suggested next step:
${suggestedAction}${missingInfoText}

Regards,
Support Team`;
}

function mapKnowledgeBaseSources(wikiArticles) {
  if (!Array.isArray(wikiArticles)) {
    return [];
  }

  return wikiArticles.slice(0, 3).map((article) => ({
    title: article.title || "Untitled Wiki Article",
    source: article.source || article.url || article.link || "",
    score: article.score || null
  }));
}

function analyzeTicketWithMockRules(ticketText, wikiArticles = []) {
  const originalText = ticketText || "";
  const text = normalizeText(originalText);

  const categoryResult = analyzeCategory(text);
  const priorityResult = analyzePriorityAndSeverity(text, categoryResult.category);
  const confidence = calculateConfidence(categoryResult.score, originalText);
  const missingInformation = buildMissingInformation(text, categoryResult.category);
  const knowledgeBaseSources = mapKnowledgeBaseSources(wikiArticles);

  let suggestedAction = categoryResult.action;

  if (knowledgeBaseSources.length > 0) {
    suggestedAction = `Refer to ${knowledgeBaseSources[0].title}: ${suggestedAction}`;
  }

  const reasoning = buildReasoning(text, categoryResult, priorityResult, confidence);
  const draftResponse = buildDraftResponse(
    originalText,
    categoryResult.category,
    suggestedAction,
    missingInformation
  );

  return {
    summary: buildSummary(originalText),
    category: categoryResult.category,
    priority: priorityResult.priority,
    severity: priorityResult.severity,
    confidence,
    recommendedTeam: categoryResult.team,
    suggestedAction,
    missingInformation,
    reasoning,
    draftResponse,
    mode: "enhanced-mock-ai",
    knowledgeBaseSources
  };
}

module.exports = {
  analyzeTicketWithMockRules
};