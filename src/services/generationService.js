const path = require('path');
const githubService = require('./githubService');
const aiService = require('./aiService');
const testRunner = require('./testRunner');
const notificationService = require('./notificationService');

/**
 * Handle the logic for generating tests, committing them, and raising a PR.
 * @param {string} owner - Repo owner.
 * @param {string} repo - Repo name.
 * @param {string} sha - Commit SHA to fetch file content from.
 * @param {string[]} files - List of modified filenames.
 */
async function generateTestsAndRaisePR(owner, repo, sha, files) {
    try {
        console.log(`--- Automated Test Generation Triggered for ${owner}/${repo} ---`);
        console.log(`Target SHA: ${sha}`);
        console.log(`Files: ${files.join(', ')}`);

        const timestamp = Date.now();
        const branchName = `ai-tests/auto-${timestamp}`;
        const recipient = process.env.Recipient_Email;

        if (!recipient) {
            console.error('Recipient_Email not configured in .env. Skipping automation.');
            return;
        }

        // 1. Create a single branch for this push
        // Note: Defaulting to 'main'. In a more robust implementation, we'd fetch the default branch.
        await githubService.createBranch(owner, repo, 'main', branchName);

        let results = [];

        for (const filename of files) {
            console.log(`Processing ${filename}...`);
            try {
                const fileContent = await githubService.getFileContent(owner, repo, filename, sha);
                const language = filename.endsWith('.js') ? 'javascript' : (filename.endsWith('.py') ? 'python' : 'java');

                const generatedTest = await aiService.generateTests(fileContent, language);
                
                // Verify the test runs locally (if possible/relevant in this environment)
                const executionResult = await testRunner.runTests(generatedTest, path.basename(filename), language, fileContent);
                
                // Determine test file path
                const baseName = path.basename(filename).replace(/\.[^.]+$/, '');
                let testFilePath;
                if (language === 'java') {
                    testFilePath = `java-tests/${baseName}Test.java`;
                } else if (language === 'javascript') {
                    testFilePath = `tests/${baseName}.test.js`;
                } else if (language === 'python') {
                    testFilePath = `tests/test_${path.basename(filename)}`;
                }

                // 2. Commit the test file to the consolidated branch
                await githubService.commitFile(
                    owner, 
                    repo, 
                    branchName, 
                    testFilePath, 
                    generatedTest, 
                    `Auto-generate tests for ${filename}`
                );

                results.push({
                    filename,
                    testFilePath,
                    success: executionResult.success
                });

            } catch (fileErr) {
                console.error(`Error processing individual file ${filename}:`, fileErr.message);
            }
        }

        if (results.length > 0) {
            // 3. Raise a single Pull Request
            const prTitle = `🧪 AI-Generated Unit Tests (${results.length} files)`;
            const prBody = `## 🚀 AI Test Suite\n\nThis Pull Request was automatically generated in response to your recent changes.\n\n### Summary of Changes:\n\n${results.map(r => `- **${r.filename}**: Generated \`${r.testFilePath}\` (${r.success ? '✅ Passed' : '⚠️ Failed locally'})`).join('\n')}\n\nPlease review and merge.`;
            
            const prData = await githubService.createPullRequest(owner, repo, branchName, 'main', prTitle, prBody);
            const prUrl = prData.html_url;

            // 4. Send the final notification with the DIRECT GitHub link
            await notificationService.sendChangeAlert(
                `${results.length} files`,
                prUrl,
                results.every(r => r.success),
                `Automated suite generated for: ${results.map(r => r.filename).join(', ')}`,
                recipient
            );
            
            console.log(`Automated PR raised for ${owner}/${repo}: ${prUrl}`);
            return prUrl;
        }

    } catch (error) {
        console.error('Error in automated test generation:', error);
        throw error;
    }
}

module.exports = {
    generateTestsAndRaisePR
};
