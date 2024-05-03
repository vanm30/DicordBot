const fs = require("fs");

const readJSON = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading JSON file: ${filePath}`, error);
    return null;
  }
};

// Export the function
module.exports = readJSON;
