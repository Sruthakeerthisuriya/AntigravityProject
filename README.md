# 🚀 AI-Powered Unit Test Platform

An intelligent automation platform that listens to your GitHub repository changes, automatically generates high-quality unit tests using Google Gemini AI, and manages a human-in-the-loop workflow for quality assurance.

## ✨ Key Features

-   **🤖 AI Test Generation**: Uses `gemini-flash-latest` to generate comprehensive unit tests for JavaScript (Jest), Python (Pytest), and Java (JUnit).
-   **🔍 Interactive Workflow**: Detects code changes and sends a notification email to the developer. Tests are only generated and committed when the developer interactively triggers the process.
-   **📦 Consolidated Pull Requests**: Batches multiple file changes into a single, clean Pull Request.
-   **🔄 Automatic Updates**: Detects existing test files in the repository and updates them to maintain coverage.
-   **🛡️ Secure Webhooks**: Enforces HMAC-SHA256 signature verification for all incoming GitHub events.
-   **🚀 Automated Test Execution**: Runs generated tests locally before committing to verify correctness.
-   **☕ Java Dependency Management**: Automatically downloads and configures JUnit standalone runners.

## 🛠️ Setup & Configuration

1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/Sruthakeerthisuriya/AntigravityProject
    cd AntigravityProject
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Create a `.env` file from `.env.example`:
    ```ini
    GITHUB_TOKEN=...
    GITHUB_WEBHOOK_SECRET=...
    GEMINI_API_KEY=...
    MAILER_SEND_API_KEY=...
    APP_URL=https://your-public-url.com
    Sender_Email=...
    Recipient_Email=...
    ```

4.  **Start the Server**:
    ```bash
    npm start
    ```

## 📖 How it Works

1.  **Push Code**: When you push code to GitHub, the webhook listener validates the signature and scans for modifications in supported languages.
2.  **Notification**: You receive an email with a summary of the changes and a button to trigger the test generation.
3.  **Trigger**: Clicking the button calls the interactive endpoint, which fetches the latest code, generates tests using AI, verifies them locally, and raises a consolidated PR.
4.  **Review**: Merge the PR once you've reviewed the generated tests.

---
*Built with ❤️ by Antigravity*