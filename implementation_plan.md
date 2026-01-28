# Implementation Plan - AI-Powered Unit Test Generator

# Goal Description
Build a platform that listens to GitHub repository changes, automatically generates unit tests using AI, executes them, and reports results via email and a dashboard.

## User Review Required
> [!IMPORTANT]
> The project will require valid credentials for GitHub (App ID/Secret or Token), AI Provider (API Key), and SendGrid (API Key). These should be stored in a `.env` file and strictly not committed.

## Proposed Changes

### Backend (Node.js)
We will use Node.js with Express for the main orchestration server.

#### [NEW] [package.json](file:///c:/Users/sruthakeerthis/Downloads/antigravity%20project/package.json)
- Dependencies: `express`, `octokit` (for GitHub), `openai` (or `google-generative-ai`), `dotenv`, `nodemailer`/`@sendgrid/mail`.

#### [NEW] [server.js](file:///c:/Users/sruthakeerthis/Downloads/antigravity%20project/src/server.js)
- Entry point.
- Setup Express server.
- Webhook endpoint `/api/webhook` to listen for GitHub `push` events.

#### [NEW] [githubService.js](file:///c:/Users/sruthakeerthis/Downloads/antigravity%20project/src/services/githubService.js)
- Functions to fetch file content, diffs, and commit details.

#### [NEW] [aiService.js](file:///c:/Users/sruthakeerthis/Downloads/antigravity%20project/src/services/aiService.js)
- Logic to send code to LLM and receive test code.
- Prompts tailored for JS (Jest) and Python (PyTest).

#### [NEW] [testRunner.js](file:///c:/Users/sruthakeerthis/Downloads/antigravity%20project/src/services/testRunner.js)
- Execute the generated test files.
- Capture stdout/stderr for results.

#### [MODIFY] [notificationService.js](file:///c:/Users/sruthakeerthis/Downloads/antigravity%20project/src/services/notificationService.js)
- Mailtrap Sending API integration for full reports.

### NEW: Dependency Management
We will add logic to ensure the test environment has the necessary libraries.
- **Java**: Automatically download `junit-platform-console-standalone.jar` to a `lib/` directory if missing.
- **Node.js**: Validate `node_modules` exists.
- **Python**: (Future) Check for `pytest`.

## Verification Plan

### Automated Tests
- We will write unit tests for our own services using Jest.
- `npm test`

### Manual Verification
- Simulate a GitHub webhook payload using Postman or `curl`.
- Verify AI generates valid test code.
- Verify email is received upon mock failure.
