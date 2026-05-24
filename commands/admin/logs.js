const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { PrismaClient } = require("@prisma/client");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("logs")
    .setDescription("[ADMIN] View recent staff action logs")
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog)
    .addIntegerOption((o) => o.setName("limit").setDescription("Number of logs to show (max 10)").setRequired(false)),
  cooldown: 10,
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const prisma = new PrismaClient();
    const limit = Math.min(interaction.options.getInteger("limit") || 5, 10);

    try {
      const logs = await prisma.staffLog.findMany({
        take: limit, orderBy: { createdAt: "desc" },
        include: { staff: { select: { username: true } } },
      });

      if (!logs.length) return interaction.editReply("No logs found.");

      const desc = logs.map((l) => `**${l.staff.username}** → \`${l.action}\`${l.target ? ` on \`${l.target}\`` : ""} — <t:${Math.floor(new Date(l.createdAt).getTime() / 1000)}:R>`).join("\n");

      const embed = new EmbedBuilder().setColor("#6b7280").setTitle("📋 Staff Logs").setDescription(desc).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply(`❌ Error: ${err.message}`);
    } finally {
      await prisma.$disconnect();
    }
  },
};
