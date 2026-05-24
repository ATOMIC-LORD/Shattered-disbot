// ============================================
// LIFESTEAL DISCORD BOT - Main Entry
// ============================================
require("dotenv").config({ path: "../.env" });

const { Client, GatewayIntentBits, Collection, ActivityType } = require("discord.js");
const fs = require("fs");
const path = require("path");
const logger = require("./utils/logger");
const { setupRankSyncListener } = require("./utils/sync");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
  ],
});

// ---- COMMAND COLLECTION ----
client.commands = new Collection();
client.cooldowns = new Collection();

// Load all command folders
const commandFolders = ["general", "clan", "admin"];
for (const folder of commandFolders) {
  const folderPath = path.join(__dirname, "commands", folder);
  if (!fs.existsSync(folderPath)) continue;

  const commandFiles = fs.readdirSync(folderPath).filter((f) => f.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));
    if (command.data && command.execute) {
      client.commands.set(command.data.name, command);
      logger.info(`Loaded command: ${command.data.name}`);
    }
  }
}

// ---- LOAD EVENTS ----
const eventFiles = fs.readdirSync(path.join(__dirname, "events")).filter((f) => f.endsWith(".js"));
for (const file of eventFiles) {
  const event = require(path.join(__dirname, "events", file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// ---- RANK SYNC (Socket.IO listener) ----
setupRankSyncListener(client);

// ---- LOGIN ----
client.login(process.env.DISCORD_TOKEN).catch((err) => {
  logger.error(`Failed to login: ${err.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (err) => logger.error(`Unhandled rejection: ${err}`));
