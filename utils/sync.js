// ============================================
// DISCORD RANK SYNC via Socket.IO
// Listens for rank change events and updates Discord roles
// ============================================
const { io } = require("socket.io-client");
const logger = require("./logger");

const RANK_TO_ROLE = {
  MEMBER: process.env.DISCORD_ROLE_MEMBER,
  DONOR:  process.env.DISCORD_ROLE_DONOR,
  VIP:    process.env.DISCORD_ROLE_VIP,
  ADMIN:  process.env.DISCORD_ROLE_MODERATOR,
  OWNER:  process.env.DISCORD_ROLE_OWNER || process.env.DISCORD_ROLE_MODERATOR,
};

let _socket = null;

const emitRankUpdated = (discordId, newRank) => {
  if (_socket?.connected) {
    _socket.emit("rank:updated", { discordId, newRank });
  }
};

const setupRankSyncListener = (client) => {
  const serverUrl = process.env.API_URL || "http://localhost:3001";

  const socket = io(serverUrl, { reconnectionAttempts: 5 });
  _socket = socket;

  socket.on("connect", () => logger.info("Bot connected to API socket for rank sync"));
  socket.on("connect_error", (err) => logger.warn(`Socket connect error: ${err.message}`));

  // ---- Rank Sync ----
  socket.on("rank:sync", async ({ discordId, newRank }) => {
    try {
      const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
      if (!guild) return;

      const member = await guild.members.fetch(discordId).catch(() => null);
      if (!member) return;

      // Remove all rank roles, add new one
      const allRoleIds = Object.values(RANK_TO_ROLE).filter(Boolean);
      await member.roles.remove(allRoleIds).catch(() => {});

      const newRoleId = RANK_TO_ROLE[newRank];
      if (newRoleId) {
        await member.roles.add(newRoleId);
        logger.info(`Synced ${discordId} → ${newRank}`);
      }
    } catch (err) {
      logger.error(`Rank sync error: ${err.message}`);
    }
  });

  // ---- Kill Feed ----
  socket.on("kill:feed", async ({ killer, victim, weapon }) => {
    try {
      const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
      const channel = guild?.channels.cache.get(process.env.DISCORD_CHANNEL_KILLS);
      if (!channel) return;

      const { EmbedBuilder } = require("discord.js");
      const embed = new EmbedBuilder()
        .setColor("#ff4444")
        .setTitle("⚔️ Kill Feed")
        .setDescription(`**${killer}** slayed **${victim}**${weapon ? ` with **${weapon}**` : ""}`)
        .setTimestamp();

      channel.send({ embeds: [embed] });
    } catch (err) {
      logger.error(`Kill feed error: ${err.message}`);
    }
  });

  // ---- Death Feed ----
  socket.on("death:feed", async ({ victim, cause, killerName }) => {
    try {
      const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
      const channel = guild?.channels.cache.get(process.env.DISCORD_CHANNEL_DEATHS);
      if (!channel) return;

      const { EmbedBuilder } = require("discord.js");
      const embed = new EmbedBuilder()
        .setColor("#6b7280")
        .setTitle("💀 Death Log")
        .setDescription(`**${victim}** died: *${cause}*${killerName ? ` (killed by **${killerName}**)` : ""}`)
        .setTimestamp();

      channel.send({ embeds: [embed] });
    } catch (err) {
      logger.error(`Death feed error: ${err.message}`);
    }
  });

  // ---- Server Broadcast ----
  socket.on("server:broadcast", async ({ message }) => {
    try {
      const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
      const channel = guild?.channels.cache.get(process.env.DISCORD_CHANNEL_ANNOUNCEMENTS);
      if (!channel) return;

      const { EmbedBuilder } = require("discord.js");
      const embed = new EmbedBuilder()
        .setColor("#3b82f6")
        .setTitle("📢 Server Announcement")
        .setDescription(message)
        .setTimestamp();

      channel.send({ embeds: [embed] });
    } catch (err) {
      logger.error(`Broadcast error: ${err.message}`);
    }
  });
};

module.exports = { setupRankSyncListener, emitRankUpdated };
