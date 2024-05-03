const { SlashCommandBuilder } = require("discord.js");
const wait = require("node:timers/promises").setTimeout;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("timer")
    .setDescription("Nastav si timer na libovolný čas. Formát timeru: x[s/m/h]")
    .addStringOption((option) =>
      option
        .setName("time")
        .setDescription("Na kolik času to chceš")
        .setRequired(true)
        .setMaxLength(5)
    ),
  async execute(interaction, client) {
    const message = await interaction.deferReply({
      fetchReply: true,
    });
    const timeStr = interaction.options.get("time").value;
    const regex = /\d{1,4}[smh]/g;

    if (regex.test(timeStr)) {
      //format correct -> run timer
      const time = timeStr.slice(0, timeStr.length - 1);
      const format = timeStr.slice(timeStr.length - 1, timeStr.length);
      var timerAmount = "";
      var reply = "<@340222999032496140> ";
      switch (format) {
        case "s":
          timerAmount = time * 1000;
          reply += `Timer ${time} sekund byl zapnut ^owo^`;
          break;

        case "m":
          timerAmount = time * 60 * 1000;
          reply += `Timer ${time} minut byl zapnut ^nya^`;
          break;

        case "h":
          timerAmount = time * 1200 * 1000;
          reply += `Timer ${time} hodin byl zapnut ^xdd^`;
          break;
      }
      await interaction.editReply({
        content: reply,
      });
      await wait(timerAmount);
      await interaction.followUp({
        content: reply.slice(0, reply.length - 16) + ` vypršel :)`,
      });
      return;
    }

    await interaction.editReply({
      content: `Špatnej formát ^uwu^.`,
    });
  },
};