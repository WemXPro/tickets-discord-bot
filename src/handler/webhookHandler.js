const { ChannelType } = require('discord.js');

const webhookHandler = (client, config) => async (req, res) => {
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
            url: config.APP_URL + '/tickets/' + req.body.id,
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
    
        const webhook = await channel.createWebhook({
            name: 'WemX-Webhook',
        });
    
        const webhookUrl = `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`;
        console.log(`Webhook URL: ${webhookUrl}`);
    
        res.status(200).json({ webhookUrl: webhookUrl });

    } catch (error) {
        console.error('Error creating private channel or webhook:', error);
        res.status(500).send('Error creating private channel or webhook');
    }
};

module.exports = webhookHandler;
