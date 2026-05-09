# SAP BTP Ticket Assistant

AI-powered support ticket assistant built on **SAP Business Technology Platform (SAP BTP)**.  
This project starts with a **mock AI backend** and is designed so that the mock logic can later be replaced with **SAP Generative AI Hub**.

---

## 1. Project Overview

The goal of this project is to learn SAP BTP hands-on by building a practical application.

The application accepts a support ticket description and returns:

- Ticket summary
- Category
- Priority
- Suggested next action
- Processing mode

Current version uses rule-based mock AI logic. Later versions will integrate SAP Generative AI Hub.

---

## 2. Real-World Scenario

A support engineer receives a ticket like:

```text
User cannot log in to SAP IDM after password reset. Authentication fails with invalid credentials.
```

The backend analyzes the ticket and returns:

```json
{
  "summary": "User cannot log in to SAP IDM after password reset. Authentication fails with invalid credentials.",
  "category": "Identity and Access Management",
  "priority": "High",
  "suggestedAction": "Check user lock status, password synchronization, authentication logs, and identity management provisioning status.",
  "mode": "mock-ai"
}
```

---

## 3. Current Architecture

```text
User / Tester
   |
   | HTTP request
   v
SAP BTP Cloud Foundry
   |
   v
ticket-assistant-backend
   |
   v
Mock AI ticket analysis logic
   |
   v
JSON response
```

Current flow:

```text
curl / Browser / API Client
   ↓
Node.js Express backend on Cloud Foundry
   ↓
Keyword-based ticket classification
   ↓
JSON response
```

---

## 4. Planned Target Architecture

Later, this project can be extended as follows:

```text
User
   ↓
Frontend UI / HTML5 Application
   ↓
Application Router
   ↓
Node.js Backend on Cloud Foundry
   ↓
SAP Generative AI Hub / SAP AI Core
   ↓
AI-generated ticket analysis
```

Possible future enterprise flow:

```text
Frontend
   ↓
Backend
   ↓
Destination Service
   ↓
External Ticket System / ABC System
   ↓
Backend
   ↓
Mock AI now / Generative AI Hub later
   ↓
Frontend result
```

---

## 5. SAP BTP Services Used / Planned

### Currently Used

- **SAP Business Application Studio**  
  Used as the cloud development environment.

- **Cloud Foundry Runtime**  
  Used to deploy and run the Node.js backend.

- **GitHub**  
  Used for source control.

### Available in Trial Account and Planned for Later

- **Authorization and Trust Management / XSUAA**  
  Will be used later to secure the application.

- **Destination Service**  
  Will be used later to connect to external systems or APIs.

- **HTML5 Application Repository**  
  Will be used later to host the frontend application.

### AI Service Planned for Later

- **SAP Generative AI Hub**  
  The current backend uses mock AI logic. Later, the mock service can be replaced with a real SAP Generative AI Hub integration.

---

## 6. Repository Structure

Current structure:

```text
sap-btp-ticket-assistant/
├── .gitignore
└── backend/
    ├── manifest.yml
    ├── package.json
    ├── package-lock.json
    └── server.js
```

Future structure may look like:

```text
sap-btp-ticket-assistant/
├── backend/
├── frontend/
├── approuter/
├── xs-security.json
├── mta.yaml
├── README.md
└── .gitignore
```

---

## 7. Backend Features

The backend exposes three endpoints.

### 7.1 Root Endpoint

```http
GET /
```

Purpose: Confirms the backend is reachable.

Example response:

```json
{
  "message": "SAP BTP Ticket Assistant Backend is running",
  "status": "OK"
}
```

---

### 7.2 Health Endpoint

```http
GET /health
```

Purpose: Simple health check endpoint.

Example response:

```json
{
  "status": "UP",
  "service": "ticket-assistant-backend"
}
```

---

### 7.3 Analyze Ticket Endpoint

```http
POST /analyze-ticket
```

Purpose: Accepts ticket text and returns mock AI analysis.

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
  "suggestedAction": "Check user lock status, password synchronization, authentication logs, and identity management provisioning status.",
  "mode": "mock-ai"
}
```

---

## 8. Mock AI Logic

The current implementation uses keyword-based rules.

Examples:

- If ticket contains `login`, `password`, `authentication`, `locked`, or `idm`, category becomes `Identity and Access Management`.
- If ticket contains `database`, `sql`, `hana`, or `connection timeout`, category becomes `Database`.
- If ticket contains `performance`, `slow`, `latency`, or `timeout`, category becomes `Performance`.
- If ticket contains `authorization`, `access denied`, `permission`, or `role`, category becomes `Authorization`.

This mock logic is temporary and will later be replaced with real AI.

---

## 9. Prerequisites

### SAP BTP

You need:

- SAP BTP Trial Account
- Cloud Foundry Runtime enabled
- SAP Business Application Studio subscription
- Cloud Foundry space, for example `dev`

### Local / BAS Tools

Inside SAP Business Application Studio, the following should be available:

- Node.js
- npm
- Git
- Cloud Foundry CLI

---

## 10. Setup Steps

### 10.1 Clone the Repository

```bash
git clone https://github.com/<your-github-username>/sap-btp-ticket-assistant.git
cd sap-btp-ticket-assistant
```

### 10.2 Move to Backend Folder

```bash
cd backend
```

### 10.3 Install Dependencies

```bash
npm install
```

### 10.4 Start Backend Locally

```bash
npm start
```

Expected output:

```text
Ticket Assistant Backend running on port 4000
```

---

## 11. Local Testing

Open a second terminal while the backend is running.

### Test Health Endpoint

```bash
curl http://localhost:4000/health
```

Expected response:

```json
{"status":"UP","service":"ticket-assistant-backend"}
```

### Test Root Endpoint

```bash
curl http://localhost:4000/
```

Expected response:

```json
{"message":"SAP BTP Ticket Assistant Backend is running","status":"OK"}
```

### Test Ticket Analysis Endpoint

```bash
curl -X POST http://localhost:4000/analyze-ticket \
  -H "Content-Type: application/json" \
  -d '{"ticketText":"User cannot log in to SAP IDM after password reset. Authentication fails with invalid credentials."}'
```

Expected response:

```json
{
  "summary": "User cannot log in to SAP IDM after password reset. Authentication fails with invalid credentials.",
  "category": "Identity and Access Management",
  "priority": "High",
  "suggestedAction": "Check user lock status, password synchronization, authentication logs, and identity management provisioning status.",
  "mode": "mock-ai"
}
```

---

## 12. Cloud Foundry Deployment

The backend is deployed to SAP BTP Cloud Foundry using `manifest.yml`.

### 12.1 manifest.yml

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
```

### 12.2 Login to Cloud Foundry

```bash
cf api https://api.cf.us10-001.hana.ondemand.com
cf login
```

Select the correct org and space:

```text
Org: <your-cloud-foundry-org>
Space: dev
```

Verify target:

```bash
cf target
```

### 12.3 Deploy Backend

From the backend folder:

```bash
cd backend
cf push
```

Cloud Foundry reads `manifest.yml` and deploys the app.

---

## 13. Test Deployed Backend

Replace the URL if a different route is used in `manifest.yml`.

### Health Check

```bash
curl https://ticket-assistant-backend.cfapps.us10-001.hana.ondemand.com/health
```

### Analyze Ticket

```bash
curl -X POST https://ticket-assistant-backend.cfapps.us10-001.hana.ondemand.com/analyze-ticket \
  -H "Content-Type: application/json" \
  -d '{"ticketText":"User cannot log in to SAP IDM after password reset. Authentication fails with invalid credentials."}'
```

---

## 14. Git Workflow

### Check Status

```bash
git status
```

### Stage Changes

```bash
git add .
```

### Commit Changes

```bash
git commit -m "Initial backend for SAP BTP Ticket Assistant"
```

### Push Changes

```bash
git push
```

---

## 15. Troubleshooting

### 15.1 Route Already Exists

If deployment fails because the route is already in use, update the route in `manifest.yml`:

```yaml
routes:
  - route: ticket-assistant-backend-<unique-id>.cfapps.us10-001.hana.ondemand.com
```

Then run:

```bash
cf push
```

### 15.2 App Fails to Start

Check recent logs:

```bash
cf logs ticket-assistant-backend --recent
```

Restart the app:

```bash
cf restart ticket-assistant-backend
```

### 15.3 Wrong Cloud Foundry Space

Check target:

```bash
cf target
```

Set correct target:

```bash
cf target -o <org-name> -s dev
```

### 15.4 node_modules Accidentally Appears in Git

Make sure `.gitignore` contains:

```gitignore
node_modules/
```

Then check:

```bash
git status
```

---

## 16. Future Enhancements

Planned enhancements:

1. Add frontend UI.
2. Connect frontend to deployed backend.
3. Add application router.
4. Add XSUAA authentication.
5. Add Destination service integration.
6. Read ticket data from an external system such as ABC.
7. Replace mock AI logic with SAP Generative AI Hub.
8. Deploy frontend to HTML5 Application Repository.
9. Convert project to MTA-based deployment.
10. Add screenshots and architecture diagram.

---

## 17. Learning Outcomes

This project helps learn:

- SAP BTP account structure
- Cloud Foundry runtime
- SAP Business Application Studio
- Node.js backend development
- Cloud Foundry deployment using `manifest.yml`
- GitHub workflow
- API design and testing
- Mock AI architecture
- Future-ready design for SAP Generative AI Hub integration

---

## 18. Current Status

Completed:

- GitHub repository created
- Backend created
- Mock AI logic implemented
- Backend tested locally
- `manifest.yml` added
- Backend deployed to SAP BTP Cloud Foundry

In progress / next:

- Add frontend UI
- Connect frontend to backend
- Add security and destinations later

---

## 19. Author

**Varun Kumar**

---

## 20. Notes

This project is built step by step for learning SAP BTP through a practical, resume-worthy use case.  
The current AI behavior is mock logic. Real SAP Generative AI Hub integration will be added in a future version.
