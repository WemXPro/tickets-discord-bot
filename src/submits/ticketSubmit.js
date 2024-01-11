module.exports = {
    customId: 'select_ticket_type', // Select id
    execute: async (interaction) => {
        if (interaction.customId === 'select_ticket_type') {

            const selectedValue = interaction.values[0];
            await interaction.reply({ content: 'Selected: ' + selectedValue});
        }
    }
};