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

function showResult(result) {
  summaryElement.textContent = result.summary;
  categoryElement.textContent = result.category;
  priorityElement.textContent = result.priority;
  suggestedActionElement.textContent = result.suggestedAction;
  modeElement.textContent = result.mode;

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