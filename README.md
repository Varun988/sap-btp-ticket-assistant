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

## 3. Current Secure Deployed Architecture

Current Cloud Foundry space:

```text
Space: dev
```

Current Cloud Foundry applications:

```text
ticket-assistant-backend      → Node.js backend API
ticket-assistant-approuter    → XSUAA-secured central entry point
ticket-assistant-frontend     → Older standalone frontend, optional/stopped after App Router setup
```

Recommended current access path:

```text
User Browser
   ↓
XSUAA-secured App Router
   ↓
Role-authorized frontend served from approuter/resources
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
Mock AI ticket analysis
   ↓
JSON response
   ↓
Frontend displays result
```

---

## 4. Current Application URLs

Update these URLs if your Cloud Foundry routes are different.

### Backend

```text
https://ticket-assistant-backend.cfapps.us10-001.hana.ondemand.com
```

### Standalone Frontend - Optional

```text
https://ticket-assistant-frontend.cfapps.us10-001.hana.ondemand.com
```

### App Router - Recommended Entry Point

```text
https://ticket-assistant-approuter.cfapps.us10-001.hana.ondemand.com
```

The App Router URL is recommended because it uses XSUAA login, role-based authorization, relative API paths, central routing, and Destination Service-based backend routing.

---

## 5. SAP BTP Services and Components Used

### Currently Used

- **SAP Business Application Studio**  
  Used as the cloud-based development environment.

- **Cloud Foundry Runtime**  
  Used to deploy and run the backend, standalone frontend, and App Router.

- **Authorization and Trust Management / XSUAA**  
  Used for App Router login, JWT issuance, scopes, role templates, and backend JWT validation.

- **SAP Application Router**  
  Used as the central entry point, authentication layer, static file server, and API router.

- **Destination Service**  
  Used to externalize backend routing configuration from App Router manifest to BTP Cockpit.

- **HTML5 Application Repository**  
  Service instances have been created to prepare for SAP-native HTML5 frontend deployment.

- **GitHub**  
  Used for source control.

### Planned for Later

- **SAP Generative AI Hub**  
  Will replace the current mock AI logic with real generative AI.

- **MTA Deployment**  
  Will consolidate backend, App Router, XSUAA, Destination, and HTML5 repository deployment into a single enterprise-style deployment unit.

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
    ├── xs-security.json
    └── resources/
        ├── index.html
        ├── style.css
        └── app.js
```

Future HTML5 repository deployment structure may add:

```text
html5-deployer/
├── package.json
├── manifest.yml
└── resources/
    └── ticketassistant/
        ├── index.html
        ├── style.css
        ├── app.js
        ├── manifest.json
        └── xs-app.json
```

### Folder Purpose

- `backend/` contains the Node.js Express API deployed to Cloud Foundry.
- `frontend/` contains the older standalone frontend deployed as a Cloud Foundry app.
- `approuter/` contains the standalone SAP App Router.
- `approuter/resources/` contains frontend static files currently served by the App Router.
- `html5-deployer/` will later upload frontend content to HTML5 Application Repository.

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

This endpoint is protected in deployed SAP BTP runtime.

Security requirements:

```text
Valid XSUAA JWT token
TicketAssistantUser scope
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

## 9. Standalone Frontend Details - Optional

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

After App Router and Destination Service setup, the standalone frontend is optional and can remain stopped.

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
├── xs-security.json
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
   ├── Authenticates user using XSUAA
   ├── Serves frontend files from resources/
   └── Forwards /api/* requests to backend through Destination Service
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

## 11. XSUAA Security Configuration

Security descriptor:

```text
approuter/xs-security.json
```

Current security concepts:

```text
XSUAA application name: ticket-assistant
Tenant mode: dedicated
Scope: TicketAssistantUser
Scope: TicketAssistantAdmin
Role template: TicketAssistantUser
Role template: TicketAssistantAdmin
```

Role collection created in BTP Cockpit:

```text
Ticket_Assistant_User
```

Assigned role:

```text
TicketAssistantUser
```

Assigned to user:

```text
Your SAP BTP trial user
```

Important behavior:

```text
No JWT token       → 401 Unauthorized
Valid JWT no role  → 403 Forbidden
Valid JWT + role   → Request succeeds
```

---

## 12. App Router Configuration: xs-app.json

The `xs-app.json` file controls routing behavior for the SAP App Router.

Current configuration concept:

```json
{
  "welcomeFile": "/index.html",
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
      "source": "^(.*)$",
      "target": "$1",
      "localDir": "resources",
      "authenticationType": "xsuaa",
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
  "authenticationType": "xsuaa",
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
  "authenticationType": "xsuaa",
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

---

## 13. Destination Service Configuration

Destination service instance:

```text
ticket-assistant-destination
```

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

The App Router manifest no longer contains inline backend destinations. The App Router now resolves `ticket-assistant-backend` from BTP Destination Service.

---

## 14. HTML5 Application Repository Preparation

HTML5 Application Repository service instances created:

```text
ticket-assistant-html5-host      → html5-apps-repo / app-host
ticket-assistant-html5-runtime   → html5-apps-repo / app-runtime
```

Purpose:

```text
app-host    → Upload/store frontend content
app-runtime → Runtime access to HTML5 application content
```

HTML5 repository frontend deployment is the next planned implementation phase.

---

## 15. Local Setup

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

## 16. Run Backend Locally

```bash
cd backend
npm install
npm start
```

Expected output:

```text
Ticket Assistant Backend running on port 4000
```

When running locally without XSUAA binding, the backend may log:

```text
XSUAA binding not found. Running without JWT authentication.
This is acceptable for local development only.
```

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

## 17. Run Standalone Frontend Locally

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

Alternative static test used earlier:

```bash
cd frontend
python3 -m http.server 8080
```

---

## 18. Run App Router Locally - Optional

From the `approuter` folder:

```bash
cd approuter
npm install
```

For inline local destination testing:

```bash
export destinations='[{"name":"ticket-assistant-backend","url":"https://ticket-assistant-backend.cfapps.us10-001.hana.ondemand.com","forwardAuthToken":true}]'
```

Start App Router locally:

```bash
PORT=5000 npm start
```

Test API through App Router locally:

```bash
curl -X POST http://localhost:5000/api/analyze-ticket \
  -H "Content-Type: application/json" \
  -d '{"ticketText":"User cannot log in to SAP IDM after password reset. Authentication fails with invalid credentials."}'
```

---

## 19. Cloud Foundry CLI Commands Used

This section lists the important Cloud Foundry commands used during the project.

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

### Check Marketplace Offering Plans

Used for HTML5 Application Repository service plan checks:

```bash
cf marketplace -e html5-apps-repo
```

With unavailable plans shown:

```bash
cf marketplace -e html5-apps-repo --show-unavailable
```

Alias:

```bash
cf m -e html5-apps-repo --show-unavailable
```

Note: Some CF CLI versions do not support `cf marketplace -s`. Use `-e` instead.

---

## 20. Deploy Backend to Cloud Foundry

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
    services:
      - ticket-assistant-xsuaa
```

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

## 21. Deploy Standalone Frontend to Cloud Foundry - Optional

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

Test deployed standalone frontend:

```text
https://ticket-assistant-frontend.cfapps.us10-001.hana.ondemand.com
```

The standalone frontend is optional after App Router setup.

---

## 22. Deploy App Router to Cloud Foundry

From the App Router folder:

```bash
cd approuter
cf push
```

Current App Router manifest:

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
    services:
      - ticket-assistant-xsuaa
      - ticket-assistant-destination
```

Test App Router UI:

```text
https://ticket-assistant-approuter.cfapps.us10-001.hana.ondemand.com
```

Test App Router API route through browser UI. A direct `curl` request to the XSUAA-protected App Router may redirect to login and is not equivalent to a browser-authenticated session.

---

## 23. XSUAA Service Commands Used

### Create XSUAA Service Instance

From `approuter` folder:

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

## 24. Destination Service Commands Used

### Create Destination Service Instance

```bash
cf create-service destination lite ticket-assistant-destination
```

### Check Destination Service Instance

```bash
cf service ticket-assistant-destination
```

### Verify Destination Service Binding on App Router

```bash
cf env ticket-assistant-approuter
```

In `VCAP_SERVICES`, verify that both of these are present:

```text
xsuaa
destination
```

---

## 25. HTML5 Application Repository Commands Used

### Check HTML5 Application Repository Service Plans

```bash
cf marketplace -e html5-apps-repo
```

or:

```bash
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

### Verify Services

```bash
cf services
```

Expected relevant services:

```text
ticket-assistant-xsuaa
ticket-assistant-destination
ticket-assistant-html5-host
ticket-assistant-html5-runtime
```

---

## 26. Application Lifecycle Commands Used

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

### Check App Details

```bash
cf app ticket-assistant-approuter
```

```bash
cf app ticket-assistant-backend
```

### Check Recent Logs

```bash
cf logs ticket-assistant-approuter --recent
```

```bash
cf logs ticket-assistant-backend --recent
```

### Inspect App Environment and Service Bindings

```bash
cf env ticket-assistant-approuter
```

```bash
cf env ticket-assistant-backend
```

---

## 27. Git Workflow Commands Used

### Check Status

```bash
git status
```

### Stage All Changes

```bash
git add .
```

### Commit Initial Backend

```bash
git commit -m "Initial backend for SAP BTP Ticket Assistant"
```

### Add README

```bash
git add README.md
git commit -m "Add detailed project README"
```

### Add Frontend UI

```bash
git add .
git commit -m "Add simple frontend UI"
```

### Deploy Frontend as Cloud Foundry App

```bash
git add .
git commit -m "Deploy frontend as Cloud Foundry app"
```

### Add Standalone App Router

```bash
git add .
git commit -m "Add standalone App Router"
```

### Secure App Router with XSUAA

```bash
git add approuter/xs-security.json approuter/xs-app.json approuter/manifest.yml
git commit -m "Secure App Router with XSUAA"
```

### Protect Backend with JWT Validation

```bash
git add backend/package.json backend/package-lock.json backend/server.js backend/manifest.yml approuter/manifest.yml
git commit -m "Protect backend with XSUAA JWT validation"
```

### Add Role-Based Authorization

```bash
git add approuter/xs-security.json backend/server.js backend/manifest.yml approuter/manifest.yml backend/package.json backend/package-lock.json
git commit -m "Add role-based authorization with XSUAA scopes"
```

### Use Destination Service

```bash
git add approuter/manifest.yml
git commit -m "Use BTP Destination service for backend routing"
```

### Push Changes

```bash
git push
```

---

## 28. Testing Commands

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

### App Router API Route - Browser Authenticated Session Recommended

Test through browser:

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
```

---

## 29. Troubleshooting

### App Router UI Loads but Analyze Ticket Fails

Check whether backend is running:

```bash
cf apps
```

If backend is stopped:

```bash
cf start ticket-assistant-backend
```

Then test again.

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

```text
Backend app is stopped
Destination URL is wrong
Destination name mismatch
```

Check backend route:

```bash
cf apps
```

Test backend health:

```bash
curl https://ticket-assistant-backend.cfapps.us10-001.hana.ondemand.com/health
```

### Analyze Ticket Returns 401 or 403

Possible causes:

```text
JWT not forwarded from App Router to backend
Destination missing HTML5.ForwardAuthToken = true
User missing TicketAssistantUser role collection
Backend not bound to XSUAA
```

Check destination properties in BTP Cockpit:

```text
HTML5.ForwardAuthToken = true
forwardAuthToken = true
Authentication = NoAuthentication
```

Check backend binding:

```bash
cf env ticket-assistant-backend
```

Check App Router binding:

```bash
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
cf target -o 8ecf8030trial -s dev
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

## 30. Current Status

Completed:

- GitHub repository created
- Backend created and tested locally
- Backend deployed to SAP BTP Cloud Foundry
- Standalone frontend created and deployed
- App Router created and deployed
- App Router UI tested
- App Router `/api` endpoint tested
- XSUAA authentication added to App Router
- Backend JWT validation added
- Role-based authorization added with `TicketAssistantUser`
- Destination Service instance created
- Cockpit destination created for backend
- App Router switched from inline destination to BTP Destination Service
- HTML5 Application Repository `app-host` service instance created
- HTML5 Application Repository `app-runtime` service instance created
- Code pushed to GitHub

Next:

- Prepare frontend for HTML5 Application Repository upload
- Deploy frontend content using HTML5 app deployer
- Configure App Router to consume HTML5 repository content
- Integrate SAP Generative AI Hub
- Convert project to MTA deployment

---

## 31. Future Enhancements

Planned enhancements:

1. Deploy frontend to HTML5 Application Repository.
2. Configure App Router to serve frontend from HTML5 Application Repository.
3. Read ticket data from an external system such as ABC using Destination Service.
4. Replace mock AI logic with SAP Generative AI Hub.
5. Convert project to MTA-based deployment.
6. Add screenshots and architecture diagrams.
7. Add CI/CD deployment pipeline.
8. Add an admin page for prompt/configuration management.
9. Add ticket history persistence.
10. Add analytics for ticket categories and priority distribution.

---

## 32. Learning Outcomes

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
- HTML5 Application Repository service plans
- GitHub workflow
- API design and testing
- Mock AI architecture
- Future-ready design for SAP Generative AI Hub integration

---

## 33. Author

**Varun Kumar**

---

## 34. Notes

This project is built step by step for learning SAP BTP through a practical, resume-worthy use case.

The current AI behavior is mock logic. Real SAP Generative AI Hub integration will be added in a future version.
