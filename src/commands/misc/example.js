const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("example")
    .setDescription("Testovancí command."),
  async execute(interaction, client) {
    await interaction.deferReply();


    const emoji = await fetchEmoji("A");

    // Now you can send the combined emojis as a response
    await interaction.editReply(emoji);
  },
};

async function fetchEmoji(letter) {
  const letterArray = {
    A: "1178350566351568936",
    B: "1178350568822026300",
    // ... (other emoji IDs)
  };
  const emojiId = letterArray["A"];
  try {
    return `<:${letter}:${emojiId}>`;
  } catch (error) {
    console.error("Error fetching emoji:", error);
    // Handle the error as needed
    throw error;
  }
}
