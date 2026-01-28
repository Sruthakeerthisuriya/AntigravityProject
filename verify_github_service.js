require('dotenv').config();
const fetch = require('node-fetch');
if (!global.fetch) {
    global.fetch = fetch;
}
const githubService = require('./src/services/githubService');

async function test() {
    try {
        console.log("Testing getCommitDetails...");
        const owner = 'jquery';
        const repo = 'jquery';
        const sha = '23d72cb1db8f2846ac49579f420afffe99d65fcb';

        const data = await githubService.getCommitDetails(owner, repo, sha);
        console.log("Success! Commit found.");
        console.log("Files:", data.files.map(f => f.filename));
    } catch (e) {
        console.error("Failed:", e.message);
        if (e.response) {
            console.error("Status:", e.response.status);
            console.error("Data:", JSON.stringify(e.response.data, null, 2));
        }
    }
}

test();
