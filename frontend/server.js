const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the current frontend directory
app.use(express.static(__dirname));

// Health endpoint for Cloud Foundry/application checks
app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    service: "ticket-assistant-frontend"
  });
});

// Fallback route: return index.html for unknown browser routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Ticket Assistant Frontend running on port ${PORT}`);
});