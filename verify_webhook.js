const axios = require('axios');

async function testWebhook() {
    console.log('Sending simulated webhook...');
    const start = Date.now();
    try {
        const response = await axios.post('http://localhost:3001/api/webhook', {
            repository: {
                name: 'Variable',
                owner: { login: 'Sruthakeerthisuriya' }
            },
            commits: [{ id: 'test-id' }]
        }, {
            headers: { 'X-GitHub-Event': 'push' }
        });
        const duration = Date.now() - start;
        console.log(`Response Status: ${response.status}`);
        console.log(`Response Data: ${response.data}`);
        console.log(`Response Time: ${duration}ms`);

        if (duration < 1000) {
            console.log('SUCCESS: Response received quickly (under 1s).');
        } else {
            console.log('WARNING: Response took longer than expected.');
        }
    } catch (error) {
        console.error('Error sending webhook:', error.message);
    }
}

testWebhook();
