const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { PrismaClient } = require("@prisma/client");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("[ADMIN] Warn a player")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((o) => o.setName("user").setDescription("Discord user").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Warning reason").setRequired(true)),
  cooldown: 3,
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const prisma = new PrismaClient();
    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");

    try {
      const issuer = await prisma.user.findUnique({ where: { discordId: interaction.user.id } });
      const targetUser = await prisma.user.findUnique({ where: { discordId: target.id } });
      if (!issuer || !["ADMIN", "OWNER"].includes(issuer.role)) return interaction.editReply("❌ No permission.");
      if (!targetUser) return interaction.editReply("❌ Target not found.");

      await prisma.punishment.create({
        data: { targetId: targetUser.id, issuerId: issuer.id, type: "WARN", reason },
      });

      // DM the target
      await target.send(`⚠️ You have been warned in **${interaction.guild.name}**\nReason: **${reason}**`).catch(() => {});

      const embed = new EmbedBuilder().setColor("#f97316").setTitle("⚠️ Player Warned")
        .addFields({ name: "Player", value: target.tag, inline: true }, { name: "Reason", value: reason, inline: false })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply(`❌ Error: ${err.message}`);
    } finally {
      await prisma.$disconnect();
    }
  },
};
