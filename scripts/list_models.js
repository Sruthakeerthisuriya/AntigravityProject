require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        // For the listModels to work we shouldn't get a model first.
        // The SDK documentation suggests accessing the model manager via different ways or just trying a model.
        // However, checking the raw API availability is better. 
        // BUT the node SDK simplifies this. let's just create a generic request or use the model's info.
        // Actually the SDK does not expose listModels directly on the main class in all versions.
        // Let's try to just run a simple generateContent with "gemini-pro" again but simpler to isolate.

        // Instead of complex listing which might vary by SDK version, let's try a direct fetch to the endpoint if node-fetch is available.
        const key = process.env.GEMINI_API_KEY;
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const fetch = require('node-fetch');

        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`));
        } else {
            console.log("Error or No Models:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
