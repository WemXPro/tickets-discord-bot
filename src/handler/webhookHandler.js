const { ChannelType } = require('discord.js');
const color = require('../colors');

const webhookHandler = (client, config) => async (req, res) => {

    // Check if config.WEBHOOK_SECRET is provided
    if (!config.WEBHOOK_SECRET) {
        console.error('WEBHOOK_SECRET is not set in the configuration.');
        return res.status(500).send('Server configuration error');
    }

    // check webhook secret
    if (req.headers['webhook_secret'] !== config.WEBHOOK_SECRET) {
        return res.status(401).send('Invalid webhook secret');
    }

    if (!req.body.user) {
        return res.status(400).send('Invalid data load');
    }

    const channelName = 'ticket-' + req.body.user.username;    
    const guild = client.guilds.cache.get(config.DISCORD_SERVER);
    if (!guild) {
        return res.status(500).send('Guild not found');
    }
    
    try {
        let topic = {
            ticket_id: req.body.id,
            department: req.body.department.name,
            url: config.APP_URL + '/tickets/' + req.body.id,
        };
        let topicString = JSON.stringify(topic);

        const channel = await guild.channels.create({
            name: channelName,
            topic: topicString,
            type: ChannelType.GuildText,
            parent: config.TICKETS_CHANNEL, // Set the parent to the category ID
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: ['ViewChannel'],
                },
            ],
        });

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
