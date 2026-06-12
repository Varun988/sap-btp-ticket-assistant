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

function showResult(result) {
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

analyzeBtn.addEventListener("click", analyzeTicket);