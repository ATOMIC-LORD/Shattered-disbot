const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer } = require("../../utils/api");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deaths")
    .setDescription("Check a player's death count")
    .addStringOption((o) => o.setName("username").setDescription("Minecraft username").setRequired(true)),
  cooldown: 3,
  async execute(interaction) {
    await interaction.deferReply();
    const username = interaction.options.getString("username");
    try {
      const player = await getPlayer(username);
      const embed = new EmbedBuilder()
        .setColor("#6b7280")
        .setTitle(`💀 Deaths — ${player.mcUsername}`)
        .setThumbnail(`https://mc-heads.net/avatar/${player.mcUuid}`)
        .addFields({ name: "Total Deaths", value: `**${player.deaths}**`, inline: true })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply("❌ Player not found.");
    }
  },
};
