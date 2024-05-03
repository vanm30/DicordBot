const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  client.newHmDay = async () => {
    //get hangman JSON
    const hangmanJSONPath = path.join(__dirname, "../../json/hangman.json");
    const hangmanJSON = readJSON(hangmanJSONPath);

    //get users
    const usersJSONPath = path.join(__dirname, "../../json/users");
    const userJSONFiles = fs.readdirSync(usersJSONPath);
    const users = userJSONFiles.map(filename => filename.replace('.json', ''));

    //vars
    var hmWords = hangmanJSON.hmWords;

    //update hangman JSON -  Id, Cycle Word
    hangmanJSON.hmId++;
    hangmanJSON.hmPreviousWords.push(hangmanJSON.hmCurrentWord);
    for (previousWord of hangmanJSON.hmPreviousWords) {
      hmWords = hmWords.filter((item) => item !== previousWord);
    }
    hangmanJSON.hmPreviousWords.shift();

    var nextWord = hmWords[Math.floor(Math.random() * hmWords.length)];
    hangmanJSON.hmCurrentWord = nextWord;

    saveJSON(hangmanJSONPath, hangmanJSON);

    //clear all users day
    users.forEach(user => {
      const userJSONPath = path.join(usersJSONPath, `${user}.json`);
      const userJSON = readJSON(userJSONPath);

      userJSON.guessedLetters = [];
      userJSON.fail = 0;
      userJSON.ongoing = false;

      saveJSON(userJSONPath, userJSON);
    });
  };
};
[]

function readJSON(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const hangmanJSON = JSON.parse(data);
    return hangmanJSON;
  } catch (error) {
    console.error(
      `Error reading or parsing JSON from file: ${filePath}`,
      error
    );
    return null;
  }
}

function saveJSON(filePath, jsonData) {
  try {
    const jsonString = JSON.stringify(jsonData, null, 2);
    fs.writeFileSync(filePath, jsonString, 'utf8');
  } catch (error) {
    console.error(`Error saving JSON data to file: ${filePath}`, error);
  }
}

function getJsonFileNames(folderPath, callback) {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      callback(err, null);
      return;
    }

    // Filter out only the JSON files
    const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');

    // Extract file names without extension
    const jsonFileNames = jsonFiles.map(file => path.parse(file).name);

    console.log('JSON File Names:', jsonFileNames);

    callback(null, jsonFileNames);
  });
}