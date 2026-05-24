const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("help").setDescription("View all available commands"),
  cooldown: 5,
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor("#8b5cf6")
      .setTitle("⚔️ Shattered Lifesteal — Command Help")
      .setDescription("All available slash commands for the LifeSteal SMP")
      .addFields(
        {
          name: "📊 Player Commands",
          value: "`/profile` `/stats` `/hearts` `/kills` `/deaths` `/kd` `/playtime` `/rank` `/perks`",
          inline: false,
        },
        {
          name: "🏆 Server Commands",
          value: "`/topkills` `/topclans` `/server` `/leaderboard` `/web`",
          inline: false,
        },
        {
          name: "🛡️ Clan Commands",
          value: "`/clan create` `/clan invite` `/clan kick` `/clan leave` `/clan info` `/clan top`",
          inline: false,
        },
        {
          name: "🔗 Account Commands",
          value: "`/link` `/vote` `/store`",
          inline: false,
        },
        {
          name: "⚠️ Admin Commands",
          value: "*Only visible to staff members*",
          inline: false,
        }
      )
      .setFooter({ text: `${process.env.VITE_SITE_NAME || "Shattered SMP"} • /store to support us!` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
