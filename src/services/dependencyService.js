const fs = require('fs');
const path = require('path');
const axios = require('axios');

const LIB_DIR = path.join(__dirname, '../../lib');
const JUNIT_URL = 'https://repo1.maven.org/maven2/org/junit/platform/junit-platform-console-standalone/1.9.3/junit-platform-console-standalone-1.9.3.jar';
const JUNIT_JAR_NAME = 'junit-platform-console-standalone.jar';

/**
 * Ensure the lib directory exists and contains necessary JARs.
 */
async function ensureDependencies() {
    if (!fs.existsSync(LIB_DIR)) {
        fs.mkdirSync(LIB_DIR, { recursive: true });
    }

    const junitPath = path.join(LIB_DIR, JUNIT_JAR_NAME);
    if (!fs.existsSync(junitPath)) {
        console.log(`Downloading ${JUNIT_JAR_NAME}...`);
        try {
            const response = await axios({
                url: JUNIT_URL,
                method: 'GET',
                responseType: 'stream'
            });

            const writer = fs.createWriteStream(junitPath);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    console.log(`${JUNIT_JAR_NAME} downloaded successfully.`);
                    resolve();
                });
                writer.on('error', reject);
            });
        } catch (error) {
            console.error(`Failed to download ${JUNIT_JAR_NAME}:`, error.message);
            throw error;
        }
    } else {
        console.log(`${JUNIT_JAR_NAME} already exists.`);
    }
}

module.exports = {
    ensureDependencies,
    LIB_DIR,
    JUNIT_JAR_NAME
};
