const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-button')
        .setDescription('Create a new support ticket button form')
        .setDefaultMemberPermissions(8),
    async execute(interaction) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket') // Form/Select id
                    .setLabel('🎫 Create Ticket')
                    .setStyle(ButtonStyle.Secondary)
            );

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Support Ticket')
            .setDescription('Click the button below to create a new support ticket.')
            .setTimestamp();

        await interaction.reply({ embeds: [embed], components: [row] });
    }
};
