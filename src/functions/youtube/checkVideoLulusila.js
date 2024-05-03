const { EmbedBuilder } = require("discord.js");
const Parser = require("rss-parser");
const fs = require("fs");
const parser = new Parser();

module.exports = (client) => {
  client.checkVideoLulusila = async () => {
    const data = await parser
      .parseURL(
        "https://www.youtube.com/feeds/videos.xml?channel_id=UCz4-hkxb_jzeKyc0azkQzPw"
      )
      .catch(console.error);

    const rawData = fs.readFileSync(`${__dirname}/../../json/dataStorage.json`);
    const jsonData = rawData.length !== 0 ? JSON.parse(rawData) : "";

    if (jsonData.lulusilaNewVideoId !== data.items[0].id) {
      //new video or new run
      fs.writeFileSync(
        `${__dirname}/../../json/dataStorage.json`,
        JSON.stringify({ lulusilaNewVideoId: data.items[0].id })
      );

      //create embed
      const { title, link, id, author } = data.items[0];
      const embed = new EmbedBuilder({
        title: title,
        url: link,
        color: 0x8c4d49,
        timestamp: Date.now(),
        image: {
          url: `https://img.youtube.com/vi/${id.slice(9)}/maxresdefault.jpg`,
        },
        author: {
          name: author,
          iconURL:
            "https://yt3.googleusercontent.com/ytc/AGIKgqMW1owU4oU3Nk0NzuK_c5krr3Lzb1J8Eygzd8vf=s176-c-k-c0x00ffffff-no-rj",
          url: "https://www.youtube.com/@maruskakozlova823",
        },
        footer: {
          text: client.user.tag,
          iconURL: client.user.displayAvatarURL(),
        },
      });

      const guild = await client.guilds
        .fetch(process.env.DC1_GUILD_ID)
        .catch(console.error);

      const channel = await guild.channels
        .fetch(process.env.DC1_MAIN_CHANNEL_ID)
        .catch(console.error);

      await channel
        .send({ embeds: [embed], content: `Ty pičo hezky Lulu. Nový video!` })
        .catch(console.error);
    }
  };
};
