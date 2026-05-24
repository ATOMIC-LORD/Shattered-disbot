const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getClans } = require("../../utils/api");

module.exports = {
  data: new SlashCommandBuilder().setName("topclans").setDescription("View the top clans by total kills"),
  cooldown: 10,
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const clans = await getClans();
      const medals = ["🥇", "🥈", "🥉"];

      const desc = clans
        .slice(0, 10)
        .map((c, i) => `${medals[i] || `**${i + 1}.**`} **[${c.tag}] ${c.name}** — ${c.totalKills} kills • ${c._count?.members || 0} members`)
        .join("\n");

      const embed = new EmbedBuilder()
        .setColor("#a855f7")
        .setTitle("🛡️ Top Clans — LifeSteal SMP")
        .setDescription(desc || "No clans yet")
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply("❌ Failed to fetch clans.");
    }
  },
};
