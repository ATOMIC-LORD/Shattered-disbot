const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("reloadbot")
    .setDescription("[OWNER] Reload the bot process")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  cooldown: 60,
  async execute(interaction) {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const issuer = await prisma.user.findUnique({ where: { discordId: interaction.user.id } });
    await prisma.$disconnect();

    if (!issuer || issuer.role !== "OWNER") {
      return interaction.reply({ content: "❌ Owner only.", ephemeral: true });
    }

    await interaction.reply({ content: "🔄 Reloading bot...", ephemeral: true });
    setTimeout(() => process.exit(0), 1000);
  },
};
