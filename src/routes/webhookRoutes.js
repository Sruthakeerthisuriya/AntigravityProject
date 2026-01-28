const express = require('express');
const router = express.Router();
const path = require('path');
const githubService = require('../services/githubService');
const aiService = require('../services/aiService');
const testRunner = require('../services/testRunner');
const notificationService = require('../services/notificationService');

router.post('/', async (req, res) => {
    let event = req.headers['x-github-event'];
    const contentType = req.headers['content-type'];
    let payload = req.body;

    console.log('--- New Webhook Request ---');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));

    // Handle application/x-www-form-urlencoded where GitHub stringifies the payload
    if (payload && typeof payload.payload === 'string') {
        try {
            payload = JSON.parse(payload.payload);
            console.log('Parsed URL-encoded payload');
        } catch (e) {
            console.error('Failed to parse stringified payload:', e.message);
            return res.status(400).send('Invalid JSON in payload');
        }
    }

    // Fallback if event header is missing or empty
    if (!event && payload.commits) {
        event = 'push';
        console.log('Inferred event: push (from payload structure)');
    }

    console.log(`Final Event: ${event}`);
    console.log(`Content-Type: ${contentType}`);
    // Only log first 500 chars of payload to avoid huge logs
    console.log('Payload Preview:', JSON.stringify(payload).substring(0, 500) + '...');

    if (event === 'push') {
        const { repository, commits } = payload;

        if (!repository || !commits) {
            console.error('Malformed push event payload: missing repository or commits');
            return res.status(400).send('Malformed payload');
        }

        const owner = repository.owner?.login || repository.owner?.name;
        const repo = repository.name;

        if (!owner || !repo) {
            console.error('Malformed push event payload: missing owner or repo name');
            return res.status(400).send('Malformed payload details');
        }

        console.log(`Processing push event for ${owner}/${repo}`);

        try {
            for (const commit of commits) {
                console.log(`Processing commit: ${commit.id}`);
                const commitDetails = await githubService.getCommitDetails(owner, repo, commit.id);

                const modifiedFiles = commitDetails.files.filter(file => file.status === 'modified' || file.status === 'added');

                for (const file of modifiedFiles) {
                    console.log(`File modified: ${file.filename}`);

                    if (file.filename.endsWith('.js') || file.filename.endsWith('.py') || file.filename.endsWith('.java')) {
                        console.log(`Generating tests for: ${file.filename}`);
                        const fileContent = await githubService.getFileContent(owner, repo, file.filename, commit.id);

                        const language = file.filename.endsWith('.js') ? 'javascript' : (file.filename.endsWith('.py') ? 'python' : 'java');

                        try {
                            const generatedTest = await aiService.generateTests(fileContent, language);
                            console.log(`Tests generated for ${file.filename}`);

                            const executionResult = await testRunner.runTests(generatedTest, path.basename(file.filename), language, fileContent);
                            console.log(`Test Execution for ${file.filename}: ${executionResult.success ? 'PASSED' : 'FAILED'}`);

                            if (!executionResult.success) {
                                console.error('Execution Error:', executionResult.error);
                                console.log('Execution Output:', executionResult.output);
                            }

                            // Force delivery to your verified business email for reliability
                            const recipient = process.env.Recipient_Email;

                            if (recipient) {
                                await notificationService.sendTestReport(
                                    file.filename,
                                    executionResult.success,
                                    executionResult.output + (executionResult.error ? "\n" + executionResult.error : ""),
                                    recipient
                                );
                            }
                        } catch (err) {
                            console.error(`Error handling file ${file.filename}:`, err);
                        }
                    }
                }
            }
            res.status(200).send('Webhook processed successfully');
        } catch (error) {
            console.error('Error processing webhook:', error);
            res.status(500).send('Error processing webhook');
        }
    } else {
        res.status(200).send(`Event ${event} ignored`);
    }
});

module.exports = router;
