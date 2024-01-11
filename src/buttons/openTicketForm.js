const {ActionRowBuilder, StringSelectMenuBuilder} = require('discord.js');

module.exports = {
    customId: 'create_ticket', // Button handler id
    async execute(interaction) {

        const row = new ActionRowBuilder()
            .addComponents(new StringSelectMenuBuilder()
                .setCustomId('select_ticket_type') // Submit handler id
                .setPlaceholder('Select Ticket Type')
                .addOptions([
                    // TODO get API departments
                    { label: 'Technical Support', value: 'technical_support' },
                    { label: 'Billing Inquiry', value: 'billing_inquiry' },
                ]));

        const message = await interaction.reply({
            content: 'Choose your ticket type', components: [row], ephemeral: true,
        });






        // Delete timer millisecond. 60000 - 1 min
        setTimeout(async () => {
            try {
                await message.delete();
            } catch (error) {
                console.error('Error deleting the message:', error);
            }
        }, 60000);
    }
};
