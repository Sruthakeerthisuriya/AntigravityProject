const axios = require('axios');

const payload = {
    "repository": {
        "name": "jquery",
        "owner": {
            "name": "jquery",
            "login": "jquery"
        }
    },
    "commits": [
        {
            "id": "23d72cb1db8f2846ac49579f420afffe99d65fcb",
            "committer": {
                "email": "noreply@github.com"
            }
        }
    ]
};

async function triggerWebhook() {
    try {
        const response = await axios.post('http://127.0.0.1:3001/api/webhook', payload, {
            headers: {
                'x-github-event': 'push'
            }
        });
        console.log('Webhook triggered:', response.data);
    } catch (error) {
        console.error('Error triggering webhook:', error.message);
    }
}

triggerWebhook();
