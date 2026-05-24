const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("store").setDescription("View available rank packages in the store"),
  cooldown: 10,
  async execute(interaction) {
    const siteUrl = process.env.SITE_URL || "https://shatteredofficial.com";

    const embed = new EmbedBuilder()
      .setColor("#a855f7")
      .setTitle("🛒 LifeSteal Store")
      .setDescription("Upgrade your rank and unlock exclusive perks!")
      .addFields(
        {
          name: "💎 Donor — $5.99",
          value: "Colored nickname • 3 homes • Donor tag • Priority queue",
          inline: false,
        },
        {
          name: "⭐ VIP — $14.99",
          value: "VIP tag • 5 homes • Cosmetics • Better queue priority • Exclusive effects",
          inline: false,
        }
      )
      .setFooter({ text: "Purchases are permanent and sync instantly across Discord + Minecraft!" })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel("Visit Store").setStyle(ButtonStyle.Link).setURL(`${siteUrl}/store`).setEmoji("🛒"),
      new ButtonBuilder().setLabel("View Perks").setStyle(ButtonStyle.Link).setURL(`${siteUrl}/store#perks`).setEmoji("⭐")
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
