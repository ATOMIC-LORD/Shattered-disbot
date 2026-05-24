// ============================================
// MESSAGE CREATE - XP / Level System
// ============================================
const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");

const prisma = new PrismaClient();
const xpCooldowns = new Map();
const XP_COOLDOWN_MS = 60000; // 1 minute between XP gains
const XP_PER_MESSAGE = 15;

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;
    if (message.guild.id !== process.env.DISCORD_GUILD_ID) return;

    const userId = message.author.id;
    const now = Date.now();

    // Check cooldown to prevent XP farming
    if (xpCooldowns.has(userId) && now - xpCooldowns.get(userId) < XP_COOLDOWN_MS) return;
    xpCooldowns.set(userId, now);

    try {
      const user = await prisma.user.findUnique({ where: { discordId: userId } });
      if (!user) return;

      const newXp = user.discordXp + XP_PER_MESSAGE;
      const newLevel = Math.floor(0.1 * Math.sqrt(newXp));

      await prisma.user.update({
        where: { discordId: userId },
        data: { discordXp: newXp, discordLevel: newLevel },
      });

      // Level-up announcement
      if (newLevel > user.discordLevel) {
        message.channel.send(`🎉 **${message.author.username}** leveled up to **Level ${newLevel}**!`).catch(() => {});
        logger.info(`Level up: ${message.author.username} → ${newLevel}`);
      }
    } catch (err) {
      logger.error(`XP error: ${err.message}`);
    }
  },
};
