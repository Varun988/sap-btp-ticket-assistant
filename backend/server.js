const express = require("express");
const cors = require("cors");
const passport = require("passport");
const xsenv = require("@sap/xsenv");
const { JWTStrategy } = require("@sap/xssec").v3;

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Configure XSUAA JWT validation only when XSUAA binding exists.
// This allows local development without XSUAA, but enforces JWT validation on SAP BTP.
let jwtAuthMiddleware = null;

try {
  const services = xsenv.getServices({
    xsuaa: { tag: "xsuaa" }
  });

  passport.use(new JWTStrategy(services.xsuaa));
  app.use(passport.initialize());

  jwtAuthMiddleware = passport.authenticate("JWT", {
    session: false
  });

  console.log("XSUAA JWT authentication enabled.");
} catch (error) {
  console.warn("XSUAA binding not found. Running without JWT authentication.");
  console.warn("This is acceptable for local development only.");
}

function requireJwt(req, res, next) {
  if (!jwtAuthMiddleware) {
    return next();
  }

  return jwtAuthMiddleware(req, res, next);
}

function requireScope(scopeName) {
  return (req, res, next) => {
    if (!jwtAuthMiddleware) {
      return next();
    }

    if (!req.authInfo || typeof req.authInfo.checkScope !== "function") {
      return res.status(403).json({
        error: "Forbidden",
        message: "Authorization information is missing."
      });
    }

    let xsappname;

    try {
      const services = xsenv.getServices({
        xsuaa: { tag: "xsuaa" }
      });

      xsappname = services.xsuaa.xsappname;
    } catch (error) {
      return res.status(500).json({
        error: "Security configuration error",
        message: "Unable to read XSUAA xsappname."
      });
    }

    const requiredScope = `${xsappname}.${scopeName}`;

    if (!req.authInfo.checkScope(requiredScope)) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Missing required scope: ${requiredScope}`
      });
    }

    return next();
  };
}

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

// Protected endpoint.
// On SAP BTP, this requires a valid XSUAA JWT token.
app.post(
  "/analyze-ticket",
  requireJwt,
  requireScope("TicketAssistantUser"),
  (req, res) => {
    const { ticketText } = req.body;

    if (!ticketText || ticketText.trim().length === 0) {
      return res.status(400).json({
        error: "ticketText is required"
      });
    }

    const result = analyzeTicket(ticketText);

    res.json(result);
  }
);

app.listen(PORT, () => {
  console.log(`Ticket Assistant Backend running on port ${PORT}`);
});