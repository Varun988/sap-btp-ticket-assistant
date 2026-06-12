const crypto = require("crypto");

const MAX_HISTORY_SIZE = Number(process.env.TICKET_HISTORY_LIMIT || 100);
const DUPLICATE_THRESHOLD = Number(process.env.DUPLICATE_THRESHOLD || 0.55);

const ticketHistory = [];

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "have",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "user",
  "users",
  "with"
]);

function generateAnalysisId() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 8)
      : crypto.randomBytes(4).toString("hex");

  return `MANUAL-${datePart}-${randomPart}`;
}

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2)
    .filter((token) => !STOP_WORDS.has(token));
}

function calculateSimilarity(textA, textB) {
  const tokensA = new Set(tokenize(textA));
  const tokensB = new Set(tokenize(textB));

  if (tokensA.size === 0 || tokensB.size === 0) {
    return 0;
  }

  let intersectionCount = 0;

  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersectionCount += 1;
    }
  }

  const unionCount = new Set([...tokensA, ...tokensB]).size;

  return Number((intersectionCount / unionCount).toFixed(2));
}

function findPotentialDuplicate(ticketText) {
  let bestMatch = null;

  for (const existingTicket of ticketHistory) {
    const similarity = calculateSimilarity(ticketText, existingTicket.ticketText);

    if (!bestMatch || similarity > bestMatch.similarity) {
      bestMatch = {
        ticketId: existingTicket.ticketId,
        source: existingTicket.source,
        similarity,
        summary: existingTicket.summary,
        category: existingTicket.category,
        priority: existingTicket.priority,
        analyzedAt: existingTicket.analyzedAt
      };
    }
  }

  if (!bestMatch || bestMatch.similarity < DUPLICATE_THRESHOLD) {
    return {
      possibleDuplicate: false,
      similarity: bestMatch ? bestMatch.similarity : 0,
      threshold: DUPLICATE_THRESHOLD
    };
  }

  return {
    possibleDuplicate: true,
    matchedTicketId: bestMatch.ticketId,
    matchedSource: bestMatch.source,
    similarity: bestMatch.similarity,
    threshold: DUPLICATE_THRESHOLD,
    matchedSummary: bestMatch.summary,
    matchedCategory: bestMatch.category,
    matchedPriority: bestMatch.priority,
    matchedAnalyzedAt: bestMatch.analyzedAt
  };
}

function addAnalyzedTicket(
  normalizedTicket,
  ticketText,
  analysisResult,
  duplicateCheck = null
) {
  const analysisId = generateAnalysisId();

  const historyRecord = {
    ticketId: normalizedTicket.ticketId || analysisId,
    source: normalizedTicket.source || "manual",
    title: normalizedTicket.title || null,
    ticketText,
    summary: analysisResult.summary || null,
    category: analysisResult.category || null,
    priority: analysisResult.priority || null,
    severity: analysisResult.severity || null,
    recommendedTeam: analysisResult.recommendedTeam || null,
    confidence: analysisResult.confidence || null,

    duplicateDetected: duplicateCheck?.possibleDuplicate === true,
    duplicateSimilarity: duplicateCheck?.similarity || 0,
    matchedDuplicateTicketId: duplicateCheck?.matchedTicketId || null,

    analyzedAt: new Date().toISOString()
  };

  ticketHistory.unshift(historyRecord);

  if (ticketHistory.length > MAX_HISTORY_SIZE) {
    ticketHistory.pop();
  }

  return historyRecord;
}

function getTicketHistory() {
  return ticketHistory.map((ticket) => ({
    ticketId: ticket.ticketId,
    source: ticket.source,
    title: ticket.title,
    summary: ticket.summary,
    category: ticket.category,
    priority: ticket.priority,
    severity: ticket.severity,
    recommendedTeam: ticket.recommendedTeam,
    confidence: ticket.confidence,

    duplicateDetected: ticket.duplicateDetected,
    duplicateSimilarity: ticket.duplicateSimilarity,
    matchedDuplicateTicketId: ticket.matchedDuplicateTicketId,

    analyzedAt: ticket.analyzedAt
  }));
}

module.exports = {
  findPotentialDuplicate,
  addAnalyzedTicket,
  getTicketHistory,
  calculateSimilarity
};
