const { GatewayIntentBits } = require('discord.js');

module.exports = {
    botToken: process.env.DISCORD_BOT_TOKEN,
    APP_URL: process.env.APP_URL,
    GUILD_ID: process.env.GUILD_ID,
    port: 3000,
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
};
