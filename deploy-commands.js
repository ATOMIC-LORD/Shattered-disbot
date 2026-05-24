// ============================================
// DEPLOY SLASH COMMANDS TO DISCORD
// Run: node deploy-commands.js
// ============================================
require("dotenv").config({ path: "../.env" });

const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const commands = [];
const commandFolders = ["general", "clan", "admin"];

for (const folder of commandFolders) {
  const folderPath = path.join(__dirname, "commands", folder);
  if (!fs.existsSync(folderPath)) continue;
  const files = fs.readdirSync(folderPath).filter((f) => f.endsWith(".js"));
  for (const file of files) {
    const cmd = require(path.join(folderPath, file));
    if (cmd.data) commands.push(cmd.data.toJSON());
  }
}

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`Deploying ${commands.length} commands...`);
    await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
      { body: commands }
    );
    console.log("Commands deployed successfully.");
  } catch (err) {
    console.error(err);
  }
})();
