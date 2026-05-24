const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getTopKillers } = require("../../utils/api");

module.exports = {
  data: new SlashCommandBuilder().setName("topkills").setDescription("View the top 10 killers on the server"),
  cooldown: 10,
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const top = await getTopKillers();
      const medals = ["🥇", "🥈", "🥉"];

      const desc = top
        .slice(0, 10)
        .map((p, i) => `${medals[i] || `**${i + 1}.**`} **${p.mcUsername}** — ${p.kills} kills (${p.deaths} deaths)`)
        .join("\n");

      const embed = new EmbedBuilder()
        .setColor("#ef4444")
        .setTitle("⚔️ Top Killers — LifeSteal SMP")
        .setDescription(desc || "No data yet")
        .setFooter({ text: "Updated live from the server" })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply("❌ Failed to fetch leaderboard.");
    }
  },
};
