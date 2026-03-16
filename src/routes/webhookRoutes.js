const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const notificationService = require('../services/notificationService');

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
        // Note: For URL-encoded payloads, raw body might be different. 
        // In a real production app, we'd use the raw buffer before any parsing.
        // For this implementation, we'll assume JSON or properly parsed bodies.
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
        const { repository, commits, after: headSha } = payload;

        if (!repository || !commits) {
            console.error('Malformed push event payload');
            return res.status(400).send('Malformed payload');
        }

        const owner = repository.owner?.login || repository.owner?.name;
        const repo = repository.name;
        const recipient = process.env.Recipient_Email;

        if (!owner || !repo || !recipient) {
            console.error('Missing required info for notification');
            return res.status(400).send('Missing config or identity');
        }

        // Collect unique modified files across all commits in this push
        const modifiedFiles = new Set();
        commits.forEach(commit => {
            // Note: Webhook payload only has summary. 
            // We might need to fetch full commit details if we want strictly 'modified/added'.
            // However, the 'push' payload contains 'added', 'removed', 'modified' arrays in each commit object.
            (commit.added || []).concat(commit.modified || []).forEach(f => {
                if (f.endsWith('.js') || f.endsWith('.py') || f.endsWith('.java')) {
                    modifiedFiles.add(f);
                }
            });
        });

        if (modifiedFiles.size > 0) {
            const filesArray = Array.from(modifiedFiles);
            console.log(`Changes detected in ${filesArray.length} supported files. Triggering automated test generation...`);

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
            return res.status(200).send('No relevant file changes');
        }
    }

    res.status(200).send(`Event ${event} ignored or accepted without action`);
});

module.exports = router;
