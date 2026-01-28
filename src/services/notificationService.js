require('dotenv').config();
const axios = require('axios');

/**
 * Send a full test report email using MailerSend (mlsn. prefix).
 * @param {string} fileName - The file that was tested.
 * @param {boolean} success - Whether the tests passed.
 * @param {string} output - The output from the test runner.
 * @param {string} recipient - The developer's email address.
 */
async function sendTestReport(fileName, success, output, recipient) {
    const apiKey = process.env.SENDGRID_API_KEY || process.env.MAILER_SEND_API_KEY;

    if (!apiKey || apiKey === 'your_sendgrid_api_key') {
        console.warn('MailerSend API Key not configured. Skipping notification.');
        return;
    }

    const status = success ? 'PASSED' : 'FAILED';
    const statusColor = success ? '#28a745' : '#dc3545';

    // MailerSend API structure
    const data = {
        'from': {
            'email': process.env.Sender_Email || 'test@trial-xxx.mlsender.net',
            'name': 'AI Test Platform'
        },
        'to': [
            {
                'email': recipient,
                'name': 'Developer'
            }
        ],
        'subject': `[TEST REPORT] ${status}: Unit Tests for ${fileName}`,
        'text': `Unit tests for ${fileName} have ${status}.\n\nOutput:\n${output}`,
        'html': `<h3>Test Report: <span style="color: ${statusColor};">${status}</span></h3>
               <p>Unit tests for <strong>${fileName}</strong> have finished execution.</p>
               <h4>Details:</h4>
               <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; white-space: pre-wrap;">${output}</pre>`
    };

    try {
        await axios.post('https://api.mailersend.com/v1/email', data, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        console.log(`Test report (${status}) sent to ${recipient} via MailerSend`);
    } catch (error) {
        console.error('Error sending email via MailerSend:', error.message);
        if (error.response) {
            console.error('MailerSend Response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

module.exports = {
    sendTestReport
};
