const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("perks").setDescription("View all rank perks and benefits"),
  cooldown: 5,
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor("#a855f7")
      .setTitle("✨ Rank Perks")
      .addFields(
        { name: "👤 Member (Free)", value: "• Basic server access\n• Standard commands", inline: false },
        { name: "💎 Donor ($5.99)", value: "• Colored nickname\n• 3 homes\n• Donor tag\n• Priority queue", inline: false },
        { name: "⭐ VIP ($14.99)", value: "• VIP tag\n• 5 homes\n• Cosmetics\n• Better queue priority\n• Exclusive effects", inline: false },
        { name: "🛡️ Admin (Staff)", value: "• Moderation tools\n• Staff dashboard\n• Console access", inline: false },
        { name: "👑 Owner (Staff)", value: "• Full server control\n• All permissions", inline: false }
      )
      .setFooter({ text: "Use /store to upgrade your rank!" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
