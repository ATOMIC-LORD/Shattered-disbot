const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("broadcast")
    .setDescription("[ADMIN] Send a broadcast to the server and website")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((o) => o.setName("message").setDescription("Broadcast message").setRequired(true)),
  cooldown: 30,
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const message = interaction.options.getString("message");

    try {
      // Announce in Discord channel
      const channel = interaction.guild.channels.cache.get(process.env.DISCORD_CHANNEL_ANNOUNCEMENTS);
      if (channel) {
        const embed = new EmbedBuilder()
          .setColor("#3b82f6")
          .setTitle("📢 Server Announcement")
          .setDescription(message)
          .setFooter({ text: `Sent by ${interaction.user.tag}` })
          .setTimestamp();
        await channel.send({ embeds: [embed] });
      }

      await interaction.editReply("✅ Broadcast sent successfully!");
    } catch (err) {
      await interaction.editReply(`❌ Error: ${err.message}`);
    }
  },
};
