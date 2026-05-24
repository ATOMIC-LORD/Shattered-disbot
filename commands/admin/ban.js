const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { PrismaClient } = require("@prisma/client");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("[ADMIN] Ban a player from the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((o) => o.setName("user").setDescription("Discord user").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Ban reason").setRequired(true))
    .addStringOption((o) => o.setName("evidence").setDescription("Evidence link or description").setRequired(false)),
  cooldown: 3,
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const prisma = new PrismaClient();

    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const evidence = interaction.options.getString("evidence") || null;

    try {
      const issuer = await prisma.user.findUnique({ where: { discordId: interaction.user.id } });
      const targetUser = await prisma.user.findUnique({ where: { discordId: target.id } });

      if (!issuer || !["ADMIN", "OWNER"].includes(issuer.role)) {
        return interaction.editReply("❌ You do not have permission to use this command.");
      }

      if (!targetUser) return interaction.editReply("❌ Target user not found in the system.");
      if (targetUser.role === "OWNER") return interaction.editReply("❌ You cannot ban an Owner.");

      await prisma.punishment.create({
        data: { targetId: targetUser.id, issuerId: issuer.id, type: "BAN", reason, evidence },
      });
      await prisma.user.update({ where: { id: targetUser.id }, data: { isBanned: true } });

      // Try to ban from Discord
      await interaction.guild.members.ban(target, { reason }).catch(() => {});

      const embed = new EmbedBuilder()
        .setColor("#ef4444")
        .setTitle("🔨 Player Banned")
        .addFields(
          { name: "Player", value: target.toString(), inline: true },
          { name: "Reason", value: reason, inline: false },
          { name: "Banned By", value: interaction.user.toString(), inline: true }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Log in punishment channel
      const logChannel = interaction.guild.channels.cache.get(process.env.DISCORD_CHANNEL_PUNISHMENTS);
      if (logChannel) logChannel.send({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply(`❌ Ban failed: ${err.message}`);
    } finally {
      await prisma.$disconnect();
    }
  },
};
