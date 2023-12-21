const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const color = require('../colors');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the bot')
        .setDefaultMemberPermissions(8),
    async execute(interaction) {
        await interaction.reply('Stopping the bot...');
        console.log(color.red('The stop bot command was executed'))
        process.exit();
    }
};
