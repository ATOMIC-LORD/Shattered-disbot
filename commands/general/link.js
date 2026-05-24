const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Link your Minecraft account to your Discord profile")
    .addStringOption((o) => o.setName("username").setDescription("Your Minecraft username").setRequired(true))
    .addStringOption((o) => o.setName("platform").setDescription("Java or Bedrock").setRequired(true).addChoices(
      { name: "Java Edition", value: "JAVA" },
      { name: "Bedrock Edition", value: "BEDROCK" }
    )),
  cooldown: 30,
  async execute(interaction) {
    const username = interaction.options.getString("username");
    const platform = interaction.options.getString("platform");

    const embed = new EmbedBuilder()
      .setColor("#3b82f6")
      .setTitle("🔗 Account Linking")
      .setDescription(
        `To link **${username}** (${platform}) to your Discord account:\n\n` +
        `1. Create/login to your account at the [website](${process.env.SITE_URL || "https://shatteredofficial.com"})\n` +
        `2. Go to your **Dashboard** and click **Link Minecraft**\n` +
        `3. Enter your username: \`${username}\` (${platform})\n\n` +
        `Or join the server at \`${process.env.VITE_MC_IP || "play.shatteredofficial.com"}\` and run \`/discord link ${interaction.user.id}\` in-game.`
      )
      .setFooter({ text: "Link expires in 10 minutes" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
