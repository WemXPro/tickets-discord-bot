require('dotenv').config();
const express = require('express');
const { Client } = require('discord.js');
const webhookHandler = require('./handler/webhookHandler');
const commandHandler = require('./handler/commandHandler');
const eventHandler = require('./handler/eventHandler');
const config = require('./config');

const app = express();
const client = new Client({ intents: config.intents });

commandHandler(client);
eventHandler(client);

client.login(config.botToken);

app.use(express.json());
app.post('/webhook', webhookHandler(client, config));

app.listen(config.port, () => {
    console.log(`Server is listening on ${config.APP_URL}:${config.port}`);
});
