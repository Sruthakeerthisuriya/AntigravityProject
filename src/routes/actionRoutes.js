const express = require('express');
const router = express.Router();
const path = require('path');
const githubService = require('../services/githubService');
const aiService = require('../services/aiService');
const testRunner = require('../services/testRunner');
const notificationService = require('../services/notificationService');

router.get('/generate', async (req, res) => {
    const { owner, repo, sha, files: filesJson } = req.query;

    if (!owner || !repo || !sha || !filesJson) {
        return res.status(400).send('Missing required parameters (owner, repo, sha, files)');
    }

    let files;
    try {
        files = JSON.parse(filesJson);
    } catch (e) {
        return res.status(400).send('Invalid files format');
    }

    console.log(`--- Interactive Test Generation Triggered for ${owner}/${repo} ---`);
    console.log(`Target SHA: ${sha}`);
    console.log(`Files: ${files.join(', ')}`);

    // Respond immediately to the user so they see a "Processing" page
    res.send(`
        <html>
            <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
                <h1>🚀 Processing Request</h1>
                <p>Generating tests for <strong>${files.length}</strong> files in <strong>${owner}/${repo}</strong>...</p>
                <p>A Pull Request will be raised shortly. You can close this window.</p>
            </body>
        </html>
    `);

    // Process in background using the consolidated service
    const generationService = require('../services/generationService');
    generationService.generateTestsAndRaisePR(owner, repo, sha, files)
        .catch(error => {
            console.error('Error in background processing of interactive trigger:', error);
        });
});

module.exports = router;
