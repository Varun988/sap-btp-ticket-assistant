# SAP BTP Ticket Assistant

AI-powered support ticket assistant built on SAP Business Technology Platform (SAP BTP).

This project is a hands-on SAP BTP learning project that demonstrates a secure, full-stack extension-style application using Cloud Foundry, SAP Application Router, XSUAA, Destination Service, HTML5 Application Repository, and an AI-ready backend architecture.

The current backend uses mock AI logic and is structured so that it can later be connected to SAP Generative AI Hub / SAP AI Core when service credentials are available.

The project is now designed to use an **Enterprise Wiki / Knowledge Base through SAP BTP Destination Service**. This means the wiki source is not hardcoded in the backend. If the enterprise wiki changes in the future, only the destination configuration in SAP BTP Cockpit needs to be updated.

---

## 1. Project Overview

The application accepts a support ticket description and returns:

- Ticket summary
- Ticket category
- Priority
- Suggested next action
- Processing mode
- Optional enterprise wiki source references

Current mode:

```text
mock-ai
```

Current enhanced design:

```text
mock-ai + enterprise wiki retrieval through SAP BTP Destination Service
```

Future target mode:

```text
SAP Generative AI Hub / SAP AI Core + enterprise wiki retrieval through SAP BTP Destination Service
```

---

## 2. Real-World Scenario

A support engineer receives a ticket like:

```text
User cannot log in to SAP IDM after password reset. Authentication fails with invalid credentials.
```

The application analyzes the ticket and returns a structured response:

```json
{
  "summary": "User cannot log in to SAP IDM after password reset. Authentication fails with invalid credentials.",
  "category": "Identity and Access Management",
  "priority": "High",
  "suggestedAction": "Refer to SAP IDM Password Sync Troubleshooting: verify password synchronization status, check user lock status, review authentication logs, inspect pending provisioning tasks, and validate dispatcher/job status.",
  "mode": "mock-ai",
  "knowledgeBaseSources": [
    {
      "title": "SAP IDM Password Sync Troubleshooting",
      "source": "https://enterprise-wiki.example.com/articles/sap-idm-password-sync",
      "score": 0.92
    }
  ]
}
```

This is useful for IT support teams because ticket triage can be made faster, more consistent, easier to route to the correct support team, and grounded in approved enterprise troubleshooting documentation.

---

## 3. Enterprise Wiki Through Destination Service

### Why Destination Service is used for Wiki

The enterprise wiki should not be hardcoded inside the backend code.

Instead, the backend reads the wiki through a BTP destination such as:

```text
ENTERPRISE_WIKI_API
```

This gives flexibility:

```text
Today: ENTERPRISE_WIKI_API → https://old-wiki.company.com/api
Future: ENTERPRISE_WIKI_API → https://new-wiki.company.com/api
```

No backend code change is required if the destination points to a different wiki system later.

### Supported Future Wiki Systems

The same design can support different enterprise knowledge sources:

- Confluence
- SharePoint
- ServiceNow Knowledge Base
- Internal REST API
- Enterprise wiki platform
- SAP operations runbook API
- Any HTTP-based knowledge source exposed through SAP BTP Destination Service

---

## 4. How AI Refers to the Wiki

AI does not directly open the wiki by itself.

The backend controls the process.

The flow is:

```text
User enters ticket description
   ↓
Frontend sends ticket to App Router
   ↓
App Router forwards request to backend
   ↓
Backend receives ticketText
   ↓
Backend calls SAP BTP Destination Service
   ↓
Destination Service resolves ENTERPRISE_WIKI_API
   ↓
Backend calls the enterprise wiki search API
   ↓
Wiki returns relevant articles/runbooks
   ↓
Backend sends ticketText + wiki context to AI analyzer
   ↓
Mock AI now / SAP Generative AI Hub later generates the response
   ↓
Response includes suggested action and source references
```

So, technically, AI refers to the wiki in this way:

```text
AI does not fetch wiki data directly.
Backend fetches wiki data using Destination Service.
Backend passes relevant wiki excerpts to AI as context.
AI generates the answer based on ticket text + wiki context.
```

### Example

Ticket:

```text
User cannot log in to SAP IDM after password reset. Authentication fails with invalid credentials.
```

Backend searches wiki destination:

```text
Destination Name: ENTERPRISE_WIKI_API
Search Query: User cannot log in to SAP IDM after password reset Authentication fails invalid credentials
```

Wiki API returns:

```json
[
  {
    "title": "SAP IDM Password Sync Troubleshooting",
    "url": "https://enterprise-wiki.example.com/articles/sap-idm-password-sync",
    "excerpt": "For login failures after password reset, verify password sync job status, user lock status, authentication logs, pending provisioning tasks, and dispatcher/job status.",
    "score": 0.92
  }
]
```

Backend gives AI this context:

```text
Ticket:
User cannot log in to SAP IDM after password reset. Authentication fails with invalid credentials.

Relevant enterprise wiki article:
Title: SAP IDM Password Sync Troubleshooting
Content: For login failures after password reset, verify password sync job status, user lock status, authentication logs, pending provisioning tasks, and dispatcher/job status.

Task:
Return summary, category, priority, suggested next action, and source references.
```

AI response:

```json
{
  "summary": "User cannot access SAP IDM after password reset due to authentication failure.",
  "category": "Identity and Access Management",
  "priority": "High",
  "suggestedAction": "Refer to SAP IDM Password Sync Troubleshooting: verify password synchronization job status, check whether the user is locked, review authentication logs, inspect pending provisioning tasks, and validate dispatcher/job status.",
  "knowledgeBaseSources": [
    {
      "title": "SAP IDM Password Sync Troubleshooting",
      "source": "https://enterprise-wiki.example.com/articles/sap-idm-password-sync"
    }
  ]
}
```

This approach is similar to Retrieval-Augmented Generation, or RAG.

In simple words:

```text
Retrieve relevant enterprise knowledge first.
Then generate the answer using that retrieved knowledge.
```

---

## 5. Current Secure Deployed Architecture

Current Cloud Foundry space:

```text
Space: dev
```

Current Cloud Foundry applications:

```text
ticket-assistant-backend          → Node.js backend API
ticket-assistant-approuter        → XSUAA-secured central entry point
ticket-assistant-html5-deployer   → Upload utility for HTML5 Application Repository, stopped after upload
ticket-assistant-frontend         → Older standalone frontend, optional/stopped after App Router + HTML5 repo setup
```

Recommended current runtime path:

```text
User Browser
   ↓
XSUAA-secured App Router
   ↓
Frontend served from HTML5 Application Repository
   ↓
Frontend calls /api/analyze-ticket
   ↓
App Router reads xs-app.json
   ↓
App Router resolves ticket-assistant-backend from Destination Service
   ↓
App Router forwards JWT token
   ↓
Backend validates JWT token
   ↓
Backend checks TicketAssistantUser scope
   ↓
Backend calls Destination Service
   ↓
Destination Service resolves ENTERPRISE_WIKI_API
   ↓
Backend retrieves relevant wiki/runbook content
   ↓
Backend routes ticket + wiki context to AI analyzer service
   ↓
mockAnalyzer.js currently processes ticket with wiki context
   ↓
JSON response with suggested action and source references
   ↓
Frontend displays result
```

---

## 6. Current Application URLs

Update these URLs if your Cloud Foundry routes are different.

### Backend

```text
https://ticket-assistant-backend.cfapps.us10-001.hana.ondemand.com
```

### Standalone Frontend - Optional / Legacy

```text
https://ticket-assistant-frontend.cfapps.us10-001.hana.ondemand.com
```

### App Router - Recommended Entry Point

```text
https://ticket-assistant-approuter.cfapps.us10-001.hana.ondemand.com
```

### HTML5 Repository App Path

```text
https://ticket-assistant-approuter.cfapps.us10-001.hana.ondemand.com/ticketassistant/index.html
```

The App Router URL is recommended because it uses XSUAA login, role-based authorization, relative API paths, Destination Service-based backend routing, and HTML5 Application Repository-based frontend hosting.

---

## 7. SAP BTP Services and Components Used

### Currently Used

#### SAP Business Application Studio

Used as the cloud-based development environment.

#### Cloud Foundry Runtime

Used to deploy and run the backend, standalone frontend, App Router, and HTML5 deployer.

#### Authorization and Trust Management / XSUAA

Used for App Router login, JWT issuance, scopes, role templates, and backend JWT validation.

#### SAP Application Router

Used as the central entry point, authentication layer, HTML5 Repository runtime consumer, and API router.

#### Destination Service

Used for:

1. App Router to backend routing.
2. Backend to enterprise wiki API routing.
3. Externalizing target URLs and authentication configuration from code.

#### HTML5 Application Repository

Used to host the frontend UI in a SAP-native way.

#### GitHub

Used for source control.

### Planned / Prepared

#### SAP Generative AI Hub / SAP AI Core

Backend is refactored and ready for future Generative AI Hub integration once AI Core credentials are available.

#### Enterprise Wiki Destination

The backend is designed to call an enterprise wiki destination:

```text
ENTERPRISE_WIKI_API
```

This can point to Confluence, SharePoint, ServiceNow KB, or another internal wiki API.

#### MTA Deployment

Planned to consolidate backend, App Router, XSUAA, Destination, and HTML5 Application Repository deployment into a single enterprise-style deployment unit.

---

## 8. Repository Structure

Current structure:

```text
sap-btp-ticket-assistant/
├── README.md
├── .gitignore
├── backend/
│   ├── manifest.yml
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   └── services/
│       ├── mockAnalyzer.js
│       ├── genAiAnalyzer.js
│       └── wikiDestinationService.js
├── frontend/
│   ├── manifest.yml
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   ├── index.html
│   ├── style.css
│   └── app.js
├── approuter/
│   ├── manifest.yml
│   ├── package.json
│   ├── package-lock.json
│   ├── xs-app.json
│   ├── xs-security.json
│   └── resources/
│       ├── index.html
│       ├── style.css
│       └── app.js
└── html5-deployer/
    ├── manifest.yml
    ├── package.json
    ├── package-lock.json
    └── resources/
        └── ticketassistant/
            ├── index.html
            ├── style.css
            ├── app.js
            ├── manifest.json
            └── xs-app.json
```

### Folder Purpose

- `backend/` contains the secured Node.js Express API deployed to Cloud Foundry.
- `backend/services/mockAnalyzer.js` contains the current mock ticket analysis logic.
- `backend/services/genAiAnalyzer.js` is the future SAP Generative AI Hub integration point.
- `backend/services/wikiDestinationService.js` retrieves relevant wiki articles through SAP BTP Destination Service.
- `frontend/` contains the older standalone frontend deployed as a Cloud Foundry app.
- `approuter/` contains the standalone SAP App Router configuration.
- `html5-deployer/` uploads frontend content to HTML5 Application Repository.

---

## 9. Backend Details

The backend is a Node.js Express application.

### Backend Folder

```text
backend/
├── manifest.yml
├── package.json
├── package-lock.json
├── server.js
└── services/
    ├── mockAnalyzer.js
    ├── genAiAnalyzer.js
    └── wikiDestinationService.js
```

### Backend Responsibilities

1. Accept ticket analysis requests.
2. Validate XSUAA JWT token.
3. Check TicketAssistantUser scope.
4. Search enterprise wiki/runbook documents through Destination Service.
5. Route request to AI analyzer service.
6. Return structured JSON response with optional source references.

### Backend Endpoints

#### Root Endpoint

```http
GET /
```

Example response:

```json
{
  "message": "SAP BTP Ticket Assistant Backend is running",
  "status": "OK"
}
```

#### Health Endpoint

```http
GET /health
```

Example response:

```json
{
  "status": "UP",
  "service": "ticket-assistant-backend"
}
```

#### Analyze Ticket Endpoint

```http
POST /analyze-ticket
```

This endpoint is protected in deployed SAP BTP runtime.

Security requirements:

- Valid XSUAA JWT token
- TicketAssistantUser scope

Request body:

```json
{
  "ticketText": "User cannot log in to SAP IDM after password reset. Authentication fails with invalid credentials."
}
```

Example response:

```json
{
  "summary": "User cannot log in to SAP IDM after password reset. Authentication fails with invalid credentials.",
  "category": "Identity and Access Management",
  "priority": "High",
  "suggestedAction": "Refer to SAP IDM Password Sync Troubleshooting: verify password synchronization status, check user lock status, review authentication logs, inspect pending provisioning tasks, and validate dispatcher/job status.",
  "mode": "mock-ai",
  "knowledgeBaseSources": [
    {
      "title": "SAP IDM Password Sync Troubleshooting",
      "source": "https://enterprise-wiki.example.com/articles/sap-idm-password-sync",
      "score": 0.92
    }
  ]
}
```

---

## 10. AI Analyzer Design

The backend supports an AI mode switch using the environment variable:

```text
AI_MODE
```

Current backend manifest uses:

```yaml
env:
  AI_MODE: mock
```

### Supported Modes

#### AI_MODE=mock

Uses current keyword-based mock analyzer. The mock analyzer can also use wiki articles returned by `wikiDestinationService.js`.

#### AI_MODE=genai

Intended future mode for SAP Generative AI Hub / SAP AI Core integration.

### Current AI Service Files

#### backend/services/mockAnalyzer.js

Contains the current mock keyword-based analyzer. It can accept optional wiki context so that suggested actions can be influenced by matching enterprise troubleshooting documents.

#### backend/services/genAiAnalyzer.js

Contains the future SAP Generative AI Hub integration placeholder. If AI Core credentials are not available, it safely falls back to mock logic and returns:

```text
mock-ai-fallback-genai-not-configured
```

#### backend/services/wikiDestinationService.js

Calls the enterprise wiki API through SAP BTP Destination Service.

Expected default destination name:

```text
ENTERPRISE_WIKI_API
```

Expected default search path:

```text
/search
```

Both values can be changed through environment variables:

```text
WIKI_DESTINATION_NAME
WIKI_SEARCH_PATH
```

### Future GenAI Flow

```text
POST /analyze-ticket
   ↓
server.js checks AI_MODE
   ↓
wikiDestinationService.js retrieves relevant wiki context through Destination Service
   ↓
AI_MODE=genai
   ↓
genAiAnalyzer.js
   ↓
SAP AI Core / Generative AI Hub orchestration API
   ↓
Structured JSON response with source references
```

---

## 11. Mock AI Logic

The current backend uses simple keyword-based logic.

Examples:

- If ticket text contains `login`, `password`, `authentication`, `locked`, or `idm`, the category becomes `Identity and Access Management`.
- If ticket text contains `database`, `sql`, `hana`, or `connection timeout`, the category becomes `Database`.
- If ticket text contains `performance`, `slow`, `latency`, or `timeout`, the category becomes `Performance`.
- If ticket text contains `authorization`, `access denied`, `permission`, or `role`, the category becomes `Authorization`.

This logic is temporary. The backend is structured so it can later call SAP Generative AI Hub when AI Core credentials are available.

With the new wiki destination layer, the mock analyzer can also return source references from enterprise wiki articles.

---

## 12. Wiki Destination Configuration

### Destination Service Instance

The backend must be bound to the Destination service instance:

```text
ticket-assistant-destination
```

### Destination Name

Create a cockpit destination:

```text
ENTERPRISE_WIKI_API
```

### Example Destination Details

```text
Name: ENTERPRISE_WIKI_API
Type: HTTP
URL: https://enterprise-wiki.example.com/api
Proxy Type: Internet
Authentication: NoAuthentication / BasicAuthentication / OAuth2ClientCredentials
```

For a real enterprise system, choose authentication based on your wiki platform.

Possible options:

```text
NoAuthentication
BasicAuthentication
OAuth2ClientCredentials
OAuth2SAMLBearerAssertion
PrincipalPropagation
```

### Example Custom Properties

```text
HTML5.DynamicDestination = true
```

For backend usage, the most important requirement is that the backend app is bound to Destination Service and XSUAA.

### Future Destination Switch

If the wiki changes from one platform to another, update only the destination:

```text
BTP Cockpit → Connectivity → Destinations → ENTERPRISE_WIKI_API → URL
```

Example:

```text
Old URL: https://old-wiki.company.com/api
New URL: https://new-wiki.company.com/api
```

Then restart the backend if needed:

```bash
cf restart ticket-assistant-backend
```

No code change is required.

---

## 13. wikiDestinationService.js Design

The backend should use a service like this:

```javascript
const { executeHttpRequest } = require("@sap-cloud-sdk/http-client");

const WIKI_DESTINATION_NAME =
  process.env.WIKI_DESTINATION_NAME || "ENTERPRISE_WIKI_API";

const WIKI_SEARCH_PATH = process.env.WIKI_SEARCH_PATH || "/search";

function normalizeTicketForSearch(ticketText) {
  return ticketText
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function searchEnterpriseWiki(ticketText) {
  const query = normalizeTicketForSearch(ticketText);

  try {
    const response = await executeHttpRequest(
      { destinationName: WIKI_DESTINATION_NAME },
      {
        method: "GET",
        url: WIKI_SEARCH_PATH,
        params: {
          q: query
        }
      }
    );

    const articles = response.data?.results || response.data || [];

    if (!Array.isArray(articles)) {
      return [];
    }

    return articles.slice(0, 3).map((article) => ({
      title: article.title || article.name || "Untitled Wiki Article",
      source: article.url || article.link || WIKI_DESTINATION_NAME,
      excerpt: article.excerpt || article.summary || article.content || "",
      score: article.score || null
    }));
  } catch (error) {
    console.error("Failed to retrieve wiki articles from destination:", {
      destination: WIKI_DESTINATION_NAME,
      message: error.message
    });

    return [];
  }
}

module.exports = {
  searchEnterpriseWiki
};
```

Install dependency in backend:

```bash
cd backend
npm install @sap-cloud-sdk/http-client
```

---

## 14. Backend Integration Pattern

In `server.js`, import:

```javascript
const { searchEnterpriseWiki } = require("./services/wikiDestinationService");
```

Inside `/analyze-ticket` route:

```javascript
const wikiArticles = await searchEnterpriseWiki(ticketText);
```

Then pass wiki context to the analyzer:

```javascript
let result;

if (process.env.AI_MODE === "genai") {
  result = await analyzeTicketWithGenAI(ticketText, wikiArticles);
} else {
  result = analyzeTicketWithMockRules(ticketText, wikiArticles);
}
```

Keep the existing JWT validation and role checks in your current backend.

---

## 15. SAP Generative AI Hub Readiness

Real SAP Generative AI Hub integration is not active yet because AI Core service credentials are not currently available in the trial Cloud Foundry space used for this project.

The backend is prepared for future integration with expected configuration values such as:

```text
AICORE_CLIENT_ID
AICORE_CLIENT_SECRET
AICORE_AUTH_URL
AICORE_BASE_URL
AICORE_RESOURCE_GROUP
AI_MODE=genai
```

Future implementation point:

```text
backend/services/genAiAnalyzer.js
```

Planned future flow:

```text
Backend
   ↓
Retrieve relevant enterprise wiki context through Destination Service
   ↓
SAP AI Core service binding / service key
   ↓
Generative AI Hub orchestration or foundation model API
   ↓
LLM-generated ticket analysis grounded in enterprise documentation
```

---

## 16. Standalone Frontend Details - Optional / Legacy

The standalone frontend is a simple HTML, CSS, and JavaScript UI served through a small Node.js Express server.

### Frontend Folder

```text
frontend/
├── manifest.yml
├── package.json
├── package-lock.json
├── server.js
├── index.html
├── style.css
└── app.js
```

In the standalone frontend, `frontend/app.js` uses a hardcoded backend URL:

```javascript
const BACKEND_URL = "https://ticket-assistant-backend.cfapps.us10-001.hana.ondemand.com";
```

This approach is now superseded by the App Router + HTML5 Application Repository setup.

---

## 17. App Router Details

The App Router is the recommended current entry point for this project.

### App Router Folder

```text
approuter/
├── manifest.yml
├── package.json
├── package-lock.json
├── xs-app.json
├── xs-security.json
└── resources/
    ├── index.html
    ├── style.css
    └── app.js
```

The `resources/` folder is retained as a fallback/reference, but the active frontend is now served from HTML5 Application Repository.

### Current App Router Flow

```text
Browser
   ↓
App Router
   ├── Authenticates user using XSUAA
   ├── Serves frontend from HTML5 Application Repository runtime
   └── Forwards /api/* requests to backend through Destination Service
```

---

## 18. App Router Configuration: xs-app.json

Current `approuter/xs-app.json` concept:

```json
{
  "welcomeFile": "/ticketassistant/index.html",
  "authenticationMethod": "route",
  "routes": [
    {
      "source": "^/api/(.*)$",
      "target": "/$1",
      "destination": "ticket-assistant-backend",
      "authenticationType": "xsuaa",
      "csrfProtection": false
    },
    {
      "source": "^(/.*)$",
      "target": "$1",
      "service": "html5-apps-repo-rt",
      "authenticationType": "xsuaa",
      "cacheControl": "no-cache, no-store, must-revalidate"
    }
  ]
}
```

### Route 1: Backend API Forwarding

```text
/api/analyze-ticket → /analyze-ticket on ticket-assistant-backend
```

The App Router resolves `ticket-assistant-backend` from BTP Destination Service.

### Route 2: HTML5 Repository Frontend Serving

```text
/ticketassistant/index.html → HTML5 Application Repository runtime
```

Important:

```text
service: html5-apps-repo-rt
```

is the App Router runtime service alias, not the Cloud Foundry service instance name.

---

## 19. XSUAA Security Configuration

Security descriptor:

```text
approuter/xs-security.json
```

Current security concepts:

- XSUAA application name: `ticket-assistant`
- Tenant mode: `dedicated`
- Scope: `TicketAssistantUser`
- Scope: `TicketAssistantAdmin`
- Role template: `TicketAssistantUser`
- Role template: `TicketAssistantAdmin`

Role collection created in BTP Cockpit:

```text
Ticket_Assistant_User
```

Assigned role:

```text
TicketAssistantUser
```

Important behavior:

```text
No JWT token       → 401 Unauthorized
Valid JWT no role  → 403 Forbidden
Valid JWT + role   → Request succeeds
```

---

## 20. Destination Service Configuration

Destination service instance:

```text
ticket-assistant-destination
```

### Backend Destination Used by App Router

Cockpit destination:

```text
ticket-assistant-backend
```

Destination details:

```text
Name: ticket-assistant-backend
Type: HTTP
URL: https://ticket-assistant-backend.cfapps.us10-001.hana.ondemand.com
Proxy Type: Internet
Authentication: NoAuthentication
```

Additional properties:

```text
HTML5.DynamicDestination = true
HTML5.ForwardAuthToken = true
forwardAuthToken = true
```

### Enterprise Wiki Destination Used by Backend

Cockpit destination:

```text
ENTERPRISE_WIKI_API
```

Destination details example:

```text
Name: ENTERPRISE_WIKI_API
Type: HTTP
URL: https://enterprise-wiki.example.com/api
Proxy Type: Internet
Authentication: OAuth2ClientCredentials / BasicAuthentication / NoAuthentication
```

The backend uses `WIKI_DESTINATION_NAME` to determine which destination to call.

---

## 21. HTML5 Application Repository Setup

HTML5 Application Repository service instances:

```text
ticket-assistant-html5-host      → html5-apps-repo / app-host
ticket-assistant-html5-runtime   → html5-apps-repo / app-runtime
```

Purpose:

```text
app-host    → Upload/store frontend content
app-runtime → Runtime access to HTML5 application content
```

Uploaded HTML5 app:

```text
ticketassistant
```

Verified using:

```bash
cf html5-list
```

Expected output includes:

```text
ticketassistant   1.0.0   ticket-assistant-html5-host
```

Important fix applied:

Removed `localDir` route from `html5-deployer/resources/ticketassistant/xs-app.json`.

This fixed the issue where the App Router attempted to load files from:

```text
/home/vcap/app/index.html
```

instead of HTML5 Application Repository runtime.

---

## 22. Local Setup

### Clone Repository

```bash
git clone https://github.com/<your-github-username>/sap-btp-ticket-assistant.git
cd sap-btp-ticket-assistant
```

### Configure Git User - Optional

```bash
git config --global user.name "Varun Kumar"
git config --global user.email "your-github-email@example.com"
git config --global --list
```

---

## 23. Run Backend Locally

```bash
cd backend
npm install
npm install @sap-cloud-sdk/http-client
npm start
```

Expected output:

```text
Ticket Assistant Backend running on port 4000
```

When running locally without XSUAA or Destination service binding, the backend may not be able to retrieve wiki articles from BTP Destination Service.

This is acceptable for local development. In that case, the backend should return an empty `knowledgeBaseSources` array or use fallback logic.

Test health endpoint:

```bash
curl http://localhost:4000/health
```

Test ticket analysis locally:

```bash
curl -X POST http://localhost:4000/analyze-ticket \
  -H "Content-Type: application/json" \
  -d '{"ticketText":"User cannot log in to SAP IDM after password reset. Authentication fails with invalid credentials."}'
```

---

## 24. Cloud Foundry CLI Commands Used

### Check CF CLI Version

```bash
cf version
```

### Set API Endpoint

```bash
cf api https://api.cf.us10-001.hana.ondemand.com
```

### Login to Cloud Foundry

```bash
cf login
```

Alternative:

```bash
cf login -a https://api.cf.us10-001.hana.ondemand.com
```

### Check Target Org and Space

```bash
cf target
```

### Set Target Org and Space

```bash
cf target -o 8ecf8030trial -s dev
```

### List Applications

```bash
cf apps
```

### List Services

```bash
cf services
```

---

## 25. Deploy Backend to Cloud Foundry

From the backend folder:

```bash
cd backend
cf push
```

Current backend manifest concept:

```yaml
---
applications:
  - name: ticket-assistant-backend
    memory: 256M
    instances: 1
    buildpacks:
      - nodejs_buildpack
    command: npm start
    routes:
      - route: ticket-assistant-backend.cfapps.us10-001.hana.ondemand.com
    services:
      - ticket-assistant-xsuaa
      - ticket-assistant-destination
    env:
      AI_MODE: mock
      WIKI_DESTINATION_NAME: ENTERPRISE_WIKI_API
      WIKI_SEARCH_PATH: /search
```

Important:

The backend must be bound to `ticket-assistant-destination` because the backend consumes `ENTERPRISE_WIKI_API` through Destination Service.

Test deployed backend health endpoint:

```bash
curl https://ticket-assistant-backend.cfapps.us10-001.hana.ondemand.com/health
```

Direct backend call without JWT should fail:

```bash
curl -i -X POST https://ticket-assistant-backend.cfapps.us10-001.hana.ondemand.com/analyze-ticket \
  -H "Content-Type: application/json" \
  -d '{"ticketText":"User cannot log in"}'
```

Expected:

```text
401 Unauthorized
```

---

## 26. Deploy App Router to Cloud Foundry

From the App Router folder:

```bash
cd approuter
cf push
```

Current App Router manifest concept:

```yaml
---
applications:
  - name: ticket-assistant-approuter
    memory: 256M
    instances: 1
    buildpacks:
      - nodejs_buildpack
    command: npm start
    routes:
      - route: ticket-assistant-approuter.cfapps.us10-001.hana.ondemand.com
    services:
      - ticket-assistant-xsuaa
      - ticket-assistant-destination
      - ticket-assistant-html5-runtime
```

Test App Router UI:

```text
https://ticket-assistant-approuter.cfapps.us10-001.hana.ondemand.com
```

Direct HTML5 app path:

```text
https://ticket-assistant-approuter.cfapps.us10-001.hana.ondemand.com/ticketassistant/index.html
```

---

## 27. Destination Service Commands Used

### Create Destination Service Instance

```bash
cf create-service destination lite ticket-assistant-destination
```

### Check Destination Service Instance

```bash
cf service ticket-assistant-destination
```

### Verify Destination Service Binding on Backend

```bash
cf env ticket-assistant-backend
```

In `VCAP_SERVICES`, verify:

```text
xsuaa
destination
```

### Verify Destination Service Binding on App Router

```bash
cf env ticket-assistant-approuter
```

In `VCAP_SERVICES`, verify:

```text
xsuaa
destination
html5-apps-repo
```

---

## 28. XSUAA Service Commands Used

### Create XSUAA Service Instance

```bash
cf create-service xsuaa application ticket-assistant-xsuaa -c xs-security.json
```

### Check XSUAA Service

```bash
cf service ticket-assistant-xsuaa
```

### Update XSUAA Service After Changing xs-security.json

```bash
cf update-service ticket-assistant-xsuaa -c xs-security.json
```

### Restage or Redeploy Apps After XSUAA Changes

```bash
cf restage ticket-assistant-approuter
```

or:

```bash
cd approuter
cf push
```

For backend changes:

```bash
cd backend
cf push
```

---

## 29. HTML5 Application Repository Commands Used

### Check HTML5 Application Repository Service Plans

```bash
cf marketplace -e html5-apps-repo
cf marketplace -e html5-apps-repo --show-unavailable
```

### Create HTML5 app-host Service Instance

```bash
cf create-service html5-apps-repo app-host ticket-assistant-html5-host
```

### Check HTML5 app-host Service Instance

```bash
cf service ticket-assistant-html5-host
```

### Create HTML5 app-runtime Service Instance

```bash
cf create-service html5-apps-repo app-runtime ticket-assistant-html5-runtime
```

### Check HTML5 app-runtime Service Instance

```bash
cf service ticket-assistant-html5-runtime
```

### Install HTML5 CLI Plugin

```bash
cf install-plugin -r CF-Community "html5-plugin" -f
```

### List HTML5 Applications

```bash
cf html5-list
```

### List Files for Uploaded HTML5 App

```bash
cf html5-list ticketassistant
```

Expected paths include:

```text
/ticketassistant-1.0.0/index.html
/ticketassistant-1.0.0/app.js
/ticketassistant-1.0.0/style.css
/ticketassistant-1.0.0/manifest.json
/ticketassistant-1.0.0/xs-app.json
```

---

## 30. HTML5 Deployer Commands Used

### Deploy / Upload HTML5 Frontend Content

```bash
cd html5-deployer
npm install
cf push
```

Expected successful log messages:

```text
Resources were successfully uploaded to Server
Application Deployer finished ..
Exit status 0
```

### Stop Deployer After Upload

```bash
cf stop ticket-assistant-html5-deployer
```

The deployer is not a long-running app. It is expected to stop after upload.

---

## 31. Application Lifecycle Commands Used

### Start Backend

```bash
cf start ticket-assistant-backend
```

### Stop Backend

```bash
cf stop ticket-assistant-backend
```

### Restart Backend

```bash
cf restart ticket-assistant-backend
```

### Start App Router

```bash
cf start ticket-assistant-approuter
```

### Restart App Router

```bash
cf restart ticket-assistant-approuter
```

### Stop Optional Standalone Frontend

```bash
cf stop ticket-assistant-frontend
```

### Stop HTML5 Deployer

```bash
cf stop ticket-assistant-html5-deployer
```

### Check Recent Logs

```bash
cf logs ticket-assistant-approuter --recent
cf logs ticket-assistant-backend --recent
cf logs ticket-assistant-html5-deployer --recent
```

### Inspect App Environment and Service Bindings

```bash
cf env ticket-assistant-approuter
cf env ticket-assistant-backend
```

---

## 32. Git Workflow Commands Used

### Check Status

```bash
git status
```

### Stage All Changes

```bash
git add .
```

### Commit Examples Used

```bash
git commit -m "Initial backend for SAP BTP Ticket Assistant"
git commit -m "Add detailed project README"
git commit -m "Add simple frontend UI"
git commit -m "Deploy frontend as Cloud Foundry app"
git commit -m "Add standalone App Router"
git commit -m "Secure App Router with XSUAA"
git commit -m "Protect backend with XSUAA JWT validation"
git commit -m "Add role-based authorization with XSUAA scopes"
git commit -m "Use BTP Destination service for backend routing"
git commit -m "Add HTML5 Application Repository deployer"
git commit -m "Serve frontend from HTML5 Application Repository"
git commit -m "Refactor backend for future Generative AI Hub integration"
git commit -m "Use Destination Service for enterprise wiki retrieval"
```

### Push Changes

```bash
git push
```

---

## 33. Testing Commands

### Backend Health

```bash
curl https://ticket-assistant-backend.cfapps.us10-001.hana.ondemand.com/health
```

### Direct Backend Protected Endpoint - Should Fail Without JWT

```bash
curl -i -X POST https://ticket-assistant-backend.cfapps.us10-001.hana.ondemand.com/analyze-ticket \
  -H "Content-Type: application/json" \
  -d '{"ticketText":"User cannot log in"}'
```

Expected:

```text
401 Unauthorized
```

### App Router UI Test

Open:

```text
https://ticket-assistant-approuter.cfapps.us10-001.hana.ondemand.com
```

Enter sample ticket:

```text
User cannot log in to SAP IDM after password reset. Authentication fails with invalid credentials.
```

Expected result:

```text
Category: Identity and Access Management
Priority: High
Mode: mock-ai
Knowledge Base Source: SAP IDM Password Sync Troubleshooting
```

### Destination-Based Wiki Test

After backend is deployed and bound to Destination Service, test through App Router UI.

If the wiki destination returns matching results, the response should include:

```json
"knowledgeBaseSources": [
  {
    "title": "SAP IDM Password Sync Troubleshooting",
    "source": "https://enterprise-wiki.example.com/articles/sap-idm-password-sync"
  }
]
```

### Optional GenAI Fallback Test

Temporarily set backend environment:

```yaml
env:
  AI_MODE: genai
```

Deploy backend:

```bash
cd backend
cf push
```

Expected mode if AI Core credentials are missing:

```text
mock-ai-fallback-genai-not-configured
```

Then switch back:

```yaml
env:
  AI_MODE: mock
```

---

## 34. Troubleshooting

### App Router UI Loads but Analyze Ticket Fails

Check whether backend is running:

```bash
cf apps
```

If backend is stopped:

```bash
cf start ticket-assistant-backend
```

### 404 unknown_route in App Router Logs

Check logs:

```bash
cf logs ticket-assistant-approuter --recent
```

If log contains:

```text
x_cf_routererror:"unknown_route"
```

Possible causes:

- Backend app is stopped
- Destination URL is wrong
- Destination name mismatch

### Wiki Sources Not Returned

Possible causes:

- Destination `ENTERPRISE_WIKI_API` does not exist
- Backend is not bound to `ticket-assistant-destination`
- Backend is not bound to XSUAA
- Wiki API search path is different from `WIKI_SEARCH_PATH`
- Wiki API response format is different from expected format
- Ticket text does not match any wiki article
- Wiki API authentication is failing

Check backend service bindings:

```bash
cf env ticket-assistant-backend
```

Check backend logs:

```bash
cf logs ticket-assistant-backend --recent
```

Check backend manifest:

```yaml
services:
  - ticket-assistant-xsuaa
  - ticket-assistant-destination

env:
  WIKI_DESTINATION_NAME: ENTERPRISE_WIKI_API
  WIKI_SEARCH_PATH: /search
```

### Analyze Ticket Returns 401 or 403

Possible causes:

- JWT not forwarded from App Router to backend
- Destination missing `HTML5.ForwardAuthToken = true`
- User missing `TicketAssistantUser` role collection
- Backend not bound to XSUAA

Check destination properties for backend routing:

```text
HTML5.ForwardAuthToken = true
forwardAuthToken = true
Authentication = NoAuthentication
```

Check bindings:

```bash
cf env ticket-assistant-backend
cf env ticket-assistant-approuter
```

### Route Already Exists

If deployment fails because a route is already in use, update the route in the relevant `manifest.yml` file.

Example:

```yaml
routes:
  - route: ticket-assistant-approuter-<unique-id>.cfapps.us10-001.hana.ondemand.com
```

Then run:

```bash
cf push
```

---

## 35. Current Recommended Runtime State

Recommended running apps:

```text
ticket-assistant-approuter   started
ticket-assistant-backend     started
```

Optional/stopped apps:

```text
ticket-assistant-frontend         stopped
ticket-assistant-html5-deployer   stopped
```

---

## 36. Current Status

Completed:

- GitHub repository created
- Backend created and tested locally
- Backend deployed to SAP BTP Cloud Foundry
- Standalone frontend created and deployed
- Standalone App Router created and deployed
- XSUAA authentication added to App Router
- Backend JWT validation added
- Role-based authorization added with TicketAssistantUser
- Destination Service instance created
- Cockpit destination created for backend
- App Router switched from inline destination to BTP Destination Service
- HTML5 Application Repository app-host service instance created
- HTML5 Application Repository app-runtime service instance created
- Frontend uploaded to HTML5 Application Repository
- App Router configured to serve frontend from HTML5 Application Repository
- Backend refactored into AI-ready service structure
- AI_MODE=mock active
- genAiAnalyzer.js placeholder added for future SAP Generative AI Hub integration
- Enterprise wiki destination design added
- Backend planned to call `ENTERPRISE_WIKI_API` through Destination Service
- Code pushed to GitHub

Next:

- Add `wikiDestinationService.js` to backend
- Bind backend to Destination Service
- Create cockpit destination `ENTERPRISE_WIKI_API`
- Test wiki-based suggested actions
- Convert project to MTA deployment
- Add real SAP Generative AI Hub integration when AI Core credentials are available
- Optionally connect to an external ticket system through Destination Service

---

## 37. Future Enhancements

Planned enhancements:

1. Convert project to MTA-based deployment.
2. Add real SAP Generative AI Hub / SAP AI Core integration.
3. Read ticket data from an external system such as ABC using Destination Service.
4. Use `ENTERPRISE_WIKI_API` destination for real wiki retrieval.
5. Add vector search or embeddings for better semantic retrieval.
6. Add source citations in the frontend UI.
7. Add screenshots and architecture diagrams.
8. Add CI/CD deployment pipeline.
9. Add an admin page for prompt/configuration management.
10. Add ticket history persistence.
11. Add analytics for ticket categories and priority distribution.

---

## 38. Learning Outcomes

This project helps learn:

- SAP BTP account structure
- Cloud Foundry runtime
- SAP Business Application Studio
- Node.js backend development
- Static frontend deployment
- Cloud Foundry deployment using `manifest.yml`
- Standalone SAP App Router
- `xs-app.json` routing
- XSUAA authentication
- JWT validation in backend
- Role-based authorization with scopes and role collections
- Destination Service and cockpit destinations
- Backend consumption of Destination Service
- HTML5 Application Repository deployment
- HTML5 deployer usage
- AI-ready backend service design
- Enterprise wiki / knowledge base assisted analysis
- RAG-style architecture basics
- GitHub workflow
- API design and testing
- Future-ready design for SAP Generative AI Hub integration

---

## 39. Resume Summary

Built a secure full-stack SAP BTP ticket assistant using Node.js, Cloud Foundry, XSUAA, SAP Application Router, Destination Service, and HTML5 Application Repository. Implemented JWT validation, role-based authorization, BTP-managed routing, HTML5 repository frontend hosting, mock AI-based ticket analysis, enterprise wiki-assisted suggested actions through SAP BTP Destination Service, and an AI-ready backend architecture prepared for future SAP Generative AI Hub integration.

---

## 40. Author

Varun Kumar

---

## 41. Notes

This project is built step by step for learning SAP BTP through a practical, resume-worthy use case.

The current AI behavior is mock logic. The enhanced architecture allows the backend to retrieve enterprise wiki context through SAP BTP Destination Service and use that context to generate better suggested next actions.

Real SAP Generative AI Hub integration will be added in a future version when SAP AI Core credentials are available.
