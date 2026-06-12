function normalizeManualTicket(ticketText) {
  const description = typeof ticketText === "string" ? ticketText.trim() : "";

  return {
    ticketId: null,
    source: "manual",
    title: null,
    description,
    requester: null,
    createdAt: new Date().toISOString(),
    raw: {
      ticketText
    }
  };
}

function normalizeServiceNowTicket(serviceNowTicket) {
  return {
    ticketId: serviceNowTicket?.number || serviceNowTicket?.sys_id || null,
    source: "servicenow",
    title: serviceNowTicket?.short_description || null,
    description: serviceNowTicket?.description || serviceNowTicket?.short_description || "",
    requester: serviceNowTicket?.caller_id || null,
    priority: serviceNowTicket?.priority || null,
    createdAt: serviceNowTicket?.sys_created_on || null,
    raw: serviceNowTicket
  };
}

function normalizeJiraTicket(jiraIssue) {
  return {
    ticketId: jiraIssue?.key || null,
    source: "jira",
    title: jiraIssue?.fields?.summary || null,
    description:
      typeof jiraIssue?.fields?.description === "string"
        ? jiraIssue.fields.description
        : jiraIssue?.fields?.summary || "",
    requester: jiraIssue?.fields?.reporter?.displayName || null,
    priority: jiraIssue?.fields?.priority?.name || null,
    createdAt: jiraIssue?.fields?.created || null,
    raw: jiraIssue
  };
}

function getTicketText(normalizedTicket) {
  if (!normalizedTicket) {
    return "";
  }

  return [
    normalizedTicket.title,
    normalizedTicket.description
  ]
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function buildTicketMetadata(normalizedTicket) {
  if (!normalizedTicket) {
    return {
      source: "unknown",
      ticketId: null
    };
  }

  return {
    source: normalizedTicket.source || "unknown",
    ticketId: normalizedTicket.ticketId || null,
    requester: normalizedTicket.requester || null,
    createdAt: normalizedTicket.createdAt || null,
    priorityFromSource: normalizedTicket.priority || null
  };
}

module.exports = {
  normalizeManualTicket,
  normalizeServiceNowTicket,
  normalizeJiraTicket,
  getTicketText,
  buildTicketMetadata
};