const {
  EmbedBuilder,
  ActionRowBuilder,
  VoiceChannel,
} = require("discord.js");
const fs = require("fs");
const readJSON = require("../../tools/readJSON");
const writeJSON = require("../../tools/writeJSON");
const path = require("path");

module.exports = {
  name: "messageCreate",
  async execute(message, client, interaction) {
    if (message.author.bot) return;
    const prefix = "*";

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(" ");
    const command = args.shift().toLowerCase();

    switch (command) {
      case "lang":
        switch (args[0]) {
          case "en": //fallthrough
          case "cs":
            const dataStorage = readJSON(
              path.join(__dirname, "../../json/dataStorage.json")
            );
            dataStorage.language = args[0];
            writeJSON(path.join(__dirname, "../../json/dataStorage.json"), dataStorage);
            message.channel.send(`Language set to: ${args[0]}`);
        }
        break;
      default:
        message.channel.send("Invalid language. Please use 'en' or 'cs'.");
        break;
    }
  },
};
