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

    // Parse test results from runner output
    let passedCount = 0;
    let failedCount = 0;
    let totalCount = 0;

    // JUnit parser (e.g. "[         3 containers found      ]\n[         0 containers skipped    ]\n[         3 containers started    ]\n[         0 containers aborted    ]\n[         3 containers successful ]\n[         0 containers failed     ]\n[         4 tests found           ]\n[         0 tests skipped         ]\n[         4 tests started         ]\n[         0 tests aborted         ]\n[         4 tests successful      ]\n[         0 tests failed          ]")
    const junitMatch = output.match(/\[\s+(\d+)\s+tests successful\s+\][\s\S]*?\[\s+(\d+)\s+tests failed\s+\]/);
    if (junitMatch) {
        passedCount = parseInt(junitMatch[1], 10);
        failedCount = parseInt(junitMatch[2], 10);
    } else {
        // Jest parser (e.g. "Tests:       1 failed, 1 passed, 2 total")
        const jestMatch = output.match(/Tests:\s*(?:(\d+)\s*failed,\s*)?(?:(\d+)\s*passed,\s*)?(\d+)\s*total/);
        if (jestMatch) {
            failedCount = parseInt(jestMatch[1] || 0, 10);
            passedCount = parseInt(jestMatch[2] || 0, 10);
        } else {
            // Pytest parser (e.g. "== 1 failed, 2 passed in 0.12s ==")
            const pytestMatch = output.match(/={2,}\s*(?:(\d+)\s*failed,?\s*)?(?:(\d+)\s*passed,?\s*)?.*?={2,}/);
            if (pytestMatch) {
                failedCount = parseInt(pytestMatch[1] || 0, 10);
                passedCount = parseInt(pytestMatch[2] || 0, 10);
            }
        }
    }
    totalCount = passedCount + failedCount;
    
    // Formatting the stats block
    let statsBlockHTML = '';
    let statsBlockText = '';
    
    if (totalCount > 0) {
        statsBlockHTML = `
            <div style="background-color: #f8f9fa; border-left: 4px solid ${statusColor}; padding: 15px; margin-bottom: 20px;">
                <h4 style="margin-top: 0;">Test Summary</h4>
                <p style="margin: 0; font-size: 16px;">
                    <strong>Total Tests:</strong> ${totalCount} <br/>
                    <strong style="color: #28a745;">Passed:</strong> ${passedCount} <br/>
                    <strong style="color: #dc3545;">Failed:</strong> ${failedCount}
                </p>
            </div>
        `;
        statsBlockText = `\nTest Summary:\n- Total: ${totalCount}\n- Passed: ${passedCount}\n- Failed: ${failedCount}\n`;
    }

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
        'subject': `[TEST REPORT] ${status} (${passedCount}/${totalCount} Passed) for ${fileName}`,
        'text': `Unit tests for ${fileName} have ${status}.\n${statsBlockText}\nOutput:\n${output}`,
        'html': `<h3>Test Report: <span style="color: ${statusColor};">${status}</span></h3>
               <p>Unit tests for <strong>${fileName}</strong> have finished execution.</p>
               ${statsBlockHTML}
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

/**
 * Send a friendly developer alert email about code changes and the auto-generated PR.
 * @param {string} fileName - The source file that was changed.
 * @param {string} prUrl - URL of the pull request with generated tests.
 * @param {boolean} testsPass - Whether the generated tests passed locally.
 * @param {string} testSummary - Brief summary of test results.
 * @param {string} recipient - The developer's email address.
 */
async function sendChangeAlert(fileName, prUrl, testsPass, testSummary, recipient) {
    const apiKey = process.env.SENDGRID_API_KEY || process.env.MAILER_SEND_API_KEY;

    if (!apiKey || apiKey === 'your_sendgrid_api_key') {
        console.warn('MailerSend API Key not configured. Skipping change alert.');
        return;
    }

    const testStatus = testsPass ? '✅ All tests passed' : '⚠️ Some tests failed';
    const testStatusColor = testsPass ? '#28a745' : '#e8a317';

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
        'subject': `[CODE CHANGE] Unit tests generated for ${fileName}`,
        'text': `Hey Developer!\n\nYou made code changes in ${fileName}.\n\nWe've automatically generated unit test cases for your changes.\n\nTest Status: ${testStatus}\n${testSummary}\n\nA Pull Request has been raised with the generated tests:\n${prUrl}\n\nPlease review the PR and merge if everything looks good.\n\n— AI Test Platform`,
        'html': `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
                    <h2 style="color: white; margin: 0;">🔔 Code Change Detected</h2>
                </div>
                <div style="background: #ffffff; padding: 25px; border: 1px solid #e0e0e0;">
                    <p style="font-size: 16px; color: #333;">Hey Developer! 👋</p>
                    <p style="font-size: 15px; color: #555;">
                        You made code changes in <strong style="color: #764ba2;">${fileName}</strong>.
                        We've automatically generated unit test cases for your changes.
                    </p>
                    <div style="background-color: #f8f9fa; border-left: 4px solid ${testStatusColor}; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0; font-size: 15px;"><strong>Test Status:</strong> ${testStatus}</p>
                        ${testSummary ? `<p style="margin: 8px 0 0 0; font-size: 14px; color: #666;">${testSummary}</p>` : ''}
                    </div>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="${prUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: bold; display: inline-block;">
                            🔗 Review Pull Request
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #888; margin-top: 20px;">
                        Please review the PR and merge if everything looks good.
                    </p>
                </div>
                <div style="background: #f4f4f4; padding: 15px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e0e0e0; border-top: none;">
                    <p style="color: #999; font-size: 12px; margin: 0;">AI Test Platform — Automated Unit Test Generation</p>
                </div>
            </div>`
    };

    try {
        await axios.post('https://api.mailersend.com/v1/email', data, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        console.log(`Change alert sent to ${recipient} for ${fileName}`);
    } catch (error) {
        console.error('Error sending change alert via MailerSend:', error.message);
        if (error.response) {
            console.error('MailerSend Response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

/**
 * Send a notification to the developer about code changes, with a link to trigger test generation.
 * @param {string} owner - Repo owner.
 * @param {string} repo - Repo name.
 * @param {string} sha - Commit SHA.
 * @param {string[]} files - List of modified filenames.
 * @param {string} actionUrl - URL to trigger test generation (pointing to our action endpoint).
 * @param {string} recipient - The developer's email address.
 */
async function sendChangeDetection(owner, repo, sha, files, actionUrl, recipient) {
    const apiKey = process.env.SENDGRID_API_KEY || process.env.MAILER_SEND_API_KEY;

    if (!apiKey || apiKey === 'your_sendgrid_api_key') {
        console.warn('MailerSend API Key not configured. Skipping change detection notice.');
        return;
    }

    const fileListHtml = files.map(f => `<li><code>${f}</code></li>`).join('');
    const fileListText = files.map(f => `- ${f}`).join('\n');

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
        'subject': `🔍 Code Changes Detected in ${owner}/${repo}`,
        'text': `Hey Developer!\n\nWe detected code changes in ${owner}/${repo} at commit ${sha.substring(0, 7)}.\n\nModified Files:\n${fileListText}\n\nWould you like to generate unit tests and raise a Pull Request for these changes?\n\nClick here to generate: ${actionUrl}\n\n— AI Test Platform`,
        'html': `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center;">
                    <h2 style="color: white; margin: 0;">🔍 Change Detected</h2>
                </div>
                <div style="padding: 25px; background: #ffffff;">
                    <p style="font-size: 16px; color: #333;">Hey Developer! 👋</p>
                    <p style="font-size: 15px; color: #555;">
                        We noticed new commits in <strong>${owner}/${repo}</strong>.
                    </p>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0; font-weight: bold; color: #333;">Modified Files:</p>
                        <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 14px;">
                            ${fileListHtml}
                        </ul>
                    </div>
                    <p style="font-size: 15px; color: #555; margin-bottom: 25px;">
                        Would you like the AI to generate unit tests and raise a Pull Request for these changes?
                    </p>
                    <div style="text-align: center;">
                        <a href="${actionUrl}" style="background: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0,123,255,0.2);">
                            🚀 Generate Tests & PR
                        </a>
                    </div>
                </div>
                <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0;">
                    AI Test Platform — Automating your quality workflow
                </div>
            </div>`
    };

    try {
        await axios.post('https://api.mailersend.com/v1/email', data, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        console.log(`Change detection notice sent to ${recipient} for ${repo}`);
    } catch (error) {
        console.error('Error sending change detection via MailerSend:', error.message);
        if (error.response) {
            console.error('MailerSend Response:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

module.exports = {
    sendTestReport,
    sendChangeAlert,
    sendChangeDetection
};
