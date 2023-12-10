#!/bin/bash

# Session name screen
SESSION_NAME="ticket_bot"

# Check if a session already exists
if screen -list | grep -q "\.${SESSION_NAME}"; then
    echo "Session '${SESSION_NAME}' already started Let's go to the session."
else
    echo "Create and launch a new session '${SESSION_NAME}'."
    # Create and launch a new screen session with the bot
    screen -dmS $SESSION_NAME bash -c 'while true; do node /var/discord/bots/tickets/src/bot.js; echo "Bot crashed, restart after 5 seconds..."; sleep 5; done'
fi

# Opening a session
screen -r $SESSION_NAME
