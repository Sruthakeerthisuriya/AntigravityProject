require('dotenv').config();
const axios = require('axios');

async function testMailerSend() {
    console.log('--- MailerSend Diagnostic Mode ---');
    const apiKey = process.env.SENDGRID_API_KEY || process.env.MAILER_SEND_API_KEY;
    const sender = process.env.Sender_Email;
    const recipient = process.env.Recipient_Email;

    console.log(`Using API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING'}`);
    console.log(`Sender: ${sender}`);
    console.log(`Recipient: ${recipient}`);

    if (!apiKey || !sender || !recipient) {
        console.error('Missing configuration in .env!');
        return;
    }

    const data = {
        'from': { 'email': sender, 'name': 'Diagnostic Test' },
        'to': [{ 'email': recipient, 'name': 'Recipient' }],
        'subject': 'MailerSend Connection Test',
        'text': 'Checking if API key is working.',
        'html': '<b>Checking if API key is working.</b>'
    };

    try {
        const response = await axios.post('https://api.mailersend.com/v1/email', data, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        console.log('SUCCESS: MailerSend accepted the request.');
        console.log('Status Code:', response.status);
    } catch (error) {
        console.error('FAILURE: MailerSend rejected the request.');
        console.error('Error Message:', error.message);
        if (error.response) {
            console.error('MailerSend Error Body:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testMailerSend();
