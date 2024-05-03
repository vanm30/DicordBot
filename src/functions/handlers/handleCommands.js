const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { readdirSync } = require("fs");

const wait = require("node:timers/promises").setTimeout;

module.exports = (client) => {
  client.handleCommands = async () => {
    const commandsFolders = readdirSync("./src/commands");
    for (const folder of commandsFolders) {
      const commandFiles = readdirSync(`./src/commands/${folder}`).filter(
        (file) => file.endsWith(".js")
      );

      const { commands, commandArray } = client;
      for (const file of commandFiles) {
        const command = require(`../../commands/${folder}/${file}`);
        commands.set(command.data.name, command);
        commandArray.push(command.data.toJSON());
        console.log(`Command: ${command.data.name} has been handled.`);
      }
    }

    const applicationId = process.env.APPLICATION_ID;
    const guildId = process.env.DC1_GUILD_ID;
    const rest = new REST().setToken(process.env.TOKEN);

    // I dont think this is needed 
    // try {
    //   await rest.put(Routes.applicationGuildCommands(applicationId, guildId), {
    //     body: [],
    //   });
    //   await rest.put(Routes.applicationCommands(applicationId), {
    //     body: [],
    //   });
    //   console.log("Successfully deleted all commands.");
    // } catch (error) {
    //   console.error(error);
    // }

    await wait(1000);

    try {
      console.log("Started refreshing aplication (/) commands.");

      await rest.put(Routes.applicationGuildCommands(applicationId, guildId), {
        body: client.commandArray,
      });

      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  };
};
