const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const Link = require('../models/link');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('The ticket will be locked and channel will be deleted')
        .setDefaultMemberPermissions(8),
    async execute(interaction) {

        const Tenant = await Link.findOne({
            where: { discord_server_id: interaction.guild.id }
        });

        if (!Tenant) {
            await interaction.reply('This server is not syncronized with any domain.');
            return;
        };

        if (!interaction.channel || !interaction.channel.topic) {
            await interaction.reply('This channel is not a ticket.');
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

        const api_url = `${Tenant.protocol + Tenant.domain}/api/v1/tickets/${parsedTopic.ticket_id}/lock`;

        try {
            await axios.get(api_url, {
                headers: {
                    'Authorization': `Bearer ${Tenant.api_key}`
                }
            });
            await interaction.reply('Ticket was locked successfully, this channel wil be deleted in 5 seconds');

            // Delete the channel after a short delay
            setTimeout(() => {
                interaction.channel.delete()
                    .then(() => console.log(`Deleted channel`))
                    .catch(error => console.error('Error deleting channel:', error));
            }, 5000); // Delay of 5000 milliseconds (5 seconds)
            
        } catch (error) {
            console.error('Error when locking the ticket:', error);
            await interaction.reply('An error occurred when locking the ticket.');
        }
    }
};
