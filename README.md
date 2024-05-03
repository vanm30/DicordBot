# Hangman Discord Bot
Welcome to my Discord (Yo)Bot! This bot allows you to play the classic word-guessing game - Hangman, but only once each day. Think Wordle but with phrases... 

Currently, Hangman is the only available feature, but more are coming!


## Getting Started

To use this open-source bot, you need to have Node.js and npm installed on your machine. Follow these steps to set up the bot:

1. Clone this repository to your local machine.
2. Navigate to the root directory of the project in your terminal.
3. Run npm i to install the necessary dependencies.

## Setting up Discord Bot on localhost

Before running the bot, you need to set up a .env file with your Discord bot information. Here's what your .env file should look like:

Create a text channel on your Discord server.
Assign the ID of the text channel to the HM_CHANNEL environment variable in your .env file.

DISCORD_TOKEN=your_discord_token
HM_CHANNEL=hangman_text_channel_id

## Starting the Bot on localhost

Once you've set up your .env file, you can start the bot by running the following command:

node .


## Playing Hangman

To play Hangman, follow these steps:

1. Use the command /h play to start the game.
2. Guess letters by typing them into the chat, for example, "a".
3. The bot will respond with the updated Hangman game board after each guess.
4. To start a new game or simulate a new day, you can use the command /h newday. (demo feature, which will not be part of final product)



## Try your luck

Alternatively, you can try loading my bot via following link. However, please note that it is likely that my bot is not currently running on my server, so it could be shut down.

Link: https://discord.com/api/oauth2/authorize?client_id=1106135137009270785&permissions=8&scope=bot%20applications.commands