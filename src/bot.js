require('dotenv').config();
const color = require('./colors');
const express = require('express');
const { Client } = require('discord.js');
const webhookHandler = require('./handler/webhookHandler');
const commandHandler = require('./handler/commandHandler');
const eventHandler = require('./handler/eventHandler');
const modalHandler = require('./handler/modalHandler');
const buttonsHandler = require('./handler/buttonHandler');
const config = require('./config');
const sequelize = require('./database');

const app = express();
const client = new Client({ intents: config.intents });

commandHandler(client, config);
eventHandler(client, config);
modalHandler(client, config);
buttonsHandler(client, config);

client.login(config.botToken);

app.use(express.json());

sequelize.authenticate()
  .then(() => {
    console.log(color.green('Connected to database successfully'));
});

app.post('/webhook', webhookHandler(client, config));

app.listen(config.port, () => {
    console.log(color.green(`Server is listening on 127.0.0.1:${config.port}`));
});
