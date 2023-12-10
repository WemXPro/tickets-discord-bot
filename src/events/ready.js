const color = require('../colors');
module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(color.green(`Bot is online! Logged in as ${client.user.tag}`));
        client.user.setActivity('Tickets');
    },
};