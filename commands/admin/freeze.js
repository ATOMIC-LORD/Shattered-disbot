const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { PrismaClient } = require("@prisma/client");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("freeze")
    .setDescription("[ADMIN] Freeze a player in-game (prevents movement)")
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addStringOption((o) => o.setName("username").setDescription("Minecraft username").setRequired(true))
    .addStringOption((o) => o.setName("reason").setDescription("Reason for freeze").setRequired(true)),
  cooldown: 5,
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const prisma = new PrismaClient();
    const mcUsername = interaction.options.getString("username");
    const reason = interaction.options.getString("reason");

    try {
      const issuer = await prisma.user.findUnique({ where: { discordId: interaction.user.id } });
      if (!issuer || !["ADMIN", "OWNER"].includes(issuer.role)) return interaction.editReply("❌ No permission.");

      const mcAccount = await prisma.minecraftAccount.findFirst({
        where: { mcUsername: { equals: mcUsername, mode: "insensitive" } },
        include: { user: true },
      });
      if (!mcAccount) return interaction.editReply("❌ Player not found.");

      await prisma.punishment.create({
        data: { targetId: mcAccount.user.id, issuerId: issuer.id, type: "FREEZE", reason },
      });

      // Send RCON freeze command (requires freeze plugin)
      const { executeCommand } = require("../../utils/mcCommand");
      await executeCommand(`freeze ${mcUsername}`).catch(() => {});

      const embed = new EmbedBuilder().setColor("#3b82f6").setTitle("🧊 Player Frozen")
        .addFields(
          { name: "Player", value: mcUsername, inline: true },
          { name: "Reason", value: reason }
        ).setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply(`❌ Error: ${err.message}`);
    } finally {
      await prisma.$disconnect();
    }
  },
};
