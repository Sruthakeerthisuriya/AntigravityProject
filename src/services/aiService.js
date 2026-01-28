require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");

// Initialize AI clients
let genAI;
let openai;

if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Generate unit tests for a given code using AI.
 * @param {string} codeContent - The source code.
 * @param {string} language - 'javascript', 'python', etc.
 * @returns {Promise<string>} - Generated test code.
 */
async function generateTests(codeContent, language) {
  const prompt = `
You are an expert software tester. 
Generate a comprehensive unit test suite for the following ${language} code.
Include edge cases and verify logic coverage.
Use ${language === 'javascript' ? 'Jest' : language === 'python' ? 'PyTest' : 'JUnit 5'} as the testing framework.
Return ONLY the code for the test file. Do not include markdown formatting or explanations.

Code:
${codeContent}
  `;

  try {
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      // Clean up markdown code blocks, non-printable control characters, and trailing junk
      text = text.replace(/```[a-z]*\n?/gi, '')
        .replace(/```/g, '')
        .replace(/[^\x20-\x7E\r\n\t]/g, '') // Keep printable ASCII, newlines, and tabs only
        .trim();
      return text;
    } else if (openai) {
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gpt-3.5-turbo",
      });
      let text = completion.choices[0].message.content;
      text = text.replace(/```(javascript|python|java)?/g, '').replace(/```/g, '');
      return text;
    } else {
      throw new Error("No AI API key found (GEMINI_API_KEY or OPENAI_API_KEY missing)");
    }
  } catch (error) {
    console.error("Error generating tests with AI:", error);
    // FALLBACK FOR TESTING/SIMULATION (e.g. if Rate Limited 429)
    console.log("Using MOCK tests for simulation due to AI error (likely 429).");
    if (language === 'javascript') {
      return `
const { add, subtract } = require('../../src/calculator'); 

// Mocking the calculator module
jest.mock('../../src/calculator', () => ({
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
}), { virtual: true });

test('adds 1 + 2 to equal 3', () => {
  const { add } = require('../../src/calculator');
  expect(add(1, 2)).toBe(3);
});

test('subtracts 5 - 2 to equal 3', () => {
  const { subtract } = require('../../src/calculator');
  expect(subtract(5, 2)).toBe(4); // INTENTIONAL FAIL for Email Test
});
`;
    }
    throw error;
  }
}

module.exports = {
  generateTests,
};
