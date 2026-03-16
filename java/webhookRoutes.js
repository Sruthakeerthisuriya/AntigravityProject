const express = require('express');
const router = express.Router();
const crypto = require('crypto');

/**
 * Verify GitHub webhook signature
 */
function verifySignature(req) {
    const signature = req.headers['x-hub-signature-256'];
    if (!signature) return false;

    const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET);
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
    
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

/**
 * Determine if a filename is a source file that should have tests generated for it.
 * Filters out test files to prevent infinite loops.
 */
function isSourceFile(filePath) {
    const supportedExtensions = filePath.endsWith('.java') || filePath.endsWith('.js') || filePath.endsWith('.py');
    if (!supportedExtensions) return false;

    // Exclude Java test files (e.g. CalculatorTest.java, *Test.java)
    if (filePath.endsWith('Test.java')) return false;

    // Exclude JS/Python test files in test directories or with .test.js pattern
    if (filePath.includes('/tests/') || filePath.includes('\\tests\\')) return false;
    if (filePath.endsWith('.test.js') || filePath.endsWith('.test.py') || filePath.endsWith('.spec.js')) return false;
    if (filePath.includes('java-tests/')) return false;

    return true;
}

router.post('/', async (req, res) => {
    let event = req.headers['x-github-event'];
    let payload = req.body;

    console.log('--- New Webhook Request ---');

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

    // Verify signature if secret is configured
    if (process.env.GITHUB_WEBHOOK_SECRET) {
        if (!verifySignature(req)) {
            console.error('Invalid signature');
            return res.status(401).send('Invalid signature');
        }
        console.log('Signature verified');
    }

    // Fallback if event header is missing or empty
    if (!event && payload.commits) {
        event = 'push';
    }

    if (event === 'push') {
        const { repository, commits, after: headSha, ref } = payload;

        if (!repository || !commits) {
            console.error('Malformed push event payload');
            return res.status(400).send('Malformed payload');
        }

        // Ignore pushes to AI-generated branches to prevent infinite loops
        if (ref && ref.includes('ai-tests/')) {
            console.log(`Ignoring push to AI branch: ${ref}`);
            return res.status(200).send('Ignoring AI branch - no loop');
        }

        const owner = repository.owner?.login || repository.owner?.name;
        const repo = repository.name;
        const recipient = process.env.Recipient_Email;

        if (!owner || !repo || !recipient) {
            console.error('Missing required info for notification');
            return res.status(400).send('Missing config or identity');
        }

        // Collect unique modified SOURCE files across all commits in this push
        const modifiedFiles = new Set();
        commits.forEach(commit => {
            (commit.added || []).concat(commit.modified || []).forEach(f => {
                // Only process source files - not test files (prevents infinite loop)
                if (isSourceFile(f)) {
                    modifiedFiles.add(f);
                    console.log(`Queuing file for test generation: ${f}`);
                } else if (f.endsWith('.java') || f.endsWith('.js') || f.endsWith('.py')) {
                    console.log(`Skipping test/generated file: ${f}`);
                }
            });
        });

        if (modifiedFiles.size > 0) {
            const filesArray = Array.from(modifiedFiles);
            console.log(`Changes detected in ${filesArray.length} source file(s): ${filesArray.join(', ')}`);
            console.log(`Triggering automated test generation...`);

            // Trigger automated generation in background
            const generationService = require('../services/generationService');
            generationService.generateTestsAndRaisePR(
                owner,
                repo,
                headSha,
                filesArray
            ).catch(err => {
                console.error('Failed to trigger automated test generation:', err.message);
            });

            return res.status(200).send('Automated test generation triggered');
        } else {
            console.log('No source file changes detected - skipping test generation.');
            return res.status(200).send('No source file changes');
        }
    }

    res.status(200).send(`Event ${event} ignored or accepted without action`);
});

module.exports = router;
