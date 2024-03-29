const axios = require('axios');
const Link = require('../models/link');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;
        const channel = message.channel;

        // Check if the channel subject is a valid JSON
        if (!channel.topic) return;

        let parsedTopic;
        try {
            parsedTopic = JSON.parse(channel.topic);
        } catch (error) {
            return;
        }

        const Tenant = await Link.findOne({
            where: { discord_server_id: channel.guild.id }
        });

        if (!Tenant) return;

        // Check for ticket_id in channel topic
        if (!parsedTopic.hasOwnProperty('ticket_id')) return;

        // Processing the content of the message
        let content = message.content;
        const regex = /<@!?(\d+)>/g;
        content = content.replace(regex, (match, userId) => {
            const user = message.client.users.cache.get(userId);
            return user ? `@${user.username}` : match;
        });

        // Add image URLs if available
        if (message.attachments.size > 0) {
            message.attachments.forEach(attachment => {
                if (attachment.contentType && attachment.contentType.includes('image')) {
                    content += ' \n' + attachment.url;
                }
            });
        }

        // Create data to send
        const data = {
            author: message.author.username,
            avatar_url: message.author.displayAvatarURL(),
            message: content
        };

        // Sending data to the API
        try {
            await axios.post(`${Tenant.protocol + Tenant.domain}/api/v1/tickets/${parsedTopic.ticket_id}/discord-message`, data, {
                headers: {
                    'Authorization': `Bearer ${Tenant.api_key}`
                }
            });
        } catch (error) {
            console.error('Error posting message to API:', error);
            // make the bot reply that the channel is not a ticket
            // create message in the channel with the bot
            channel.send('Failed to post message to API. Unsync the server using "/unsync" and sync again using "/sync" to fix this issue.');
        }
    }
};
