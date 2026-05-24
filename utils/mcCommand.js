// ============================================
// MINECRAFT RCON COMMAND HELPER (for bot)
// ============================================
const { Rcon } = require("rcon-client");

let rcon = null;

const executeCommand = async (command) => {
  if (!rcon) {
    rcon = await Rcon.connect({
      host: process.env.MC_SERVER_HOST || "localhost",
      port: parseInt(process.env.MC_RCON_PORT) || 25575,
      password: process.env.MC_RCON_PASSWORD,
    });
    rcon.on("end", () => { rcon = null; });
  }
  return rcon.send(command);
};

module.exports = { executeCommand };
