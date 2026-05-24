const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getServerStatus } = require("../../utils/api");

module.exports = {
  data: new SlashCommandBuilder().setName("server").setDescription("View current server status"),
  cooldown: 10,
  async execute(interaction) {
    await interaction.deferReply();
    try {
      const status = await getServerStatus();
      const online = status.online !== false;

      const embed = new EmbedBuilder()
        .setColor(status.maintenance ? "#f97316" : online ? "#22c55e" : "#ef4444")
        .setTitle("🖥️ Server Status")
        .addFields(
          { name: "Status", value: status.maintenance ? "🔧 Maintenance" : online ? "🟢 Online" : "🔴 Offline", inline: true },
          { name: "Players", value: online ? `${status.players || 0}/${status.maxPlayers || 0}` : "N/A", inline: true },
          { name: "IP", value: `\`${process.env.VITE_MC_IP || process.env.MC_SERVER_HOST || "play.shatteredlifesteal.net:25565"}\``, inline: true },
          { name: "MOTD", value: status.motd || "LifeSteal SMP", inline: false }
        )
        .setFooter({ text: "Join us today!" })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply("❌ Could not fetch server status.");
    }
  },
};
