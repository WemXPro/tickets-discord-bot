const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-button')
        .setDescription('Create a new support ticket button form'),
    async execute(interaction) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket') // Form/Select id
                    .setLabel('Create Ticket')
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.reply({ content: 'Click the button to create a ticket', components: [row] });
    }
};
