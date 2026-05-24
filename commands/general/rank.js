const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder().setName("rank").setDescription("View your current rank and perks"),
  cooldown: 5,
  async execute(interaction) {
    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    try {
      const user = await prisma.user.findUnique({ where: { discordId: interaction.user.id } });
      if (!user) {
        return interaction.reply({ content: "❌ You are not registered. Visit the website to sign up.", ephemeral: true });
      }

      const rankColors = { MEMBER: "#9ca3af", DONOR: "#f97316", VIP: "#a855f7", ADMIN: "#ef4444", OWNER: "#eab308" };
      const rankEmojis = { MEMBER: "👤", DONOR: "💎", VIP: "⭐", ADMIN: "🛡️", OWNER: "👑" };
      const rankPerks = {
        MEMBER: ["Basic access", "Standard commands"],
        DONOR: ["Colored nickname", "3 homes", "Donor tag", "Priority queue"],
        VIP: ["VIP tag", "5 homes", "Cosmetics", "Better queue priority", "Exclusive effects"],
        ADMIN: ["Moderation access", "Staff dashboard", "Console access"],
        OWNER: ["Full control", "Developer access", "All permissions"],
      };

      const embed = new EmbedBuilder()
        .setColor(rankColors[user.role] || "#9ca3af")
        .setTitle(`${rankEmojis[user.role]} Rank — ${user.username}`)
        .addFields(
          { name: "Current Rank", value: `**${user.role}**`, inline: true },
          { name: "Discord Level", value: `**${user.discordLevel}**`, inline: true },
          { name: "Perks", value: rankPerks[user.role]?.map((p) => `✅ ${p}`).join("\n") || "None", inline: false }
        )
        .setThumbnail(user.avatarUrl || null)
        .setFooter({ text: "Upgrade your rank at /store" })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch {
      await interaction.reply({ content: "❌ Failed to fetch rank.", ephemeral: true });
    } finally {
      await prisma.$disconnect();
    }
  },
};
