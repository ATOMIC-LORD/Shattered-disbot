// ============================================
// BOT READY EVENT
// ============================================
const { ActivityType } = require("discord.js");
const logger = require("../utils/logger");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    logger.info(`Logged in as ${client.user.tag}`);
    logger.info(`Serving ${client.guilds.cache.size} guild(s)`);

    const statuses = [
      { name: "LifeSteal SMP", type: ActivityType.Playing },
      { name: "your hearts", type: ActivityType.Watching },
      { name: "/help for commands", type: ActivityType.Listening },
    ];

    let i = 0;
    const rotate = () => {
      client.user.setActivity(statuses[i % statuses.length]);
      i++;
    };

    rotate();
    setInterval(rotate, 30000);
  },
};
