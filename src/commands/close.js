const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('close')
        .setDescription('Closes this ticket'),
    async execute(interaction, config) {
        if (!interaction.channel || !interaction.channel.topic) {
            await interaction.reply('This channel does not have a topic, so it cannot be a ticket.');
            return;
        }

        let parsedTopic;

        try {
            parsedTopic = JSON.parse(interaction.channel.topic);
        } catch (error) {
            await interaction.reply('Error parsing the channel topic.');
            return;
        }

        if (!parsedTopic.hasOwnProperty('ticket_id')) {
            await interaction.reply('This channel does not have a ticket ID.');
            return;
        }

        const api_url_close = `${config.APP_URL}/api/v1/tickets/${parsedTopic.ticket_id}/close-or-open`;

        try {
            await axios.get(api_url_close, config.headers);
            await interaction.reply('Ticket closed successfully.');
        } catch (error) {
            console.error('Error when closing the ticket:', error);
            await interaction.reply('An error occurred when closing the ticket.');
        }
    }
};
