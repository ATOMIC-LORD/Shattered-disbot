const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("vote").setDescription("Vote for the server and get rewards"),
  cooldown: 10,
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor("#22c55e")
      .setTitle("🗳️ Vote for LifeSteal SMP")
      .setDescription("Vote daily and earn exclusive in-game rewards!\n\n**Vote Rewards:**\n✅ XP Boosts\n✅ Extra hearts\n✅ Rare items")
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel("Vote on Planet Minecraft").setStyle(ButtonStyle.Link).setURL("https://planetminecraft.com").setEmoji("🗳️"),
      new ButtonBuilder().setLabel("Vote on Minecraft-Server.net").setStyle(ButtonStyle.Link).setURL("https://minecraft-server.net").setEmoji("🗳️")
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
