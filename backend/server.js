const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

function analyzeTicket(ticketText) {
  const text = ticketText.toLowerCase();

  let category = "General IT Support";
  let priority = "Medium";
  let suggestedAction = "Review the ticket details and assign it to the appropriate support team.";

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

app.get("/", (req, res) => {
  res.json({
    message: "SAP BTP Ticket Assistant Backend is running",
    status: "OK"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    service: "ticket-assistant-backend"
  });
});

app.post("/analyze-ticket", (req, res) => {
  const { ticketText } = req.body;

  if (!ticketText || ticketText.trim().length === 0) {
    return res.status(400).json({
      error: "ticketText is required"
    });
  }

  const result = analyzeTicket(ticketText);

  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Ticket Assistant Backend running on port ${PORT}`);
});
