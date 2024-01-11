const fs = require('fs');
const path = require('path');

module.exports = (client, config) => {
    client.buttons = new Map();

    const buttonFiles = fs.readdirSync(path.join(__dirname, '../buttons')).filter(file => file.endsWith('.js'));

    for (const file of buttonFiles) {
        const button = require(`../buttons/${file}`);
        client.buttons.set(button.customId, button);
    }

    client.on('interactionCreate', async interaction => {
        if (!interaction.isButton()) return;

        const button = client.buttons.get(interaction.customId);
        if (!button) return;

        try {
            await button.execute(interaction);
        } catch (error) {
            console.error(error);
            // Tell the user about the error
        }
    });
};
