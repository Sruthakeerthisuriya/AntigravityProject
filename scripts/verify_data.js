require('dotenv').config();
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

async function verifyData() {
    console.log('--- Data Verification starting ---');
    let success = true;

    // 1. Verify models.txt vs Live API
    const modelsPath = path.join(__dirname, '../models.txt');
    if (!fs.existsSync(modelsPath)) {
        console.error('Error: models.txt not found!');
        success = false;
    } else {
        try {
            const modelsContent = fs.readFileSync(modelsPath, 'utf8');
            const lines = modelsContent.split('\n').map(l => l.trim()).filter(l => l.startsWith('- '));
            const documentedModels = lines.map(l => l.split(' ')[1]);

            const key = process.env.GEMINI_API_KEY;
            const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.models) {
                const liveModels = data.models.map(m => m.name);

                const missingInDoc = liveModels.filter(m => !documentedModels.includes(m));
                const extraInDoc = documentedModels.filter(m => !liveModels.includes(m));

                if (missingInDoc.length > 0) {
                    console.log('Warning: Newer models available in API but missing in models.txt:');
                    missingInDoc.forEach(m => console.log(`  + ${m}`));
                    // success = false; // Optional: don't fail for new models, just warn
                }

                if (extraInDoc.length > 0) {
                    console.error('Error: models.txt contains models not found in live API (stale data):');
                    extraInDoc.forEach(m => console.log(`  - ${m}`));
                    success = false;
                }

                if (missingInDoc.length === 0 && extraInDoc.length === 0) {
                    console.log('OK: models.txt matches live API models.');
                }
            } else {
                console.error('Error: Could not fetch models from Gemini API.', data);
                success = false;
            }
        } catch (err) {
            console.error('Error during model verification:', err.message);
            success = false;
        }
    }

    // 2. Verify lib Dependencies
    const junitPath = path.join(__dirname, '../lib/junit-platform-console-standalone.jar');
    if (!fs.existsSync(junitPath)) {
        console.error('Error: junit-platform-console-standalone.jar is missing from lib/!');
        success = false;
    } else {
        const stats = fs.statSync(junitPath);
        if (stats.size === 0) {
            console.error('Error: junit-platform-console-standalone.jar exists but is empty!');
            success = false;
        } else {
            console.log(`OK: JUnit JAR verified (${(stats.size / 1024 / 1024).toFixed(2)} MB).`);
        }
    }

    if (!success) {
        console.log('\n--- Data Verification FAILED ---');
        process.exit(1);
    } else {
        console.log('\n--- Data Verification PASSED ---');
        process.exit(0);
    }
}

verifyData();
