const {PermissionsBitField, ChannelType, EmbedBuilder} = require('discord.js');
const Link = require("../models/link");
const axios = require("axios");

module.exports = {
    customId: 'select_ticket_type',
    execute: async (interaction) => {
        const selectedValue = interaction.values[0];
        const guild = interaction.guild;
        const member = interaction.member;

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

            const department = response.data.data.find(dept => dept.id === Number(selectedValue));
            if (department) {
                const categoryName = "tickets-" + department.name;
                const channelName = `ticket-${member.user.username}`;

                // Checking the presence of a category
                let category = guild.channels.cache.find(c => c.name === categoryName && c.type === ChannelType.GuildCategory);
                if (!category) {
                    category = await guild.channels.create({
                            name: categoryName,
                            type: ChannelType.GuildCategory
                        }
                    );
                }

                // Checking the existence of a ticket
                let ticketChannel = guild.channels.cache.find(c => c.name === channelName && c.parentId === category.id);
                if (ticketChannel) {
                    // The ticket already exists, send a ping to this channel
                    ticketChannel.send(`${member.toString()}, you already have an open ticket.`);

                    await interaction.update({
                        components: [] // Remove all components
                    });
                } else {
                    const ticketChannel = await guild.channels.create({
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

                    const description = department.auto_response_template
                        ? htmlToMarkdown(department.auto_response_template)
                        : department.description;

                    let embed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle(department.name)
                        .setDescription(description)
                        .setTimestamp();

                    // Sending a message to the created channel and pinging the user
                    ticketChannel.send({
                        content: `${member.toString()}, your ticket has been created.`,
                        embeds: [embed]
                    });

                    await interaction.update({
                        components: [] // Remove all components
                    });
                }
            } else {
                console.error("No department with this ID was found.");
            }
        } catch (error) {
            console.error('Error get department:', error);
            await interaction.reply('Error get department');
        }



    }
};


function htmlToMarkdown(html) {
    return html
        .replace(/<br\s*\/?>/gi, '\n') // Replacing <br> with a new line
        .replace(/<\/?strong>/gi, '**') // Replace <strong> with bold text
        .replace(/<\/?em>/gi, '*') // Replace <em> with italics
        .replace(/<[^>]+>/g, ''); // Remove all other HTML tags
}