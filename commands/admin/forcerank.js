const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { PrismaClient } = require("@prisma/client");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("forcerank")
    .setDescription("[OWNER] Force set a player's rank")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption((o) => o.setName("user").setDescription("Discord user").setRequired(true))
    .addStringOption((o) => o.setName("rank").setDescription("New rank").setRequired(true).addChoices(
      { name: "Member", value: "MEMBER" }, { name: "Donor", value: "DONOR" },
      { name: "VIP", value: "VIP" }, { name: "Admin", value: "ADMIN" }, { name: "Owner", value: "OWNER" }
    )),
  cooldown: 5,
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const prisma = new PrismaClient();
    const target = interaction.options.getUser("user");
    const rank = interaction.options.getString("rank");

    try {
      const issuer = await prisma.user.findUnique({ where: { discordId: interaction.user.id } });
      if (!issuer || issuer.role !== "OWNER") return interaction.editReply("❌ Owner only.");

      const targetUser = await prisma.user.findUnique({ where: { discordId: target.id } });
      if (!targetUser) return interaction.editReply("❌ User not found.");

      await prisma.user.update({ where: { id: targetUser.id }, data: { role: rank } });
      await prisma.staffLog.create({ data: { staffId: issuer.id, action: "FORCE_RANK", target: targetUser.id, details: { rank } } });

      const embed = new EmbedBuilder().setColor("#eab308").setTitle("👑 Rank Forced")
        .addFields({ name: "Player", value: target.tag, inline: true }, { name: "New Rank", value: rank, inline: true }).setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply(`❌ Error: ${err.message}`);
    } finally {
      await prisma.$disconnect();
    }
  },
};
