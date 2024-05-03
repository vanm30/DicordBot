const fs = require("fs");

const writeJSON = (filePath, jsonData) => {
  try {
    const jsonString = JSON.stringify(jsonData, null, 2);
    fs.writeFileSync(filePath, jsonString, "utf8");
  } catch (error) {
    console.error(`Error saving JSON data to file: ${filePath}`, error);
  }
};

// Export the function
module.exports = writeJSON;
