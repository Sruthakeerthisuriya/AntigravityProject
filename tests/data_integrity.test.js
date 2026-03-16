const { execSync } = require('child_process');

describe('Data Integrity Tests', () => {
    test('models.txt should be in sync with live Gemini API and dependencies should exist', () => {
        try {
            // We run our verification script and capture output
            // If it exits with 0, data is valid.
            execSync('node scripts/verify_data.js', { stdio: 'inherit' });
        } catch (error) {
            // If the script exits with non-zero, this test fails.
            throw new Error('Data verification failed. See console output above for details on missing/stale models or missing dependencies.');
        }
    });
});
