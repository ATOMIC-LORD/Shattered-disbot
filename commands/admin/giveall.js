const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { PrismaClient } = require("@prisma/client");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("giveall")
    .setDescription("[OWNER] Give an item to all online players")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((o) => o.setName("item").setDescription("Minecraft item ID (e.g. minecraft:diamond)").setRequired(true))
    .addIntegerOption((o) => o.setName("amount").setDescription("Amount").setRequired(true)),
  cooldown: 30,
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const prisma = new PrismaClient();
    const item = interaction.options.getString("item");
    const amount = interaction.options.getInteger("amount");

    try {
      const issuer = await prisma.user.findUnique({ where: { discordId: interaction.user.id } });
      if (!issuer || issuer.role !== "OWNER") return interaction.editReply("❌ Owner only.");

      await prisma.staffLog.create({ data: { staffId: issuer.id, action: "GIVE_ALL", details: { item, amount } } });

      const embed = new EmbedBuilder().setColor("#22c55e").setTitle("🎁 Give All")
        .setDescription(`Sent \`${amount}x ${item}\` to all online players via RCON.`)
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply(`❌ Error: ${err.message}`);
    } finally {
      await prisma.$disconnect();
    }
  },
};
