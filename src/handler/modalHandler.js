const fs = require('fs');
const path = require('path');

module.exports = (client, config) => {
    client.modals = new Map();

    const modalFiles = fs.readdirSync(path.join(__dirname, '../submits')).filter(file => file.endsWith('.js'));

    for (const file of modalFiles) {
        const modal = require(`../submits/${file}`);
        client.modals.set(modal.customId, modal);
    }

    client.on('interactionCreate', async interaction => {
        // Modal and dropdown dispatch processing
        if (interaction.isModalSubmit() || interaction.isStringSelectMenu()) {
            const modal = client.modals.get(interaction.customId);
            if (!modal) return;

            try {
                await modal.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'There was an error while submitting the modal!', ephemeral: true });
            }
        }
    });
};