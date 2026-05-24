// ============================================
// CLAN COMMAND - All clan subcommands
// ============================================
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const axios = require("axios");

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Helper: get JWT token for a Discord user via API
const getUserToken = async (discordId) => {
  // In production this would use a bot service account token
  return process.env.BOT_SERVICE_TOKEN || "placeholder_service_token";
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clan")
    .setDescription("Clan management commands")
    .addSubcommand((s) =>
      s.setName("create").setDescription("Create a new clan (requires Level 100)")
        .addStringOption((o) => o.setName("name").setDescription("Clan name").setRequired(true))
        .addStringOption((o) => o.setName("tag").setDescription("Clan tag (2-5 chars)").setRequired(true))
        .addStringOption((o) => o.setName("description").setDescription("Clan description").setRequired(false))
    )
    .addSubcommand((s) =>
      s.setName("info").setDescription("View a clan's info")
        .addStringOption((o) => o.setName("name").setDescription("Clan name").setRequired(true))
    )
    .addSubcommand((s) =>
      s.setName("invite").setDescription("Invite a player to your clan")
        .addUserOption((o) => o.setName("user").setDescription("Discord user to invite").setRequired(true))
    )
    .addSubcommand((s) =>
      s.setName("kick").setDescription("Kick a member from your clan")
        .addUserOption((o) => o.setName("user").setDescription("Member to kick").setRequired(true))
    )
    .addSubcommand((s) => s.setName("leave").setDescription("Leave your current clan"))
    .addSubcommand((s) => s.setName("top").setDescription("View top clans by kills")),
  cooldown: 5,

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    await interaction.deferReply();

    const { PrismaClient } = require("@prisma/client");
    const prisma = new PrismaClient();

    try {
      if (sub === "create") {
        const name = interaction.options.getString("name");
        const tag = interaction.options.getString("tag");
        const description = interaction.options.getString("description") || "";

        const user = await prisma.user.findUnique({ where: { discordId: interaction.user.id } });
        if (!user) return interaction.editReply("❌ You must register on the website first.");

        if (user.discordLevel < (parseInt(process.env.CLAN_CREATE_REQUIRED_LEVEL) || 100)) {
          return interaction.editReply(`❌ You need **Level ${process.env.CLAN_CREATE_REQUIRED_LEVEL || 100}** to create a clan.\nYour level: **${user.discordLevel}**\n\nEarn XP by chatting in the server!`);
        }

        const existingMembership = await prisma.clanMember.findUnique({ where: { userId: user.id } });
        if (existingMembership) return interaction.editReply("❌ You are already in a clan.");

        try {
          const clan = await prisma.clan.create({
            data: {
              name, tag: tag.toUpperCase(), description, leaderId: user.id,
              members: { create: { userId: user.id, role: "LEADER" } },
            },
          });
          const embed = new EmbedBuilder()
            .setColor("#22c55e")
            .setTitle("✅ Clan Created!")
            .setDescription(`**[${clan.tag}] ${clan.name}** has been created!\n\n${description}`)
            .addFields(
              { name: "Leader", value: interaction.user.toString(), inline: true },
              { name: "Level Requirement Met", value: `✅ Level ${user.discordLevel}`, inline: true }
            )
            .setTimestamp();
          return interaction.editReply({ embeds: [embed] });
        } catch (err) {
          if (err.code === "P2002") return interaction.editReply("❌ Clan name or tag already taken.");
          throw err;
        }
      }

      if (sub === "info") {
        const name = interaction.options.getString("name");
        const clan = await prisma.clan.findFirst({
          where: { name: { equals: name, mode: "insensitive" } },
          include: {
            leader: { select: { username: true, discordId: true } },
            _count: { select: { members: true } },
          },
        });
        if (!clan) return interaction.editReply("❌ Clan not found.");

        const embed = new EmbedBuilder()
          .setColor("#a855f7")
          .setTitle(`🛡️ [${clan.tag}] ${clan.name}`)
          .setDescription(clan.description || "No description")
          .addFields(
            { name: "Leader", value: clan.leader.username, inline: true },
            { name: "Members", value: `${clan._count.members}/${process.env.CLAN_MAX_MEMBERS || 20}`, inline: true },
            { name: "Total Kills", value: `${clan.totalKills}`, inline: true },
            { name: "Level", value: `${clan.level}`, inline: true },
          )
          .setTimestamp();
        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === "top") {
        const clans = await prisma.clan.findMany({
          take: 10, orderBy: { totalKills: "desc" },
          include: { _count: { select: { members: true } } },
        });
        const medals = ["🥇", "🥈", "🥉"];
        const desc = clans.map((c, i) => `${medals[i] || `**${i + 1}.**`} **[${c.tag}] ${c.name}** — ${c.totalKills} kills`).join("\n");
        const embed = new EmbedBuilder().setColor("#a855f7").setTitle("🛡️ Top Clans").setDescription(desc || "No clans yet").setTimestamp();
        return interaction.editReply({ embeds: [embed] });
      }

      if (sub === "leave") {
        const user = await prisma.user.findUnique({ where: { discordId: interaction.user.id } });
        if (!user) return interaction.editReply("❌ Not registered.");

        const membership = await prisma.clanMember.findUnique({ where: { userId: user.id }, include: { clan: true } });
        if (!membership) return interaction.editReply("❌ You are not in a clan.");
        if (membership.clan.leaderId === user.id) return interaction.editReply("❌ You are the clan leader. Transfer leadership first.");

        await prisma.clanMember.delete({ where: { userId: user.id } });
        return interaction.editReply(`✅ You left **${membership.clan.name}**.`);
      }

      if (sub === "invite") {
        const target = interaction.options.getUser("user");
        const user = await prisma.user.findUnique({ where: { discordId: interaction.user.id } });
        if (!user) return interaction.editReply("❌ Not registered.");

        const membership = await prisma.clanMember.findUnique({ where: { userId: user.id }, include: { clan: true } });
        if (!membership || membership.clan.leaderId !== user.id) return interaction.editReply("❌ You must be the clan leader to invite.");

        const targetUser = await prisma.user.findUnique({ where: { discordId: target.id } });
        if (!targetUser) return interaction.editReply("❌ Target user is not registered.");

        const existing = await prisma.clanMember.findUnique({ where: { userId: targetUser.id } });
        if (existing) return interaction.editReply("❌ That user is already in a clan.");

        await prisma.clanMember.create({ data: { userId: targetUser.id, clanId: membership.clanId, role: "MEMBER" } });
        return interaction.editReply(`✅ **${target.username}** has been added to **${membership.clan.name}**!`);
      }

      if (sub === "kick") {
        const target = interaction.options.getUser("user");
        const user = await prisma.user.findUnique({ where: { discordId: interaction.user.id } });
        if (!user) return interaction.editReply("❌ Not registered.");

        const membership = await prisma.clanMember.findUnique({ where: { userId: user.id }, include: { clan: true } });
        if (!membership || membership.clan.leaderId !== user.id) return interaction.editReply("❌ Only the clan leader can kick.");

        const targetUser = await prisma.user.findUnique({ where: { discordId: target.id } });
        if (!targetUser) return interaction.editReply("❌ User not found.");

        await prisma.clanMember.deleteMany({ where: { userId: targetUser.id, clanId: membership.clanId } });
        return interaction.editReply(`✅ **${target.username}** has been kicked from the clan.`);
      }
    } catch (err) {
      return interaction.editReply(`❌ Error: ${err.message}`);
    } finally {
      await prisma.$disconnect();
    }
  },
};
