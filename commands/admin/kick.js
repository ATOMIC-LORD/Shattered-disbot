const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { PrismaClient } = require("@prisma/client");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("[ADMIN] Kick a user from Discord")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((o) => o.setName("user").setDescription("Discord user").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Kick reason").setRequired(true)),
  cooldown: 3,
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const prisma = new PrismaClient();
    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");

    try {
      const issuer = await prisma.user.findUnique({ where: { discordId: interaction.user.id } });
      if (!issuer || !["ADMIN", "OWNER"].includes(issuer.role)) return interaction.editReply("❌ No permission.");

      const member = await interaction.guild.members.fetch(target.id).catch(() => null);
      if (member) await member.kick(reason);

      const targetUser = await prisma.user.findUnique({ where: { discordId: target.id } });
      if (targetUser) {
        await prisma.punishment.create({ data: { targetId: targetUser.id, issuerId: issuer.id, type: "KICK", reason } });
      }

      const embed = new EmbedBuilder().setColor("#f97316").setTitle("👢 Player Kicked")
        .addFields({ name: "Player", value: target.tag, inline: true }, { name: "Reason", value: reason }).setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply(`❌ Error: ${err.message}`);
    } finally {
      await prisma.$disconnect();
    }
  },
};
