const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer } = require("../../utils/api");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kd")
    .setDescription("Check a player's K/D ratio")
    .addStringOption((o) => o.setName("username").setDescription("Minecraft username").setRequired(true)),
  cooldown: 3,
  async execute(interaction) {
    await interaction.deferReply();
    const username = interaction.options.getString("username");
    try {
      const player = await getPlayer(username);
      const kd = player.deaths === 0 ? player.kills : (player.kills / player.deaths).toFixed(2);
      const embed = new EmbedBuilder()
        .setColor("#3b82f6")
        .setTitle(`📈 K/D — ${player.mcUsername}`)
        .setThumbnail(`https://mc-heads.net/avatar/${player.mcUuid}`)
        .addFields(
          { name: "⚔️ Kills", value: `${player.kills}`, inline: true },
          { name: "💀 Deaths", value: `${player.deaths}`, inline: true },
          { name: "📊 K/D", value: `**${kd}**`, inline: true }
        )
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply("❌ Player not found.");
    }
  },
};
