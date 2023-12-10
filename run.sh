#!/bin/bash

# Session name screen
SESSION_NAME="ticket_bot"

# Check if a session already exists
if screen -list | grep -q "\.${SESSION_NAME}"; then
    echo "Сесія '${SESSION_NAME}' вже запущена. Переходимо до сесії."
else
    echo "Створення та запуск нової сесії '${SESSION_NAME}'."
    # Create and launch a new screen session with the bot
    screen -dmS $SESSION_NAME bash -c 'while true; do node /var/discord/bots/tickets/src/bot.js; echo "Bot crashed, restart after 5 seconds..."; sleep 5; done'
fi

# Opening a session
screen -r $SESSION_NAME
