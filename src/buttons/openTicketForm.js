const {ActionRowBuilder, StringSelectMenuBuilder} = require('discord.js');
const axios = require('axios');
const Link = require('../models/link');
module.exports = {
    customId: 'create_ticket', // Button handler id
    async execute(interaction) {

        const Tenant = await Link.findOne({
            where: { discord_server_id: interaction.guild.id }
        });

        if (!Tenant) {
            await interaction.reply('This server is not syncronized with any domain.');
            return;
        }

        const api_url_department = `${Tenant.protocol + Tenant.domain}/api/v1/tickets/departments`;

        try {
            const response = await axios.get(api_url_department, {
                headers: {
                    'Authorization': `Bearer ${Tenant.api_key}`
                }
            });

            // Conversion of received data to drop-down list options
            const departmentOptions = response.data.data.map(department => {
                return {
                    label: String(department.name),
                    value: String(department.id)
                };
            });

            const row = new ActionRowBuilder()
                .addComponents(new StringSelectMenuBuilder()
                    .setCustomId('select_ticket_type')
                    .setPlaceholder('Select Ticket Department')
                    .addOptions(departmentOptions));

            const message = await interaction.reply({
                content: 'Choose your ticket department', components: [row], ephemeral: true
            });

            // Delete timer millisecond. 60000 - 1 min
            setTimeout(async () => {
                try {
                    await message.delete();
                } catch (error) {
                    console.error('Error deleting the message:', error);
                }
            }, 60000);



        } catch (error) {
            console.error('Error get department:', error);
            await interaction.reply('Error get department');
        }

    }
};
