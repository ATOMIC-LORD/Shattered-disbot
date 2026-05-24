const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("web").setDescription("Get the link to the Shattered SMP website"),
  cooldown: 5,
  async execute(interaction) {
    const siteUrl = process.env.SITE_URL || "https://shatteredofficial.com";
    const siteName = process.env.VITE_SITE_NAME || "Shattered SMP";
    const discordInvite = process.env.VITE_DISCORD_INVITE || null;
    const mcIp = process.env.VITE_MC_IP || null;

    const embed = new EmbedBuilder()
      .setColor("#8b5cf6")
      .setTitle(`🌐 ${siteName} — Website`)
      .setDescription(`Visit our website to manage your account, view leaderboards, check the store, and more!`)
      .addFields(
        { name: "🔗 Website", value: siteUrl, inline: false },
        ...(mcIp ? [{ name: "🎮 Server IP", value: `\`${mcIp}\``, inline: true }] : []),
        ...(discordInvite ? [{ name: "💬 Discord Invite", value: discordInvite, inline: true }] : [])
      )
      .setFooter({ text: `${siteName} • Use /store to upgrade your rank!` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel("Open Website").setStyle(ButtonStyle.Link).setURL(siteUrl).setEmoji("🌐"),
      new ButtonBuilder().setLabel("Leaderboards").setStyle(ButtonStyle.Link).setURL(`${siteUrl}/leaderboards`).setEmoji("🏆"),
      new ButtonBuilder().setLabel("Store").setStyle(ButtonStyle.Link).setURL(`${siteUrl}/store`).setEmoji("🛒"),
      ...(discordInvite ? [new ButtonBuilder().setLabel("Discord").setStyle(ButtonStyle.Link).setURL(discordInvite).setEmoji("💬")] : [])
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
