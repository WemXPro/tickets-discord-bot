const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const Link = require('../models/link');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unsync')
        .setDescription('Unsync this discord server from tickets module')
        .setDefaultMemberPermissions(8),
        async execute(interaction) {
            try { 
                const discordSync = await Link.findOne({
                    where: { discord_server_id: interaction.guild.id }
                });
    
                if (discordSync) {
                    // delete the record from the database
                    await Link.destroy({
                        where: { discord_server_id: interaction.guild.id }
                    });
                    await interaction.reply('Discord server has been unsynced from domain ' + discordSync.domain + '.');
                    return;
                }

                await interaction.reply('This Discord server is not synced with any domain.');
            }
            catch (error) {
                console.log(error);
                await interaction.reply('Something went wrong. Please try again.');
            }
        }

};
