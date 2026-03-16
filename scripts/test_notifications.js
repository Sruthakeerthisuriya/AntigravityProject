const axios = require('axios');

async function triggerWebhook(payload, eventType, description) {
    console.log(`\n--- Simulating ${description} ---`);
    try {
        const response = await axios.post('http://127.0.0.1:3001/api/webhook', payload, {
            headers: {
                'x-github-event': eventType
            }
        });
        console.log(`Response:`, response.data);
    } catch (error) {
        console.error(`Error:`, error.message);
    }
}

async function runTests() {
    // 1. SUCCESS CASE simulation
    const successPayload = {
        "test_mode": true,
        "repository": { "name": "Variable", "owner": { "login": "Sruthakeerthisuriya" } },
        "commits": [{ "id": "test_id_success" }],
        "mock_files": [
            {
                "filename": "AddTwoVariable.java",
                "status": "modified",
                "content": "package Variables;\npublic class AddTwoVariable {\n  public static void main(String[] args) {\n    int a = 10, b = 20;\n    System.out.println(a + b);\n  }\n}"
            }
        ]
    };

    // 2. FAILURE CASE simulation
    const failurePayload = {
        "test_mode": true,
        "repository": { "name": "Variable", "owner": { "login": "Sruthakeerthisuriya" } },
        "commits": [{ "id": "test_id_failure" }],
        "mock_files": [
            {
                "filename": "AddTwoVariable_FORCE_FAIL.java",
                "status": "modified",
                "content": "package Variables;\npublic class AddTwoVariable {\n  public static void main(String[] args) {\n    System.out.println(\"This will fail due to FORCE_FAIL in filename\");\n  }\n}"
            }
        ]
    };

    await triggerWebhook(successPayload, 'push', 'SUCCESS NOTIFICATION FLOW');

    // Wait for the first one to process (AI generation + local run)
    console.log('Waiting 8 seconds for success case...');
    await new Promise(r => setTimeout(r, 8000));

    await triggerWebhook(failurePayload, 'push', 'FAILURE NOTIFICATION FLOW');
}

runTests();
