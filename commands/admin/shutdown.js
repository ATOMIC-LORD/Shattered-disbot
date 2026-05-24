const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { executeCommand } = require("../../utils/mcCommand");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shutdown")
    .setDescription("[OWNER] Shutdown the Minecraft server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((o) => o.setName("reason").setDescription("Shutdown reason").setRequired(true)),
  cooldown: 60,
  async execute(interaction) {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const issuer = await prisma.user.findUnique({ where: { discordId: interaction.user.id } });
    await prisma.$disconnect();

    if (!issuer || issuer.role !== "OWNER") {
      return interaction.reply({ content: "❌ Owner only.", ephemeral: true });
    }

    const reason = interaction.options.getString("reason");
    await interaction.reply({ content: `⚠️ Shutting down server: **${reason}**`, ephemeral: true });

    try {
      await executeCommand(`say Server shutting down: ${reason}`);
      setTimeout(async () => {
        await executeCommand("stop");
      }, 5000);
    } catch (err) {
      await interaction.followUp({ content: `❌ RCON failed: ${err.message}`, ephemeral: true });
    }
  },
};
