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

client.once('ready', () => {
    console.log('Bot is online!');
    client.user.setActivity('Tickets');
});

client.on('messageCreate', message => {
    // Replace this with the appropriate way you get your channel
    const channel = message.channel;

    // Function to check if channel topic is valid JSON
    function isTicket(channel) {
        const topic = channel.topic;
        
        if(!message.hasOwnProperty('content')) {
            return false;
        }

        if (!topic) {
            return false;
        }

        try {
            // check if data is json
            const parsedTopic = JSON.parse(topic);
            if (parsedTopic.hasOwnProperty('ticket_id')) {
                if(message?.author.bot) {
                    return false;
                }
                let content = message.content;

                const regex = /<@!?(\d+)>/g;
                content = content.replace(regex, (match, userId) => {
                    const user = client.users.cache.get(userId);
                    return user ? `@${user.username}` : match;
                });

                // Checking if the message has attachments
                if (message.attachments.size > 0) {
                    // Go through all attachments
                    message.attachments.forEach(attachment => {
                        // Check if the attachment is an image
                        if (attachment.contentType && attachment.contentType.includes('image')) {
                            // Add the image URL to the content
                            content += ' \n' + attachment.url;
                        }
                    });
                }

                const api_url_create = APP_URL + '/api/v1/tickets/'+ parsedTopic.ticket_id + '/discord-message';
                const data = {
                    author: message.author.username,
                    avatar_url: message.author.displayAvatarURL(),
                    message: content
                };
                axios.post(api_url_create, data);
            }

        } catch (error) {
            return false;
        }
    }

    isTicket(channel);
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
