const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const color = require('../colors');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the bot'),
    async execute(interaction) {
        // Check if the user has admin rights
        // if (!interaction.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        //     return interaction.reply('You do not have permission to stop the bot.');
        // }

        await interaction.reply('Stopping the bot...');
        console.log(color.red('The stop bot command was executed'))
        process.exit();
    }
};
