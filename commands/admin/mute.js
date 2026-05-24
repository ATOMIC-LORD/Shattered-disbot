const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { PrismaClient } = require("@prisma/client");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("[ADMIN] Mute a player for a duration")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName("user").setDescription("Discord user").setRequired(true))
    .addIntegerOption((o) => o.setName("duration").setDescription("Duration in minutes").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Mute reason").setRequired(true)),
  cooldown: 3,
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const prisma = new PrismaClient();
    const target = interaction.options.getUser("user");
    const duration = interaction.options.getInteger("duration");
    const reason = interaction.options.getString("reason");

    try {
      const issuer = await prisma.user.findUnique({ where: { discordId: interaction.user.id } });
      if (!issuer || !["ADMIN", "OWNER"].includes(issuer.role)) return interaction.editReply("❌ No permission.");

      const member = await interaction.guild.members.fetch(target.id).catch(() => null);
      if (member) {
        await member.timeout(duration * 60 * 1000, reason);
      }

      const targetUser = await prisma.user.findUnique({ where: { discordId: target.id } });
      if (targetUser) {
        const expiresAt = new Date(Date.now() + duration * 60 * 1000);
        await prisma.punishment.create({
          data: { targetId: targetUser.id, issuerId: issuer.id, type: "TEMPMUTE", reason, expiresAt },
        });
      }

      const embed = new EmbedBuilder().setColor("#6b7280").setTitle("🔇 Player Muted")
        .addFields(
          { name: "Player", value: target.tag, inline: true },
          { name: "Duration", value: `${duration} minutes`, inline: true },
          { name: "Reason", value: reason, inline: false }
        ).setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply(`❌ Error: ${err.message}`);
    } finally {
      await prisma.$disconnect();
    }
  },
};
