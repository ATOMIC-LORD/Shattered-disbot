const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { PrismaClient } = require("@prisma/client");
const axios = require("axios");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View your linked profile and stats")
    .addUserOption((o) => o.setName("user").setDescription("Discord user").setRequired(false)),
  cooldown: 5,
  async execute(interaction) {
    await interaction.deferReply();
    const prisma = new PrismaClient();
    const target = interaction.options.getUser("user") || interaction.user;
    const siteUrl = process.env.SITE_URL || "https://shatteredofficial.com";

    try {
      const user = await prisma.user.findUnique({
        where: { discordId: target.id },
        include: {
          minecraftAccounts: { where: { isPrimary: true }, take: 1 },
          clanMembership: { include: { clan: { select: { name: true, tag: true } } } },
        },
      });

      if (!user) {
        const embed = new EmbedBuilder()
          .setColor("#ef4444")
          .setTitle("❌ Not Registered")
          .setDescription(`**${target.username}** doesn't have a website account yet.\n\nCreate one at the website to start tracking stats!`)
          .setThumbnail(target.displayAvatarURL({ size: 128 }))
          .setFooter({ text: "Register → Link Discord → Link Minecraft" });
        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setLabel("Register Now").setStyle(ButtonStyle.Link).setURL(`${siteUrl}/register`).setEmoji("📝")
        );
        return interaction.editReply({ embeds: [embed], components: [row] });
      }

      const rankColors  = { MEMBER: "#9ca3af", DONOR: "#f97316", VIP: "#a855f7", ADMIN: "#ef4444", OWNER: "#eab308" };
      const rankEmojis  = { MEMBER: "👤", DONOR: "💎", VIP: "⭐", ADMIN: "🛡️", OWNER: "👑" };
      const mc = user.minecraftAccounts?.[0] || null;

      // Pull Mojang skin for avatar if MC is linked
      let avatarUrl = user.avatarUrl || target.displayAvatarURL({ size: 128 });
      let skinUrl   = null;
      if (mc?.mcUuid) {
        skinUrl   = `https://mc-heads.net/avatar/${mc.mcUuid}/64`;
        avatarUrl = skinUrl;
      }

      // K/D ratio
      const kd = mc && mc.deaths > 0 ? (mc.kills / mc.deaths).toFixed(2) : mc?.kills ?? "—";

      // Subscription expiry line
      let expiryText = null;
      if (["DONOR", "VIP"].includes(user.role) && user.rankExpiresAt) {
        const expires   = new Date(user.rankExpiresAt);
        const daysLeft  = Math.ceil((expires - Date.now()) / (1000 * 60 * 60 * 24));
        const dateStr   = expires.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        expiryText = daysLeft > 0
          ? `Expires **${dateStr}** (${daysLeft}d left)`
          : `⚠️ Expired on **${dateStr}**`;
      }

      const embed = new EmbedBuilder()
        .setColor(rankColors[user.role] || "#8b5cf6")
        .setTitle(`${rankEmojis[user.role] || "👤"} ${user.username}'s Profile`)
        .setThumbnail(avatarUrl)
        .addFields(
          { name: "🏷️ Rank",         value: expiryText ? `${user.role}\n${expiryText}` : user.role, inline: true },
          { name: "🎮 Platform",      value: user.platform,                                           inline: true },
          { name: "🏰 Clan",          value: user.clanMembership?.clan
              ? `[${user.clanMembership.clan.tag}] ${user.clanMembership.clan.name}`
              : "No clan",                                                                             inline: true },
        );

      if (mc) {
        embed.addFields(
          { name: "⛏️ Minecraft",    value: mc.mcUsername,                                                     inline: true },
          { name: "❤️ Hearts",        value: `${mc.hearts} / ${mc.maxHearts}`,                                   inline: true },
          { name: "⚔️ Kills",         value: `${mc.kills}`,                                                      inline: true },
          { name: "💀 Deaths",        value: `${mc.deaths}`,                                                     inline: true },
          { name: "📈 K/D",           value: `${kd}`,                                                            inline: true },
          { name: "⏱️ Playtime",      value: `${Math.floor((mc.playtimeMinutes || 0) / 60)}h ${(mc.playtimeMinutes || 0) % 60}m`, inline: true },
        );
      } else {
        embed.addFields({
          name: "⛏️ Minecraft",
          value: `Not linked — use \`/link\` or visit the [dashboard](${siteUrl}/dashboard)`,
          inline: false,
        });
      }

      embed
        .setFooter({ text: `Member since ${new Date(user.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}` })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel("View Dashboard").setStyle(ButtonStyle.Link).setURL(`${siteUrl}/dashboard`).setEmoji("🌐"),
        ...(mc ? [new ButtonBuilder().setLabel("Full Stats").setStyle(ButtonStyle.Link).setURL(`${siteUrl}/leaderboards`).setEmoji("📊")] : [
          new ButtonBuilder().setLabel("Link Minecraft").setStyle(ButtonStyle.Link).setURL(`${siteUrl}/dashboard`).setEmoji("⛏️"),
        ])
      );

      await interaction.editReply({ embeds: [embed], components: [row] });
    } catch (err) {
      await interaction.editReply("❌ Failed to fetch profile. Please try again.");
    } finally {
      await prisma.$disconnect();
    }
  },
};
