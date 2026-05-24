const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rollback")
    .setDescription("[OWNER] Rollback a player's inventory/stats to a previous point")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((o) => o.setName("username").setDescription("Player username").setRequired(true))
    .addStringOption((o) => o.setName("type").setDescription("What to rollback").setRequired(true).addChoices(
      { name: "Inventory", value: "inventory" },
      { name: "Hearts", value: "hearts" },
      { name: "Stats", value: "stats" },
    )),
  cooldown: 30,
  async execute(interaction) {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();
    const issuer = await prisma.user.findUnique({ where: { discordId: interaction.user.id } });
    await prisma.$disconnect();

    if (!issuer || issuer.role !== "OWNER") {
      return interaction.reply({ content: "❌ Owner only.", ephemeral: true });
    }

    const username = interaction.options.getString("username");
    const type = interaction.options.getString("type");

    const embed = new EmbedBuilder()
      .setColor("#f97316")
      .setTitle("🔄 Rollback Initiated")
      .setDescription(`Rollback of **${type}** for **${username}** has been queued.\n\nThis requires the CoreProtect / Lifesteal plugin to execute.`)
      .addFields({ name: "Status", value: "⚠️ Queued — execute via RCON or plugin console", inline: false })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
