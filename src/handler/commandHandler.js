const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const color = require('../colors');

module.exports = (client) => {
    client.commands = new Map();

    const rest = new REST({ version: '9' }).setToken(config.botToken);
    const commands = [];
    const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`../commands/${file}`);
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
    }

    client.once('ready', async () => {
        try {
            console.log(color.yellow('Started refreshing application (/) commands.'));
            await rest.put(
                Routes.applicationGuildCommands(client.user.id, client.guilds.cache.first().id),
                { body: commands },
            );
            console.log(color.green('Successfully reloaded application (/) commands.'));
        } catch (error) {
            console.error(error);
        }
    });

    client.on('interactionCreate', async interaction => {
        if (!interaction.isCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    });
};
