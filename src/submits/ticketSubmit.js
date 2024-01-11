module.exports = {
    customId: 'select_ticket_type', // Select id
    execute: async (interaction) => {
        if (interaction.customId === 'select_ticket_type') {

            // TODO auto create department category if not exist and ticket in category
            const selectedValue = interaction.values[0];
            await interaction.reply({ content: 'Selected: ' + selectedValue});
        }
    }
};