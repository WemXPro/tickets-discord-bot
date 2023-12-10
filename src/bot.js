require('dotenv').config();
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const { Client, GatewayIntentBits, ChannelType, MessageEmbed } = require('discord.js');


const app = express();
const port = 3000;

app.use(bodyParser.json());

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent  // Add this intent
    ]
});

const botToken = process.env.DISCORD_BOT_TOKEN;
const APP_URL = process.env.APP_URL;
const GUILD_ID = process.env.GUILD_ID;



// Commands
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const rest = new REST({ version: '9' }).setToken(botToken);

const commands = [{
    name: 'close',
    description: 'Closes this ticket'
}, {
    name: 'echo',
    description: 'Repeats your message',
    options: [{
        name: 'message',
        type: 3,
        description: 'Message to repeat',
        required: true,
    }],
}];



client.once('ready', async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, GUILD_ID),
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});


client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const { commandName } = interaction;

    if (commandName === 'close') {
        if (!interaction.channel || !interaction.channel.topic) return;
        let parsedTopic = JSON.parse(interaction.channel.topic);

        if (parsedTopic.hasOwnProperty('ticket_id')) {
            const api_url_create = APP_URL + '/api/v1/tickets/' + parsedTopic.ticket_id + '/close-or-open';
            let res = axios.get(api_url_create);
            await interaction.reply('Ticket closed');
            return;
        }
    } else if (commandName === 'echo') {
        const message = interaction.options.getString('message');
        await interaction.reply(`Echo: ${message}`);
    }
});
// End Commands



client.once('ready', () => {
    console.log('Bot is online!');
    client.user.setActivity('Tickets');
});



client.login(botToken);

// Webhook endpoint
app.post('/webhook', async (req, res) => {
    console.log('Webhook received:', req.body);

    const channelName = 'ticket-' + req.body.user.username;

    if (!channelName) {
        return res.status(400).send('Channel name not provided in webhook data');
    }

    const guild = client.guilds.cache.first();
    if (!guild) {
        return res.status(500).send('Guild not found');
    }

    try {
        let topic = {
            ticket_id: req.body.id,
            department: req.body.department.name,
            url: APP_URL + '/tickets/' + req.body.id,
        };
        let topicString = JSON.stringify(topic);

        const channel = await guild.channels.create({
            name: channelName,
            topic: topicString,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: ['ViewChannel'],
                },
            ],
        });

        console.log(`Created new private channel: ${channel.name}`);

        // Create a webhook in the new channel and wait for it to be created
        const webhook = await channel.createWebhook({
            name: 'WemX-Webhook',
        });

        // Construct the webhook URL
        const webhookUrl = `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`;
        console.log(`Webhook URL: ${webhookUrl}`);

        // Send the webhook URL in the response
        res.status(200).json({ webhookUrl: webhookUrl });

    } catch (error) {
        console.error('Error creating private channel or webhook:', error);
        res.status(500).send('Error creating private channel or webhook');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on beta.wemx.net:${port}`);
});
