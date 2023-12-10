module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`Bot is online! Logged in as ${client.user.tag}`);
        client.user.setActivity('Tickets');
    },
};