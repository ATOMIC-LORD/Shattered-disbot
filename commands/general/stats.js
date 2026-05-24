const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer } = require("../../utils/api");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View a player's Minecraft stats")
    .addStringOption((o) => o.setName("username").setDescription("Minecraft username").setRequired(false)),
  cooldown: 5,
  async execute(interaction) {
    await interaction.deferReply();
    const username = interaction.options.getString("username") || null;

    if (!username) {
      return interaction.editReply("❌ Please provide a username: `/stats username:<name>`");
    }

    try {
      const player = await getPlayer(username);
      const kd = player.deaths === 0 ? player.kills : (player.kills / player.deaths).toFixed(2);

      const embed = new EmbedBuilder()
        .setColor("#8b5cf6")
        .setTitle(`📊 Stats — ${player.mcUsername}`)
        .setThumbnail(`https://mc-heads.net/avatar/${player.mcUuid}`)
        .addFields(
          { name: "❤️ Hearts", value: `${player.hearts}/${player.maxHearts}`, inline: true },
          { name: "⚔️ Kills", value: `${player.kills}`, inline: true },
          { name: "💀 Deaths", value: `${player.deaths}`, inline: true },
          { name: "📈 K/D Ratio", value: `${kd}`, inline: true },
          { name: "⏱️ Playtime", value: `${Math.floor(player.playtimeMinutes / 60)}h ${player.playtimeMinutes % 60}m`, inline: true },
          { name: "🎮 Platform", value: player.platform, inline: true },
        )
        .setFooter({ text: `Last seen: ${player.lastSeen ? new Date(player.lastSeen).toLocaleDateString() : "Never"}` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply("❌ Player not found or not linked.");
    }
  },
};
