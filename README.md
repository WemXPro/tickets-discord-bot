# Tickets Module Discord bot

You can self host the ticket bot for branding purposes, to do so you are required to have knowledge of how discord bots work.

# Install

1. Upload the bot to your server
2. $ npm update
3. Copy ".env.example" to ".env" and set all the values
4. Run the bot using `sh run.sh` and make sure its starts successfully
5. In your tickets module edit file `Tickets/Jobs/TicketCreateWebhook.php`

Replace URL
```
 http://beta.wemx.net:3000/webhook
```
With
```
http://your-servers-ip:3000/webhook
```
