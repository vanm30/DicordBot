const schedule = require("node-schedule");
const fs = require("fs");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`Ready!`);

    schedule.scheduleJob("0 0 * * *", function () { // starts new day of Hangman - resets the game, saves stats
      client.newHmDay();
    });
    // setInterval(client.checkVideoLulusila, 1 * 1000);
    // setInterval(client.newHmDay, 1 * 1000);
  },
};
