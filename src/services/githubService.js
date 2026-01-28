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

module.exports = {
    getCommitDetails,
    getFileContent,
};
