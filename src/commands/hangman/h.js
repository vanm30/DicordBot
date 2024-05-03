const fs = require("fs");
const path = require("path");
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { log } = require("console");
const readJSON = require("../../tools/readJSON");
const writeJSON = require("../../tools/writeJSON");


const dataStorage = readJSON(
  path.join(__dirname, "../../json/dataStorage.json")
);

const lang = readJSON(
  path.join(__dirname, "../../json/languages/language_" + dataStorage.language + ".json")
);
const colors = readJSON(path.join(__dirname, "../../json/colors.json"));

function isLetter(str) {
  return str.length === 1 && str.match(/[A-Z]/i);
}

async function fireEmbedMessage(interaction, hangmanJSON, userJSON, embedInfo) {
  var embedMessage = {
    description: "",
    fields: [],
    title: "",
    color: colors.yellow.dec,
    image: {
      url: ``,
    },
    timestamp: new Date().toISOString(),
  };
  var rows;

  //set hangman number
  embedMessage.title = lang.hangman.hangman_title + " #" + hangmanJSON.hmId;

  //set hangman image
  const file = new AttachmentBuilder(
    "./src/assets/images/" + userJSON.fail + ".png"
  );
  embedMessage.image.url = `attachment://` + userJSON.fail + `.png`;

  //set hanman describtion (guessed word)
  //fill if not guessed
  //paste if guessed
  for (var i = 0; i < hangmanJSON.hmCurrentWord.length; i++) {
    const char = hangmanJSON.hmCurrentWord[i].toUpperCase();
    if (char != " ") {
      if (userJSON.guessedLetters.includes(char)) {
        const emojiId = interaction.guild.emojis.cache.findKey(
          (emoji) => emoji.name === char + "_"
        );

        embedMessage.description += ` <:${char}:${emojiId}>`;
      } else embedMessage.description += ` <:EMPTY:1178350612862214234>`;
    } else {
      embedMessage.description += "\n\n";
    }
  }

  // used words update
  //only fire if at least one word was guessed
  if (userJSON.guessedLetters.length != 0) {
    var guessed = {
      name: lang.hangman.guessed_chars + ":",
      value: "",
    };
    embedMessage.fields[0] = guessed;

    for (var l = 0; l < userJSON.guessedLetters.length; l++) {
      if (l == 0) {
        embedMessage.fields[0].value += userJSON.guessedLetters[l];
      } else {
        embedMessage.fields[0].value += ", " + userJSON.guessedLetters[l];
      }
    }
  }

  //if user finished the game
  if (
    ["9l", "8w", "7w", "6w", "5w", "4w", "3w", "2w", "1w", "0w"].includes(
      userJSON.fail
    )
  ) {
    var embedInfo = {
      title: "",
      color: "",
      fields: [
        {
          name: lang.hangman.today_hm_title,
          value: "",
        },
        {
          name: lang.hangman.stats_title,
          value: "",
          inline: true,
        },
      ],
    };
    embedInfo.fields[0].value = hangmanJSON.hmCurrentWord.toUpperCase();
    embedInfo.fields[1].value =
      lang.hangman.stats_games +
      `: ` +
      userJSON.gamesPlayed +
      ` \n` +
      lang.hangman.stats_streak +
      `: ` +
      userJSON.streak;

    if (["9l"].includes(userJSON.fail)) {
      embedInfo.title = lang.hangman_lose_title + ` :skull: :skull: :skull:`;
      embedInfo.color = colors.red.dec;
      embedMessage.color = colors.red.dec;
    } else if (["8w"].includes(userJSON.fail)) {
      embedInfo.title =
        lang.hangman.oof_title + ` :triumph: :triumph: :triumph:`;
      embedInfo.color = colors.orange.dec;
      embedMessage.color = colors.orange.dec;
    } else {
      embedInfo.title =
        lang.hangman.win_title + ` :triumph: :triumph: :triumph:`;
      embedInfo.color = colors.green.dec;
      embedMessage.color = colors.green.dec;
    }

    userJSON.ongoing = false;
  }

  //send Message Embed
  var embeds = embedInfo == null ? [embedMessage] : [embedMessage, embedInfo];
  await interaction.editReply({
    embeds: embeds,
    files: [file],
    ephemeral: true,
    components: rows ? rows : [],
  });

  //save all changes to JSON
  const usersJSONPath = path.join(__dirname, "../../json/users");
  const userJSONPath = path.join(usersJSONPath, `${interaction.user.id}.json`);
  const hangmanJSONPath = path.join(__dirname, "../../json/hangman.json");
  writeJSON(userJSONPath, userJSON);
  writeJSON(hangmanJSONPath, hangmanJSON);
}

async function handleButtonClick(interaction, hangmanJSON, userJSON, buttonCustomId) {
  // Check if the button pressed is ">" or "<"
  if (buttonCustomId === ">" || buttonCustomId === "<") {
    // Switch the keyboard
    switchKeyboard();

    // Update the components with the new keyboard
    const rows = currentKeyboard.map((row) => {
      return new ActionRowBuilder().addComponents(
        row.map((key) =>
          new ButtonBuilder()
            .setCustomId(key)
            .setLabel(key)
            .setStyle(ButtonStyle.Primary)
        )
      );
    });

    // Send the updated message with the new keyboard
    await interaction.editReply({
      embeds: [embedMessage],
      files: [file],
      ephemeral: true,
      components: rows,
    });

    return; // Return to avoid executing the rest of the function for keyboard switch
  }

  // Handle other button clicks
  // Your existing button click logic goes here
  // For example, you can add additional conditions for each buttonCustomId
  // and perform specific actions accordingly

  // Acknowledge the button click
  await interaction.deferUpdate();
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("h")
    .setDescription(lang.hangman.h_desc)
    .addSubcommand((subcommand) =>
      subcommand.setName("play").setDescription(lang.hangman.play_desc)
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("newday").setDescription(lang.hangman.newday_desc)
    ),
  async execute(interaction, client) {
    // Check if it's a button interaction
    if (interaction.isButton()) {
      console.log("button in");
      const buttonInteraction = interaction;
      const buttonCustomId = buttonInteraction.customId;

      // Handle button click
      await handleButtonClick(
        interaction,
        hangmanJSON,
        userJSON,
        buttonCustomId
      );
    }
    await interaction.deferReply({ ephemeral: true });

    if (interaction.options.getSubcommand() == "play") {
      // global vars
      var letterNotGuessed = true;
      const usersJSONPath = path.join(__dirname, "../../json/users");
      const userJSONPath = path.join(
        usersJSONPath,
        `${interaction.user.id}.json`
      );
      const hangmanJSONPath = path.join(__dirname, "../../json/hangman.json");

      //check that user is registered
      // if not, register them
      if (!fs.existsSync(userJSONPath)) {
        var newPlayer = {
          guessedLetters: [],
          fail: 0,
          lastHm: 0,
          ongoing: false,
          gamesPlayed: 0,
          wins: 0,
          streak: 0,
          bestStreak: 0,
        };
        fs.writeFileSync(userJSONPath, JSON.stringify(newPlayer, null, 2));
      }
      //parse JSON
      let userJSON = readJSON(userJSONPath);
      let hangmanJSON = readJSON(hangmanJSONPath);

      //check that user did not send two /h play command
      //if yes, delete the defer and do nothing
      if (userJSON.ongoing) {
        await interaction.deleteReply({ ephemeral: true });
        return;
      }

      //check that user has not yet played today or disallow them to play
      if (hangmanJSON.hmId == userJSON.lastHm) {
        //user has already played today, tell them
        var embedInfo = {
          title: lang.headers.info,
          description: lang.hangman.today_played,
          color: colors.blue.dec,
        };
        fireEmbedMessage(interaction, hangmanJSON, userJSON, embedInfo);
        return;
      }

      userJSON.ongoing = true;

      //save all changes
      writeJSON(userJSONPath, userJSON);
      writeJSON(hangmanJSONPath, hangmanJSON);

      //create and send embed message
      fireEmbedMessage(interaction, hangmanJSON, userJSON);

      //save all changes
      writeJSON(userJSONPath, userJSON);
      writeJSON(hangmanJSONPath, hangmanJSON);

      if (
        [
          "9l",
          "9w",
          "8w",
          "7w",
          "6w",
          "5w",
          "4w",
          "3w",
          "2w",
          "1w",
          "0w",
        ].includes(userJSON.fail)
      ) {
        return;
      }

      //wait for response
      const waitForMessages = async () => {
        try {
          const collected = await interaction.channel.awaitMessages({
            max: 1,
            time: 30000,
            errors: ["time"],
          });
          const collectedMessage = collected.first();

          //check if the collected message if from the actual user
          if (collectedMessage.author !== interaction.user) {
            waitForMessages();
            return;
          }

          //first delete the message from user
          await collectedMessage.delete();

          //vars
          var guessedLetter = collectedMessage.content.toUpperCase();

          if (isLetter(guessedLetter)) {
            letterNotGuessed = true;
            userJSON.guessedLetters.forEach((element) => {
              if (guessedLetter == element) {
                var embedInfo = {
                  title: lang.headers.info,
                  description: lang.hangman.char_guessed,
                  color: colors.blue.dec,
                };
                fireEmbedMessage(interaction, hangmanJSON, userJSON, embedInfo);
                letterNotGuessed = false;
              }
            });
            if (letterNotGuessed) {
              userJSON.guessedLetters.push(guessedLetter);

              // progress in the game
              // add fail if letter not in currentHmWord
              if (
                !hangmanJSON.hmCurrentWord.includes(guessedLetter.toLowerCase())
              ) {
                if (userJSON.fail < 8) {
                  userJSON.fail++;
                } else {
                  userJSON.fail = "9l";
                }
              }
              var wordsNotGuessed = 0;
              for (var w = 0; w < hangmanJSON.hmCurrentWord.length; w++) {
                if (
                  !userJSON.guessedLetters.includes(
                    hangmanJSON.hmCurrentWord[w].toUpperCase()
                  )
                ) {
                  if (hangmanJSON.hmCurrentWord[w].toUpperCase() != " ") {
                    wordsNotGuessed++;
                  }
                }
              }
              if (wordsNotGuessed == 0) {
                userJSON.fail += "w";
              }

              //update the message embed
              fireEmbedMessage(interaction, hangmanJSON, userJSON);

              //save all changes
              writeJSON(userJSONPath, userJSON);
              writeJSON(hangmanJSONPath, hangmanJSON);

              if (
                [
                  "9l",
                  "8w",
                  "7w",
                  "6w",
                  "5w",
                  "4w",
                  "3w",
                  "2w",
                  "1w",
                  "0w",
                ].includes(userJSON.fail)
              ) {
                return;
              }
            }
          } else {
            var embedInfo = {
              title: lang.headers.info,
              description: lang.hangman.not_char,
              color: colors.blue.dec,
            };
            fireEmbedMessage(interaction, hangmanJSON, userJSON, embedInfo);
          }
          // Call the function recursively to wait for the next message
          await waitForMessages();
        } catch (error) {
          //allow user to /h play again
          userJSON.ongoing = false;
          //save all changes
          writeJSON(userJSONPath, userJSON);
          writeJSON(hangmanJSONPath, hangmanJSON);
          switch (error) {
            case "time":
              var embedInfo = {
                title: lang.headers.info,
                description: lang.hangman.time_run_out,
                color: colors.red.dec,
              };
              break;
            default:
              var embedInfo = {
                title: lang.headers.error,
                description: lang.hangman.bug_undef,
                color: colors.red.dec,
              };
              break;
          }
          interaction.editReply({
            embeds: [embedInfo],
            ephemeral: true,
          });
        }
      };
      waitForMessages();
    }
    if (interaction.options.getSubcommand() == "addWord") {
      console.log(interaction);
    }
    if (interaction.options.getSubcommand() == "deleteWord") {
      console.log(interaction);
    }
    if (interaction.options.getSubcommand() == "newday") {
      client.newHmDay();
      var embedInfo = {
        title: lang.headers.info,
        description: lang.hangman.new_day,
        color: colors.blue.dec,
      };
      await interaction.editReply({
        embeds: [embedInfo],
        ephemeral: true,
      });
    }
  },
};
