const { ChannelType } = require('discord.js');
const color = require('../colors');
const Link = require('../models/link');

const webhookHandler = (client) => async (req, res) => {

    if (!req.body.discord_server) {
        return res.status(400).send('Discord Server ID was not passed');
    }

    const Tenant = await Link.findOne({
        where: { discord_server_id: req.body.discord_server }
    });

    if (!Tenant) {
        return res.status(400).send('Discord server is not synced with any domain');
    }
    
    if (Tenant.api_key !== req.body.api_key) {
        return res.status(400).send('API Key Mismatch, make sure you are using the correct API Key');
    }

    if (!req.body.user) {
        return res.status(400).send('Invalid data load');
    }

    const channelName = 'ticket-' + req.body.user.username;    
    const guild = client.guilds.cache.get(req.body.discord_server);
    if (!guild) {
        return res.status(500).send('Guild not found');
    }
    
    try {
        let topic = {
            ticket_id: req.body.id,
            department: req.body.department.name,
            url: Tenant.protocol + Tenant.domain + '/tickets/' + req.body.id,
        };
        let topicString = JSON.stringify(topic);

        const channelOptions = {
            name: channelName,
            topic: topicString,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: ['ViewChannel'],
                },
            ],
        };
        
        // Check if the discord_channel variable exists and has a value
        if (req.body.discord_channel) {
            channelOptions.parent = req.body.discord_channel; // Set the parent to the category ID only if it exists
        }
        
        // Create the channel with the specified options
        const channel = await guild.channels.create(channelOptions);        

        console.log(color.green(`Created new private channel: ${channel.name}`));
    
        const webhook = await channel.createWebhook({
            name: 'WemX-Webhook',
        });
    
        const webhookUrl = `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`;
        console.log(color.green(`Webhook URL: ${webhookUrl}`));
    
        res.status(200).json({ webhookUrl: webhookUrl });

    } catch (error) {
        console.error('Error creating private channel or webhook:', error);
        res.status(500).send('Error creating private channel or webhook');
    }
};

module.exports = webhookHandler;
