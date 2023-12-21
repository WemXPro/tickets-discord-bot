const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const Link = require('../models/link');
const validator = require('validator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sync')
        .setDescription('Sync tickets with WemX')
        .setDefaultMemberPermissions(8)
        .addStringOption(option =>
            option.setName('domain')
                .setDescription('The domain to sync with')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('apikey')
                .setDescription('Your API key')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('no_ssl')
                .setDescription('Use HTTP instead of HTTPS')
                .setRequired(false)),
        async execute(interaction) {
            const domain = interaction.options.getString('domain');
            const useHttp = interaction.options.getBoolean('no_ssl');
            const protocol = useHttp ? "http://" : "https://";
            const URL = protocol + domain + "/api/v1/tickets/sync";
            const apiKey = interaction.options.getString('apikey');

            // check if the domain is valid
            if (!validator.isFQDN(domain)) {
                await interaction.reply('Please enter a valid domain. Example: example.com');
                return;
            }

            // check if discord id already exists in database
            const discordSync = await Link.findOne({
                where: { discord_server_id: interaction.guild.id }
            });

            if (discordSync) {
                await interaction.reply('This Discord server is already synced with domain ' + discordSync.domain + '. Please unsync this server first using "/unsync" before syncing with a new domain.');
                return;
            }

            const domainSync = await Link.findOne({
                where: { domain: domain }
            });

            if (domainSync) {
                await interaction.reply(domainSync.domain + ' is already synced to another discord server. Please unsync the domain first using "/unsync" on the other server before syncing with a new domain.');
                return;
            }
    
            try {
                const response = await axios.get(URL, {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`
                    }
                });
    
                if (response.status === 200) {
                    // Check if the response has 'discord_server' and if it matches the current server ID
                    if (response.data.discord_server && response.data.discord_server === interaction.guild.id) {
                        const link = await Link.create({
                            protocol: protocol,
                            domain: domain,
                            api_key: apiKey,
                            discord_server_id: interaction.guild.id
                        });

                        await interaction.reply('Ticket synced successfully with the current Discord server.');
                    } else {
                        await interaction.reply('The Discord Server ID does not match the ID of this server. In the ticket settings, please set the Discord Server ID to ' + interaction.guild.id + ' and try again.');
                    }
                } else {
                    await interaction.reply(`Failed to sync tickets. Status Code: ${response.status}`);
                }
            } catch (error) {
                await interaction.reply(`Failed to sync tickets with domain ${domain}. Please ensure the domain is of format "example.com" and that the API key is correct.` + error);
            }
        }

};
