const { GatewayIntentBits } = require('discord.js');

module.exports = {
    botToken: process.env.DISCORD_BOT_TOKEN,
    port: 3000,
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    // add a database array for each database connection value 
    DATABASE: {
        name: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        dialect: process.env.DB_TYPE,
    },
};
