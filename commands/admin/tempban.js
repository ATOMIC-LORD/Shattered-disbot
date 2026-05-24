const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { PrismaClient } = require("@prisma/client");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tempban")
    .setDescription("[ADMIN] Temporarily ban a player")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((o) => o.setName("user").setDescription("Discord user").setRequired(true))
    .addIntegerOption((o) => o.setName("days").setDescription("Duration in days").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Ban reason").setRequired(true)),
  cooldown: 3,
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const prisma = new PrismaClient();
    const target = interaction.options.getUser("user");
    const days = interaction.options.getInteger("days");
    const reason = interaction.options.getString("reason");

    try {
      const issuer = await prisma.user.findUnique({ where: { discordId: interaction.user.id } });
      if (!issuer || !["ADMIN", "OWNER"].includes(issuer.role)) return interaction.editReply("❌ No permission.");

      const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      const targetUser = await prisma.user.findUnique({ where: { discordId: target.id } });

      if (targetUser) {
        await prisma.punishment.create({
          data: { targetId: targetUser.id, issuerId: issuer.id, type: "TEMPBAN", reason, expiresAt },
        });
      }

      await interaction.guild.members.ban(target, { reason }).catch(() => {});

      const embed = new EmbedBuilder().setColor("#ef4444").setTitle("⏱️ Player Temp-Banned")
        .addFields(
          { name: "Player", value: target.tag, inline: true },
          { name: "Duration", value: `${days} day(s)`, inline: true },
          { name: "Expires", value: expiresAt.toLocaleDateString(), inline: true },
          { name: "Reason", value: reason }
        ).setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply(`❌ Error: ${err.message}`);
    } finally {
      await prisma.$disconnect();
    }
  },
};
