// bot.js by ivan deus
const util = require('util');
const originalLog = console.log;
const originalError = console.error;
// logging
console.log = function (message, ...args) {
    const timestamp = new Date().toLocaleString('en-GB', { timeZone: 'Europe/Moscow' });
    const formattedMessage = `[${timestamp}] ${util.format(message, ...args)}`;
    originalLog.apply(console, [formattedMessage]);
};

console.error = function (message, ...args) {
    const timestamp = new Date().toLocaleString('en-GB', { timeZone: 'Europe/Moscow' });
    const formattedMessage = `[${timestamp}] [ERROR] ${util.format(message, ...args)}`;
    originalError.apply(console, [formattedMessage]);
};
// bot module
const { Bot, InlineKeyboard } = require("grammy");
const { webhookCallback } = require("grammy");
const express = require("express");
const ngrok = require("@ngrok/ngrok");
const fs = require("fs");
const config = require("./config");
// User languages storage
const userLanguages = new Map();

// Load messages from JSON file
let ALL_MESSAGES;
function loadAllMessages() {
  try {
    const data = fs.readFileSync("messages.json", "utf-8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error("messages.json file not found! Using default messages.");
      return {
        en: {
          welcome: { text: "👋 Hello!" },
          default_response: { text: "Default" },
          language_prompt: { text: "Select language:" },
          language_changed: { text: "Language changed" },
          help: { text: "Commands:\n/start\n/language\n/help" },
        },
        es: {
          welcome: { text: "👋 ¡Hola!" },
          default_response: { text: "Mensaje." },
          language_prompt: { text: "Selecciona idioma:" },
          language_changed: { text: "Idioma cambiado" },
          help: { text: "Comandos:\n/start\n/language\n/help" },
        },
      };
    } else if (err instanceof SyntaxError) {
      console.error("Invalid JSON in messages.json! Using default messages.");
      return {
        en: {
          welcome: { text: "Hello!" },
          default_response: { text: " - " },
          language_prompt: { text: "Select language:" },
          language_changed: { text: "Eng" },
          help: { text: "\n/start\n/language\n/help" },
        },
        es: {
          welcome: { text: "👋" },
          default_response: { text: " - " },
          language_prompt: { text: "Selecciona idioma:" },
          language_changed: { text: "Esp" },
          help: { text: "\n/start\n/language\n/help" },
        },
      };
    } else {
      throw err;
    }
  }
}

// Load all messages
ALL_MESSAGES = loadAllMessages();

function getMessage(userId, messageKey) {
  // Default to English
  const language = userLanguages.get(userId) || "en";
  return ALL_MESSAGES[language]?.[messageKey]?.text || `Message not found: ${messageKey}`;
}

// Initialize bot
const bot = new Bot(config.BOT_TOKEN);

// Express app for webhook
const app = express();
app.use(express.json());

// ============= MESSAGE HANDLERS =============
// Handle /start
bot.command("start", async (ctx) => {
  const userId = ctx.from.id;
  const welcomeText = getMessage(userId, "welcome");
  await ctx.reply(welcomeText, { parse_mode: "Markdown" });
  console.log(`Start command from user ${userId}`);
});

// Handle /help
bot.command("help", async (ctx) => {
  const userId = ctx.from.id;
  const helpText = getMessage(userId, "help");
  await ctx.reply(helpText, { parse_mode: "Markdown" });
  console.log(`Help command from user ${userId}`);
});

// Handle /language
bot.command("language", async (ctx) => {
  const userId = ctx.from.id;
  const keyboard = new InlineKeyboard()
    .text("🇬🇧 English", "lang_en")
    .text("🇪🇸 Español", "lang_es");
  const promptText = getMessage(userId, "language_prompt");
  await ctx.reply(promptText, { reply_markup: keyboard });
});

// Handle callback queries
bot.callbackQuery(/^lang_/, async (ctx) => {
  const userId = ctx.from.id;
  const lang = ctx.callbackQuery.data.split("_")[1];
  userLanguages.set(userId, lang);
  await ctx.answerCallbackQuery();
  const confirmationText = getMessage(userId, "language_changed");
  await ctx.editMessageText(confirmationText);
  console.log(`User ${userId} changed language to ${lang}`);
});

// Default response for other text messages (after commands)
bot.on("message:text", async (ctx) => {
  const text = ctx.message.text.trim();
  if (!text.startsWith("/")) {
    const userId = ctx.from.id;
    const responseText = getMessage(userId, "default_response");
    await ctx.reply(responseText);
    console.log(`Message from user ${userId}: ${text}`);
  }
});

// Webhook middleware
app.use(config.WEBHOOK_PATH, webhookCallback(bot, "express"));

async function setupWebhook() {
  try {
    // Create ngrok tunnel
    const session = await ngrok.connect({
      addr: `${config.LOCAL_HOST}:${config.LOCAL_PORT}`,
      authtoken: config.NGROK_AUTH_TOKEN,
    });
    const publicUrl = session.url();
    const webhookUrl = `${publicUrl}${config.WEBHOOK_PATH}`;
    console.log(`Ngrok tunnel established: ${publicUrl}`);

    // Remove existing webhook and set new one
    await bot.api.deleteWebhook();
    // Short delay to ensure deletion
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await bot.api.setWebhook(webhookUrl);

    console.log("Webhook set successfully!");
    const webhookInfo = await bot.api.getWebhookInfo();
    console.log(`Webhook info: URL=${webhookInfo.url}, pending updates=${webhookInfo.pending_update_count}`);
    return true;
  } catch (err) {
    console.error(`❌ Error setting up webhook: ${err}`);
    return false;
  }
}

async function cleanup() {
  try {
    await bot.api.deleteWebhook();
    await ngrok.disconnect();
    console.log("Cleanup completed");
  } catch (err) {
    console.error(`Error during cleanup: ${err}`);
  }
}

// Handle shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down...");
  await cleanup();
  process.exit(0);
});

// Main execution
(async () => {
  if (await setupWebhook()) {
    app.listen(config.LOCAL_PORT, config.LOCAL_HOST, () => {
      console.log(`Starting server on ${config.LOCAL_HOST}:${config.LOCAL_PORT}`);
    });
  } else {
    console.error("Failed to setup webhook. Exiting.");
  }
})();
