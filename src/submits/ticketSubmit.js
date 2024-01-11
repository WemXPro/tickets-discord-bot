const { PermissionsBitField, ChannelType, EmbedBuilder } = require('discord.js');
const Link = require("../models/link");
const axios = require("axios");

async function getDepartmentData(apiUrl, apiKey, selectedValue) {
    const response = await axios.get(apiUrl, {
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });
    return response.data.data.find(dept => dept.id === Number(selectedValue));
}

async function createCategory(guild, categoryName) {
    let category = guild.channels.cache.find(c => c.name === categoryName && c.type === ChannelType.GuildCategory);
    if (!category) {
        category = await guild.channels.create({name: categoryName, type: ChannelType.GuildCategory });
    }
    return category;
}

async function createTicket(guild, category, channelName, member, description) {
    let ticketChannel = guild.channels.cache.find(c => c.name === channelName && c.parentId === category.id);
    if (!ticketChannel) {
        ticketChannel = await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: category.id,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: member.id,
                    allow: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    id: guild.roles.cache.find(role => role.permissions.has(PermissionsBitField.Flags.Administrator)).id,
                    allow: [PermissionsBitField.Flags.ViewChannel],
                },
            ],
        });

        let embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Ticket for ${member.user.username}`)
            .setDescription(description)
            .setTimestamp();

        await ticketChannel.send({
            content: `${member.toString()}, your ticket has been created.`,
            embeds: [embed]
        });
    } else {
        await ticketChannel.send(`${member.toString()}, you already have an open ticket.`);
    }

    return ticketChannel;
}

function htmlToMarkdown(html) {
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?strong>/gi, '**')
        .replace(/<\/?em>/gi, '*')
        .replace(/<[^>]+>/g, '');
}

module.exports = {
    customId: 'select_ticket_type', // Submit id required in openTicketForm.js
    execute: async (interaction) => {
        const selectedValue = interaction.values[0];
        const guild = interaction.guild;
        const member = interaction.member;

        const Tenant = await Link.findOne({
            where: { discord_server_id: interaction.guild.id }
        });

        if (!Tenant) {
            await interaction.reply({ content: 'This server is not synchronized with any domain.', ephemeral: true });
            return;
        }

        const api_url_department = `${Tenant.protocol + Tenant.domain}/api/v1/tickets/departments`;

        try {
            const department = await getDepartmentData(api_url_department, Tenant.api_key, selectedValue);

            if (department) {
                const categoryName = "tickets-" + department.name;
                const category = await createCategory(guild, categoryName);
                const description = department.auto_response_template
                    ? htmlToMarkdown(department.auto_response_template)
                    : department.description;
                const ticketChannel = await createTicket(guild, category, `ticket-${member.user.username}`, member, description);

                await interaction.reply({ content: `Your ticket has been created: ${ticketChannel}`, ephemeral: true });
            } else {
                await interaction.reply({ content: "No department with this ID was found.", ephemeral: true });
            }
        } catch (error) {
            console.error('Error getting department:', error);
            await interaction.reply({ content: 'Error getting department.', ephemeral: true });
        }
    }
};
