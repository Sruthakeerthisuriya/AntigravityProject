const { Octokit } = require('octokit');
require('dotenv').config();

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    request: { fetch: global.fetch }
});

/**
 * Fetch details of a commit including modified files.
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} ref - Commit SHA
 * @returns {Promise<Object>} - Commit details
 */
async function getCommitDetails(owner, repo, ref) {
    try {
        const { data } = await octokit.rest.repos.getCommit({
            owner,
            repo,
            ref,
        });
        return data;
    } catch (error) {
        console.error('Error fetching commit details:', error);
        throw error;
    }
}

/**
 * Get raw content of a file from a specific commit.
 * @param {string} owner 
 * @param {string} repo 
 * @param {string} path 
 * @param {string} ref 
 */
async function getFileContent(owner, repo, path, ref) {
    try {
        const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
            ref,
        });

        // Content is base64 encoded
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return content;
    } catch (error) {
        console.error('Error fetching file content:', error);
        throw error;
    }
}

/**
 * Create a new branch from the latest commit on a base branch.
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} baseBranch - Base branch to branch from (e.g. 'main')
 * @param {string} newBranchName - Name for the new branch
 * @returns {Promise<string>} - The new branch ref
 */
async function createBranch(owner, repo, baseBranch, newBranchName) {
    try {
        // Get the latest commit SHA on the base branch
        const { data: refData } = await octokit.rest.git.getRef({
            owner,
            repo,
            ref: `heads/${baseBranch}`,
        });
        const baseSha = refData.object.sha;

        // Create the new branch
        await octokit.rest.git.createRef({
            owner,
            repo,
            ref: `refs/heads/${newBranchName}`,
            sha: baseSha,
        });

        console.log(`Branch '${newBranchName}' created from '${baseBranch}' at SHA ${baseSha}`);
        return newBranchName;
    } catch (error) {
        console.error('Error creating branch:', error.message);
        throw error;
    }
}

/**
 * Commit a file to a branch (creates or updates the file).
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} branch - Branch to commit to
 * @param {string} filePath - Path of the file in the repo (e.g. 'java-tests/SimpleMathTest.java')
 * @param {string} content - File content as a string
 * @param {string} message - Commit message
 * @returns {Promise<Object>} - Commit result
 */
async function commitFile(owner, repo, branch, filePath, content, message) {
    try {
        // Check if file already exists to get its SHA (needed for updates)
        let existingSha;
        try {
            const { data: existingFile } = await octokit.rest.repos.getContent({
                owner,
                repo,
                path: filePath,
                ref: branch,
            });
            existingSha = existingFile.sha;
        } catch (e) {
            // File doesn't exist yet — that's fine, we'll create it
        }

        const params = {
            owner,
            repo,
            path: filePath,
            message,
            content: Buffer.from(content).toString('base64'),
            branch,
        };

        if (existingSha) {
            params.sha = existingSha;
        }

        const { data } = await octokit.rest.repos.createOrUpdateFileContents(params);
        console.log(`File '${filePath}' committed to branch '${branch}'`);
        return data;
    } catch (error) {
        console.error('Error committing file:', error.message);
        throw error;
    }
}

/**
 * Create a Pull Request.
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} head - The branch with changes
 * @param {string} base - The branch to merge into (e.g. 'main')
 * @param {string} title - PR title
 * @param {string} body - PR description
 * @returns {Promise<Object>} - PR data including html_url
 */
async function createPullRequest(owner, repo, head, base, title, body) {
    try {
        const { data } = await octokit.rest.pulls.create({
            owner,
            repo,
            title,
            body,
            head,
            base,
        });
        console.log(`Pull Request created: ${data.html_url}`);
        return data;
    } catch (error) {
        console.error('Error creating pull request:', error.message);
        throw error;
    }
}

module.exports = {
    getCommitDetails,
    getFileContent,
    createBranch,
    commitFile,
    createPullRequest,
};
