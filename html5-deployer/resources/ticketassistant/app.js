const ticketTextElement = document.getElementById("ticketText");
const analyzeBtn = document.getElementById("analyzeBtn");
const loadingElement = document.getElementById("loading");
const errorBox = document.getElementById("errorBox");
const resultCard = document.getElementById("resultCard");

const summaryElement = document.getElementById("summary");
const categoryElement = document.getElementById("category");
const priorityElement = document.getElementById("priority");
const suggestedActionElement = document.getElementById("suggestedAction");
const modeElement = document.getElementById("mode");
let latestResult = null;
function showLoading(isLoading) {
  loadingElement.classList.toggle("hidden", !isLoading);
  analyzeBtn.disabled = isLoading;
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function hideError() {
  errorBox.textContent = "";
  errorBox.classList.add("hidden");
}

function setTextIfExists(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value || "-";
  }
}

function setListIfExists(id, items, emptyMessage) {
  const element = document.getElementById(id);

  if (!element) {
    return;
  }

  element.innerHTML = "";

  if (!Array.isArray(items) || items.length === 0) {
    const li = document.createElement("li");
    li.textContent = emptyMessage || "No items available.";
    element.appendChild(li);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");

    if (typeof item === "string") {
      li.textContent = item;
    } else if (item && typeof item === "object") {
      const title = item.title || "Untitled Source";
      const source = item.source ? ` - ${item.source}` : "";
      const score = item.score ? ` (score: ${item.score})` : "";
      li.textContent = `${title}${source}${score}`;
    } else {
      li.textContent = String(item);
    }

    element.appendChild(li);
  });
}

function setDuplicateCheckIfExists(id, duplicateCheck) {
  const element = document.getElementById(id);

  if (!element) {
    return;
  }

  element.innerHTML = "";

  if (!duplicateCheck) {
    element.textContent = "Duplicate check was not performed.";
    element.className = "duplicate-check duplicate-neutral";
    return;
  }

  if (!duplicateCheck.possibleDuplicate) {
    element.textContent = `No likely duplicate found. Similarity: ${
      duplicateCheck.similarity !== undefined ? Math.round(duplicateCheck.similarity * 100) : 0
    }%.`;
    element.className = "duplicate-check duplicate-ok";
    return;
  }

  const duplicateMessage = document.createElement("div");
  duplicateMessage.className = "duplicate-title";
  duplicateMessage.textContent = "Possible duplicate ticket found.";

  const details = document.createElement("ul");
  details.className = "result-list";

  const fields = [
    ["Matched Ticket ID", duplicateCheck.matchedTicketId],
    ["Matched Source", duplicateCheck.matchedSource],
    [
      "Similarity",
      duplicateCheck.similarity !== undefined
        ? `${Math.round(duplicateCheck.similarity * 100)}%`
        : "-"
    ],
    ["Matched Category", duplicateCheck.matchedCategory],
    ["Matched Priority", duplicateCheck.matchedPriority],
    ["Matched Summary", duplicateCheck.matchedSummary],
    ["Matched Analyzed At", duplicateCheck.matchedAnalyzedAt]
  ];

  fields.forEach(([label, value]) => {
    if (value) {
      const li = document.createElement("li");
      li.textContent = `${label}: ${value}`;
      details.appendChild(li);
    }
  });

  element.appendChild(duplicateMessage);
  element.appendChild(details);
  element.className = "duplicate-check duplicate-warning";
}

function showResult(result) {
  latestResult = result;
  summaryElement.textContent = result.summary || "-";
  categoryElement.textContent = result.category || "-";
  priorityElement.textContent = result.priority || "-";
  suggestedActionElement.textContent = result.suggestedAction || "-";
  modeElement.textContent = result.mode || "-";

  setTextIfExists("severity", result.severity);

  setTextIfExists(
    "confidence",
    result.confidence !== undefined && result.confidence !== null
      ? `${Math.round(result.confidence * 100)}%`
      : "-"
  );

  setTextIfExists("recommendedTeam", result.recommendedTeam);
  setTextIfExists("draftResponse", result.draftResponse);

  setListIfExists(
    "missingInformation",
    result.missingInformation,
    "No missing information detected."
  );

  setListIfExists(
    "reasoning",
    result.reasoning,
    "No reasoning details available."
  );

  setListIfExists(
    "knowledgeBaseSources",
    result.knowledgeBaseSources,
    "No knowledge base sources found."
  );
  setTextIfExists("ticketSource", result.ticket?.source);
  setTextIfExists("ticketId", result.ticket?.ticketId || "Manual Input");
  setTextIfExists("ticketSource", result.ticket?.source);
  setTextIfExists("ticketId", result.ticket?.ticketId || "Manual Input");
  setDuplicateCheckIfExists("duplicateCheck", result.duplicateCheck);
  resultCard.classList.remove("hidden");
}

async function analyzeTicket() {
  const ticketText = ticketTextElement.value.trim();

  hideError();
  resultCard.classList.add("hidden");

  if (!ticketText) {
    showError("Please enter a ticket description.");
    return;
  }

  showLoading(true);

  try {
    const response = await fetch("/api/analyze-ticket", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ticketText
      })
    });

    if (!response.ok) {
      throw new Error(`Backend returned status ${response.status}`);
    }

    const result = await response.json();
    showResult(result);
  } catch (error) {
    console.error("Error while analyzing ticket:", error);
    showError(
      "Failed to analyze ticket. Please check App Router route, backend destination, and backend availability."
    );
  } finally {
    showLoading(false);
  }
}
async function submitFeedback(feedbackType) {
  const feedbackStatus = document.getElementById("feedbackStatus");
  const feedbackCommentElement = document.getElementById("feedbackComment");

  if (!latestResult) {
    if (feedbackStatus) {
      feedbackStatus.textContent = "Please analyze a ticket before submitting feedback.";
      feedbackStatus.className = "feedback-status feedback-error";
    }
    return;
  }

  const ticketId = latestResult.ticket?.ticketId || null;
  const comment = feedbackCommentElement ? feedbackCommentElement.value.trim() : "";

  if (feedbackStatus) {
    feedbackStatus.textContent = "Saving feedback...";
    feedbackStatus.className = "feedback-status feedback-neutral";
  }

  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ticketId,
        feedbackType,
        comment
      })
    });

    if (!response.ok) {
      throw new Error(`Feedback API returned status ${response.status}`);
    }

    if (feedbackStatus) {
      feedbackStatus.textContent = "Feedback saved. Thank you.";
      feedbackStatus.className = "feedback-status feedback-success";
    }

    if (feedbackCommentElement) {
      feedbackCommentElement.value = "";
    }
  } catch (error) {
    console.error("Error submitting feedback:", error);

    if (feedbackStatus) {
      feedbackStatus.textContent = "Failed to save feedback. Please try again.";
      feedbackStatus.className = "feedback-status feedback-error";
    }
  }
}

analyzeBtn.addEventListener("click", analyzeTicket);

document.querySelectorAll(".feedback-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const feedbackType = button.getAttribute("data-feedback");
    submitFeedback(feedbackType);
  });
});
