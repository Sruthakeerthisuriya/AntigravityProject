require('dotenv').config();
const { Octokit } = require('octokit');
const fetch = require('node-fetch');

if (!global.fetch) {
    global.fetch = fetch;
}

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    request: { fetch: global.fetch }
});

async function findCommit() {
    const owner = 'Sruthakeerthisuriya';
    const repo = 'Variable';
    console.log(`Scanning ${owner}/${repo} for recent commits...`);

    try {
        // Get list of commits
        const { data: commits } = await octokit.rest.repos.listCommits({
            owner,
            repo,
            per_page: 30 // check last 30
        });

        for (const commitSummary of commits) {
            const sha = commitSummary.sha;
            console.log(`Checking commit ${sha}...`);

            // Get full commit details to see files
            const { data: commit } = await octokit.rest.repos.getCommit({
                owner,
                repo,
                ref: sha
            });

            const relevantFiles = commit.files.filter(f => (f.filename.endsWith('.js') || f.filename.endsWith('.java') || f.filename.endsWith('.py')) && f.status === 'modified');

            if (relevantFiles.length > 0) {
                console.log(`\nFOUND SUITABLE COMMIT!`);
                console.log(`SHA: ${sha}`);
                console.log(`File: ${relevantFiles[0].filename}`);
                // Print a JSON snippet to copy-paste
                const payload = {
                    repository: { name: repo, owner: { name: owner, login: owner } },
                    commits: [{
                        id: sha,
                        committer: { email: commit.commit.committer.email || 'test@example.com' }
                    }]
                };
                console.log('\nUse this payload in simulate_webhook.js:');
                console.log(JSON.stringify(payload, null, 2));
                return;
            }
        }
        console.log("No relevant commits found in last 30.");
    } catch (e) {
        console.error("Error:", e);
    }
}

findCommit();
