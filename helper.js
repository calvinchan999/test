// helpers.js
const fs = require("fs").promises;
const path = require("path");

/**
 * Creates a promise that resolves after a specified delay.
 * @param {number} ms - The delay in milliseconds.
 * @returns {Promise} A promise that resolves after the specified delay.
 */

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function writeResultToJson(filename, data) {
  try {
    const dirPath = path.join(__dirname, "./", "test-reporting");
    const filePath = path.join(dirPath, `${filename}.json`);

    // Create the directory if it doesn't exist
    await fs.mkdir(dirPath, { recursive: true });

    // Write the file
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    console.log(`Results written to ${filePath}`);
  } catch (error) {
    console.error(`Error writing results to JSON: ${error.message}`);
    throw error; // Re-throw the error to fail the test if writing fails
  }
};


module.exports = { delay, writeResultToJson };
