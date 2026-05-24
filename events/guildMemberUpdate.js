// ============================================
// GUILD MEMBER UPDATE — Discord Role → Web Rank Sync
// When a Discord role changes, update the user's rank on the website
// ============================================
const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");
const { emitRankUpdated } = require("../utils/sync");

const prisma = new PrismaClient();

// Discord Role ID → Web Rank (highest priority first)
const getRankFromRoles = () => [
  { roleId: process.env.DISCORD_ROLE_MODERATOR, rank: "ADMIN" },
  { roleId: process.env.DISCORD_ROLE_VIP,       rank: "VIP"   },
  { roleId: process.env.DISCORD_ROLE_DONOR,     rank: "DONOR" },
  { roleId: process.env.DISCORD_ROLE_MEMBER,    rank: "MEMBER" },
];

module.exports = {
  name: "guildMemberUpdate",
  async execute(oldMember, newMember) {
    // Only process if roles actually changed
    const oldRoleIds = new Set(oldMember.roles.cache.keys());
    const newRoleIds = new Set(newMember.roles.cache.keys());

    const rolesChanged =
      [...oldRoleIds].some((id) => !newRoleIds.has(id)) ||
      [...newRoleIds].some((id) => !oldRoleIds.has(id));

    if (!rolesChanged) return;

    // Find the highest-priority rank role the member now has
    const mapping = getRankFromRoles();
    const matchedEntry = mapping.find((entry) => entry.roleId && newRoleIds.has(entry.roleId));

    if (!matchedEntry) return; // No tracked rank role — don't touch their web rank

    const newRank = matchedEntry.rank;
    const discordId = newMember.id;

    try {
      const user = await prisma.user.findUnique({ where: { discordId } });
      if (!user) return; // User hasn't linked their Discord yet

      if (user.role === newRank) return; // Already the correct rank, no update needed

      await prisma.user.update({
        where: { discordId },
        data: { role: newRank },
      });

      emitRankUpdated(discordId, newRank);
      logger.info(`Discord→Web rank sync: ${newMember.user.tag} → ${newRank}`);
    } catch (err) {
      logger.error(`Discord→Web rank sync error for ${discordId}: ${err.message}`);
    }
  },
};
