const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer } = require("../../utils/api");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("playtime")
    .setDescription("Check a player's playtime")
    .addStringOption((o) => o.setName("username").setDescription("Minecraft username").setRequired(true)),
  cooldown: 5,
  async execute(interaction) {
    await interaction.deferReply();
    const username = interaction.options.getString("username");
    try {
      const player = await getPlayer(username);
      const hours = Math.floor(player.playtimeMinutes / 60);
      const mins = player.playtimeMinutes % 60;

      const embed = new EmbedBuilder()
        .setColor("#3b82f6")
        .setTitle(`⏱️ Playtime — ${player.mcUsername}`)
        .setThumbnail(`https://mc-heads.net/avatar/${player.mcUuid}`)
        .addFields({ name: "Total Playtime", value: `**${hours}h ${mins}m**`, inline: true })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply("❌ Player not found.");
    }
  },
};
