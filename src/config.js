const { GatewayIntentBits } = require('discord.js');

module.exports = {
    botToken: process.env.DISCORD_BOT_TOKEN,
    APP_URL: process.env.APP_URL,
    WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
    DISCORD_SERVER: process.env.DISCORD_SERVER,
    TICKETS_CHANNEL: process.env.TICKETS_CHANNEL,
    API_KEY: process.env.API_KEY,
    GUILD_ID: process.env.GUILD_ID,
    port: 3000,
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    headers: {
        headers: {
            'Authorization': `Bearer ${process.env.API_KEY}`
        }
    }
};
