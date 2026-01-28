const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

/**
 * Save the generated test code and source code to files and execute tests.
 * @param {string} testCode - The generated test code.
 * @param {string} fileName - Original filename (e.g. AddTwoVariable.java).
 * @param {string} language - 'javascript', 'python', 'java'.
 * @param {string} sourceCode - The actual source code of the file.
 * @returns {Promise<Object>} - Execution result { success, output, error }
 */
async function runTests(testCode, fileName, language, sourceCode) {
  const testDir = path.join(__dirname, '../../tests');
  const tempSrcDir = path.join(__dirname, '../../temp_src');

  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
  if (!fs.existsSync(tempSrcDir)) fs.mkdirSync(tempSrcDir, { recursive: true });

  let testFileName;
  let sourceFilePath = path.join(tempSrcDir, fileName);
  if (language === 'javascript') {
    testFileName = fileName.endsWith('.js') ? fileName.replace('.js', '.test.js') : `${fileName}.test.js`;
  } else if (language === 'python') {
    testFileName = fileName.startsWith('test_') ? fileName : `test_${fileName}`;
  } else if (language === 'java') {
    testFileName = fileName.endsWith('.java') ? fileName.replace('.java', 'Test.java') : `${fileName}Test.java`;

    // Extract package name for Java
    const packageMatch = sourceCode ? sourceCode.match(/package\s+([^;]+);/) : null;
    if (packageMatch) {
      const packageName = packageMatch[1].trim();
      const packagePath = packageName.replace(/\./g, '/');
      const fullSourceDir = path.join(tempSrcDir, packagePath);
      if (!fs.existsSync(fullSourceDir)) fs.mkdirSync(fullSourceDir, { recursive: true });
      sourceFilePath = path.join(fullSourceDir, fileName);
    }
  } else {
    testFileName = `test_${fileName}`;
  }

  let testFilePath = path.join(testDir, testFileName);
  let finalFullClassName = testFileName.replace('.java', '');

  // Second pass for Java tests: Move them to package folder if declared
  if (language === 'java') {
    const testPackageMatch = testCode ? testCode.match(/package\s+([^;]+);/) : null;
    if (testPackageMatch) {
      const testPackageName = testPackageMatch[1].trim();
      const testPackagePath = testPackageName.replace(/\./g, '/');
      const fullTestSubDir = path.join(testDir, testPackagePath);
      if (!fs.existsSync(fullTestSubDir)) fs.mkdirSync(fullTestSubDir, { recursive: true });
      testFilePath = path.join(fullTestSubDir, testFileName);
      finalFullClassName = `${testPackageName}.${testFileName.replace('.java', '')}`;
    }
  }

  // Write test code and source code to files
  if (fs.existsSync(testFilePath)) fs.unlinkSync(testFilePath);
  fs.writeFileSync(testFilePath, testCode);
  if (sourceCode) {
    if (fs.existsSync(sourceFilePath)) fs.unlinkSync(sourceFilePath);
    fs.writeFileSync(sourceFilePath, sourceCode);
  }

  return new Promise((resolve) => {
    let command;
    const relativeTestPath = `tests/${testFileName}`;

    if (language === 'javascript') {
      command = `npx jest "${relativeTestPath}"`;
    } else if (language === 'python') {
      command = `pytest "${relativeTestPath}"`;
    } else if (language === 'java') {
      const libDir = path.join(__dirname, '../../lib');
      const junitJar = path.join(libDir, 'junit-platform-console-standalone.jar');

      // Classpath must include JUnit JAR, temp_src (for code), and tests folder
      const classPath = `"${junitJar};${tempSrcDir};${testDir};."`;

      command = `javac -cp ${classPath} "${testFilePath}" && java -cp ${classPath} org.junit.platform.console.ConsoleLauncher --select-class ${finalFullClassName}`;
    } else {
      return resolve({ success: false, error: 'Unsupported language' });
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve({ success: false, output: stdout, error: stderr || error.message });
      } else {
        resolve({ success: true, output: stdout });
      }
    });
  });
}

module.exports = {
  runTests,
};
