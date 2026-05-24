const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ids")
    .setDescription("[OWNER] List all role and channel IDs in this server")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  cooldown: 5,
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;

    const roles = guild.roles.cache
      .filter((r) => r.name !== "@everyone")
      .sort((a, b) => b.position - a.position)
      .map((r) => `**${r.name}** — \`${r.id}\``)
      .join("\n");

    const channels = guild.channels.cache
      .filter((c) => c.type === 0)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((c) => `**#${c.name}** — \`${c.id}\``)
      .join("\n");

    const roleEmbed = new EmbedBuilder()
      .setColor("#8b5cf6")
      .setTitle("🏷️ Server Role IDs")
      .setDescription(roles || "No roles found")
      .setFooter({ text: "Copy the ID next to the role you want" });

    const channelEmbed = new EmbedBuilder()
      .setColor("#3b82f6")
      .setTitle("📋 Text Channel IDs")
      .setDescription(channels || "No channels found")
      .setFooter({ text: "Copy the ID next to the channel you want" });

    await interaction.editReply({ embeds: [roleEmbed, channelEmbed] });
  },
};
