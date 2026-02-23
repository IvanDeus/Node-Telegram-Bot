# Node-Telegram-Bot
Simple Telegram Bot With Ngrok Webhook Setup
# JavaScript Telegram Bot with Webhook and Ngrok

A simple Telegram bot with multilanguage support that uses webhooks, with ngrok for local development and testing. The bot responds to `/start` and `/help` commands and provides a default response for all other messages.

## Features

- Webhook-based Telegram bot using express
- Ngrok integration for exposing local server to the internet
- Separate configuration file for easy setup
- Clean shutdown and resource cleanup
- Comprehensive logging

## Prerequisites

- Node.js 24 or higher
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- Ngrok account (free tier works fine) and auth token

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/IvanDeus/Node-Telegram-Bot.git
cd Node-Telegram-Bot
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up configuration**

Copy the example config file:
```bash
cp config.js.example config.js
```

Edit `config.js` and add your tokens:
```
# Telegram Bot Token (get from @BotFather)
BOT_TOKEN = "your_telegram_bot_token_here"

# Ngrok Auth Token (get from https://dashboard.ngrok.com/auth)
NGROK_AUTH_TOKEN = "your_ngrok_auth_token_here"

# Local server configuration (default values work fine)
LOCAL_HOST = "0.0.0.0"
LOCAL_PORT = 7777
WEBHOOK_PATH = "/webhook"
```

## 📡 Usage

1. **Run the bot**
```bash
node bot.js
```

2. **Expected output**
```
[23/02/2026, 16:45:43] Ngrok tunnel established: https://xxxxxxxxx-xxx.ngrok-free.app
[23/02/2026, 16:45:45] Webhook set successfully!
[23/02/2026, 16:45:45] Webhook info: URL=https://xxxxxxxxxx-xxx.ngrok-free.app/webhook, pending updates=0
[23/02/2026, 16:45:45] Starting server on 127.0.0.1:7777
[23/02/2026, 16:46:36] Start command from user 5555555555
```

3. **Test your bot**
- Open Telegram and find your bot
- Send `/start` and `/help` commands
- Send any other message
- The bot should respond accordingly

## 📁 Project Structure

```
Node-Telegram-Bot/
├── bot.js                 # Main bot application
├── config.js              # Configuration file (create from example)
├── config.js.example      # Example configuration template
├── messages.json          # All bot messages in several languages 
├── package.json           # Dependencies
├── README.md              # This file
└── .gitignore            # Git ignore rules
```

## 🔧 How It Works

1. **Express Server**: Runs locally on port 7777, handling webhook requests at `/webhook`
2. **Ngrok Tunnel**: Creates a secure public URL that forwards to your local server
3. **Telegram Webhook**: Configures Telegram to send updates to your ngrok URL
4. **Message Handlers**:
   - `/start` command: Returns a welcome message
   - All other messages: Returns a simple default response

## 🧹 Cleanup

The bot automatically:
- Removes the webhook on shutdown
- Kills ngrok processes
- Performs proper resource cleanup

## ⚠️ Important Notes

- The ngrok URL changes each time you restart the bot (free tier)
- Keep the script running to maintain the webhook
- The bot will stop responding if you close the terminal
- For production, consider using a VPS instead of ngrok

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 
2026 [ ivan deus ]
