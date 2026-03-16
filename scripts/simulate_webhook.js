require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

const payload = {
    "after": "067983afd44a075beea9cecb54af4cb5229f2dfd",
    "repository": {
        "name": "Variable",
        "owner": {
            "name": "Sruthakeerthisuriya",
            "login": "Sruthakeerthisuriya"
        }
    },
    "commits": [
        {
            "id": "067983afd44a075beea9cecb54af4cb5229f2dfd",
            "committer": {
                "email": "noreply@github.com"
            },
            "modified": ["AddTwoVariable.java"]
        }
    ]
};

async function triggerWebhook() {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    const headers = {
        'x-github-event': 'push',
        'content-type': 'application/json'
    };

    if (secret) {
        const hmac = crypto.createHmac('sha256', secret);
        const signature = 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
        headers['x-hub-signature-256'] = signature;
        console.log('Generated Signature:', signature);
    } else {
        console.warn('GITHUB_WEBHOOK_SECRET not found in .env. Sending without signature.');
    }

    try {
        const response = await axios.post('http://127.0.0.1:3001/api/webhook', payload, { headers });
        console.log('Webhook triggered response:', response.data);
    } catch (error) {
        console.error('Error triggering webhook:', error.response?.data || error.message);
    }
}

triggerWebhook();
