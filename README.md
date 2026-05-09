# SAP BTP Ticket Assistant

AI-powered support ticket assistant built on **SAP Business Technology Platform (SAP BTP)**.

This project is being built step by step as a hands-on SAP BTP learning project. The current version uses a **mock AI backend** and is designed so that the mock AI logic can later be replaced with **SAP Generative AI Hub**.

---

## 1. Project Overview

The application accepts a support ticket description and returns:

- Ticket summary
- Ticket category
- Priority
- Suggested next action
- Processing mode

Current mode:

```text
mock-ai
```

Future target mode:

```text
SAP Generative AI Hub
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
  "suggestedAction": "Check user lock status, password synchronization, authentication logs, and identity management provisioning status.",
  "mode": "mock-ai"
}
```

This is useful for IT support teams because ticket triage can be made faster, more consistent, and easier to route to the correct support team.

---

## 3. Current Deployed Architecture

The project currently has three Cloud Foundry applications:

```text
Cloud Foundry Space: dev

1. ticket-assistant-backend
2. ticket-assistant-frontend
3. ticket-assistant-approuter
```

Recommended current access path:

```text
User Browser
   ↓
ticket-assistant-approuter
   ↓
Serves frontend files from approuter/resources
   ↓
Frontend calls /api/analyze-ticket
   ↓
App Router forwards request to backend
   ↓
ticket-assistant-backend
   ↓
Mock AI ticket analysis
   ↓
JSON response
   ↓
Frontend displays result
```

---

## 4. Current Application URLs

> Update these URLs if your Cloud Foundry routes are different.

### Backend

```text
https://ticket-assistant-backend.cfapps.us10-001.hana.ondemand.com
```

### Standalone Frontend

```text
https://ticket-assistant-frontend.cfapps.us10-001.hana.ondemand.com
```

### App Router - Recommended Entry Point

```text
https://ticket-assistant-approuter.cfapps.us10-001.hana.ondemand.com
```

The App Router URL is recommended because it uses relative API paths and central routing instead of hardcoding the backend URL in the frontend.

---

## 5. SAP BTP Services and Components Used

### Currently Used

- **SAP Business Application Studio**  
  Used as the cloud-based development environment.

- **Cloud Foundry Runtime**  
  Used to deploy and run the backend, standalone frontend, and App Router.

- **SAP Application Router**  
  Used as a central entry point and routing layer.

- **GitHub**  
  Used for source control.

### Available / Planned for Later

- **Authorization and Trust Management / XSUAA**  
  Will be used to secure the App Router and backend APIs.

- **Destination Service**  
  Will be used to manage external system connections, such as an ABC ticket system or SAP backend.

- **HTML5 Application Repository**  
  Will be used later to host the frontend in a more SAP-native way.

- **SAP Generative AI Hub**  
  Will be used later to replace the mock AI logic with real generative AI.

---

## 6. Repository Structure

Current structure:

```text
sap-btp-ticket-assistant/
├── README.md
├── .gitignore
├── backend/
│   ├── manifest.yml
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
├── frontend/
│   ├── manifest.yml
│   ├── package.json
│   ├── package-lock.json
│   ├── server.js
│   ├── index.html
│   ├── style.css
│   └── app.js
└── approuter/
    ├── manifest.yml
    ├── package.json
    ├── package-lock.json
    ├── xs-app.json
    └── resources/
        ├── index.html
        ├── style.css
        └── app.js
```

### Folder Purpose

- `backend/` contains the Node.js Express API deployed to Cloud Foundry.
- `frontend/` contains the simple standalone frontend deployed as a Cloud Foundry app.
- `approuter/` contains the standalone SAP App Router.
- `approuter/resources/` contains frontend static files served by the App Router.

---

## 7. Backend Details

The backend is a Node.js Express application.

### Backend Folder

```text
backend/
├── manifest.yml
├── package.json
├── package-lock.json
└── server.js
```

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

The current backend uses simple keyword-based logic.

Examples:

- If ticket text contains `login`, `password`, `authentication`, `locked`, or `idm`, the category becomes `Identity and Access Management`.
- If ticket text contains `database`, `sql`, `hana`, or `connection timeout`, the category becomes `Database`.
- If ticket text contains `performance`, `slow`, `latency`, or `timeout`, the category becomes `Performance`.
- If ticket text contains `authorization`, `access denied`, `permission`, or `role`, the category becomes `Authorization`.

This logic is temporary. The goal is to replace it later with SAP Generative AI Hub.

---

## 9. Standalone Frontend Details

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

### Frontend Flow

```text
Browser
   ↓
Standalone frontend app
   ↓
frontend/app.js
   ↓
Direct call to backend URL
   ↓
ticket-assistant-backend
```

In the standalone frontend, `frontend/app.js` uses a hardcoded backend URL:

```javascript
const BACKEND_URL = "https://ticket-assistant-backend.cfapps.us10-001.hana.ondemand.com";
```

This works, but it is not the preferred enterprise architecture because the backend URL is directly embedded in frontend code.

---

## 10. App Router Details

The App Router is the recommended current entry point for this project.

### App Router Folder

```text
approuter/
├── manifest.yml
├── package.json
├── package-lock.json
├── xs-app.json
└── resources/
    ├── index.html
    ├── style.css
    └── app.js
```

### App Router Flow

```text
Browser
   ↓
App Router
   ├── Serves frontend files from resources/
   └── Forwards /api/* requests to backend
```

### Important Frontend Change in App Router Version

In the App Router version, `approuter/resources/app.js` uses a relative path:

```javascript
fetch("/api/analyze-ticket", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    ticketText
  })
});
```

This is better because the frontend does not need to know the backend route.

---

## 11. App Router Configuration: xs-app.json

The `xs-app.json` file controls routing behavior for the SAP App Router.

Current configuration:

```json
{
  "welcomeFile": "/index.html",
  "authenticationMethod": "none",
  "routes": [
    {
      "source": "^/api/(.*)$",
      "target": "/$1",
      "destination": "ticket-assistant-backend",
      "csrfProtection": false
    },
    {
      "source": "^(.*)$",
      "target": "$1",
      "localDir": "resources",
      "cacheControl": "no-cache, no-store, must-revalidate"
    }
  ]
}
```

### Route 1: API Forwarding

```json
{
  "source": "^/api/(.*)$",
  "target": "/$1",
  "destination": "ticket-assistant-backend",
  "csrfProtection": false
}
```

This route forwards API calls to the backend.

Example:

```text
Incoming request:
POST /api/analyze-ticket

Forwarded to backend as:
POST /analyze-ticket
```

### Route 2: Static Frontend Files

```json
{
  "source": "^(.*)$",
  "target": "$1",
  "localDir": "resources",
  "cacheControl": "no-cache, no-store, must-revalidate"
}
```

This route serves static frontend files from:

```text
approuter/resources/
```

Examples:

```text
/index.html → approuter/resources/index.html
/style.css  → approuter/resources/style.css
/app.js     → approuter/resources/app.js
```

### Current Authentication

```json
"authenticationMethod": "none"
```

Authentication is currently disabled so routing can be tested easily.

Later, this will be changed when XSUAA security is added.

---

## 12. Local Setup

### Clone Repository

```bash
git clone https://github.com/<your-github-username>/sap-btp-ticket-assistant.git
cd sap-btp-ticket-assistant
```

---

## 13. Run Backend Locally

```bash
cd backend
npm install
npm start
```

Expected output:

```text
Ticket Assistant Backend running on port 4000
```

Test health endpoint:

```bash
curl http://localhost:4000/health
```

Test ticket analysis:

```bash
curl -X POST http://localhost:4000/analyze-ticket   -H "Content-Type: application/json"   -d '{"ticketText":"User cannot log in to SAP IDM after password reset. Authentication fails with invalid credentials."}'
```

---

## 14. Run Standalone Frontend Locally

```bash
cd frontend
npm install
npm start
```

Expected output:

```text
Ticket Assistant Frontend running on port 8080
```

Health check:

```bash
curl http://localhost:8080/health
```

---

## 15. Run App Router Locally - Optional

From the `approuter` folder:

```bash
cd approuter
npm install
```

Set the backend destination as an environment variable:

```bash
export destinations='[{"name":"ticket-assistant-backend","url":"https://ticket-assistant-backend.cfapps.us10-001.hana.ondemand.com","forwardAuthToken":false}]'
```

Start App Router locally:

```bash
PORT=5000 npm start
```

Test API through App Router:

```bash
curl -X POST http://localhost:5000/api/analyze-ticket   -H "Content-Type: application/json"   -d '{"ticketText":"User cannot log in to SAP IDM after password reset. Authentication fails with invalid credentials."}'
```

---

## 16. Cloud Foundry Deployment

### Login to Cloud Foundry

```bash
cf api https://api.cf.us10-001.hana.ondemand.com
cf login
```

Select the correct Cloud Foundry org and space.

Example:

```text
Org: <your-cloud-foundry-org>
Space: dev
```

Verify target:

```bash
cf target
```

---

## 17. Deploy Backend

From the backend folder:

```bash
cd backend
cf push
```

Backend manifest:

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

Test deployed backend:

```bash
curl https://ticket-assistant-backend.cfapps.us10-001.hana.ondemand.com/health
```

---

## 18. Deploy Standalone Frontend

From the frontend folder:

```bash
cd frontend
cf push
```

Frontend manifest:

```yaml
---
applications:
  - name: ticket-assistant-frontend
    memory: 128M
    instances: 1
    buildpacks:
      - nodejs_buildpack
    command: npm start
    routes:
      - route: ticket-assistant-frontend.cfapps.us10-001.hana.ondemand.com
```

Test deployed frontend:

```text
https://ticket-assistant-frontend.cfapps.us10-001.hana.ondemand.com
```

---

## 19. Deploy App Router

From the App Router folder:

```bash
cd approuter
cf push
```

App Router manifest:

```yaml
---
applications:
  - name: ticket-assistant-approuter
    memory: 128M
    instances: 1
    buildpacks:
      - nodejs_buildpack
    command: npm start
    routes:
      - route: ticket-assistant-approuter.cfapps.us10-001.hana.ondemand.com
    env:
      destinations: >
        [
          {
            "name": "ticket-assistant-backend",
            "url": "https://ticket-assistant-backend.cfapps.us10-001.hana.ondemand.com",
            "forwardAuthToken": false
          }
        ]
```

Test App Router UI:

```text
https://ticket-assistant-approuter.cfapps.us10-001.hana.ondemand.com
```

Test App Router API route:

```bash
curl -X POST https://ticket-assistant-approuter.cfapps.us10-001.hana.ondemand.com/api/analyze-ticket   -H "Content-Type: application/json"   -d '{"ticketText":"User cannot log in to SAP IDM after password reset. Authentication fails with invalid credentials."}'
```

---

## 20. Verify Cloud Foundry Applications

Run:

```bash
cf apps
```

Expected applications:

```text
ticket-assistant-backend       started
ticket-assistant-frontend      started
ticket-assistant-approuter     started
```

---

## 21. Git Workflow

Check status:

```bash
git status
```

Stage changes:

```bash
git add .
```

Commit changes:

```bash
git commit -m "Your commit message"
```

Push changes:

```bash
git push
```

---

## 22. Troubleshooting

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

### App Fails to Start

Check recent logs:

```bash
cf logs <app-name> --recent
```

Restart app:

```bash
cf restart <app-name>
```

### Wrong Cloud Foundry Space

Check target:

```bash
cf target
```

Set correct target:

```bash
cf target -o <org-name> -s dev
```

### node_modules Appears in Git

Make sure `.gitignore` contains:

```gitignore
node_modules/
```

Then check:

```bash
git status
```

---

## 23. Future Enhancements

Planned enhancements:

1. Add XSUAA authentication to App Router.
2. Protect backend APIs using JWT validation.
3. Add role-based access using scopes and role collections.
4. Add Destination service integration.
5. Read ticket data from an external system such as ABC.
6. Replace mock AI logic with SAP Generative AI Hub.
7. Deploy frontend to HTML5 Application Repository.
8. Convert project to MTA-based deployment.
9. Add screenshots and architecture diagrams.
10. Add CI/CD deployment pipeline.

---

## 24. Learning Outcomes

This project helps learn:

- SAP BTP account structure
- Cloud Foundry runtime
- SAP Business Application Studio
- Node.js backend development
- Static frontend deployment
- Cloud Foundry deployment using `manifest.yml`
- Standalone SAP App Router
- `xs-app.json` routing
- Relative API routing using `/api/*`
- GitHub workflow
- API design and testing
- Mock AI architecture
- Future-ready design for SAP Generative AI Hub integration

---

## 25. Current Status

Completed:

- GitHub repository created
- Backend created and tested locally
- Backend deployed to SAP BTP Cloud Foundry
- Standalone frontend created and deployed
- App Router created and deployed
- App Router UI tested
- App Router `/api` endpoint tested
- Code pushed to GitHub

Next:

- Add XSUAA authentication
- Add role-based security
- Add Destination service integration
- Integrate SAP Generative AI Hub

---

## 26. Author

**Varun Kumar**

---

## 27. Notes

This project is built step by step for learning SAP BTP through a practical, resume-worthy use case.

The current AI behavior is mock logic. Real SAP Generative AI Hub integration will be added in a future version.
