const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer } = require("../../utils/api");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hearts")
    .setDescription("Check how many hearts a player has")
    .addStringOption((o) => o.setName("username").setDescription("Minecraft username").setRequired(true)),
  cooldown: 3,
  async execute(interaction) {
    await interaction.deferReply();
    const username = interaction.options.getString("username");

    try {
      const player = await getPlayer(username);
      const heartBar = "❤️".repeat(player.hearts) + "🖤".repeat(Math.max(0, player.maxHearts - player.hearts));

      const embed = new EmbedBuilder()
        .setColor(player.hearts <= 3 ? "#ef4444" : player.hearts <= 7 ? "#f97316" : "#22c55e")
        .setTitle(`❤️ Hearts — ${player.mcUsername}`)
        .setThumbnail(`https://mc-heads.net/avatar/${player.mcUuid}`)
        .setDescription(heartBar)
        .addFields({ name: "Hearts", value: `**${player.hearts}** / ${player.maxHearts}`, inline: true })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply("❌ Player not found.");
    }
  },
};
