const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("maintenance")
    .setDescription("[OWNER] Toggle maintenance mode")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addBooleanOption((o) => o.setName("enabled").setDescription("Enable or disable maintenance").setRequired(true))
    .addStringOption((o) => o.setName("message").setDescription("Maintenance message for players").setRequired(false)),
  cooldown: 10,
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const enabled = interaction.options.getBoolean("enabled");
    const message = interaction.options.getString("message") || "Server is undergoing maintenance. Back soon!";

    const embed = new EmbedBuilder()
      .setColor(enabled ? "#f97316" : "#22c55e")
      .setTitle(enabled ? "🔧 Maintenance Mode ENABLED" : "✅ Maintenance Mode DISABLED")
      .setDescription(enabled ? `**Message:** ${message}` : "Server is back online!")
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

    const channel = interaction.guild.channels.cache.get(process.env.DISCORD_CHANNEL_ANNOUNCEMENTS);
    if (channel) channel.send({ embeds: [embed] });
  },
};
