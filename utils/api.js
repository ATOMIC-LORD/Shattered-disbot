// ============================================
// API HELPER - Calls Express backend
// ============================================
const axios = require("axios");

const api = axios.create({
  baseURL: process.env.API_URL || "http://localhost:3001",
  headers: { "X-API-Key": process.env.MC_API_KEY },
  timeout: 8000,
});

const getPlayer = async (username) => {
  const res = await api.get(`/api/players/${username}`);
  return res.data;
};

const getTopKillers = async () => {
  const res = await api.get("/api/stats/top-killers");
  return res.data;
};

const getClans = async () => {
  const res = await api.get("/api/clans");
  return res.data;
};

const getServerStatus = async () => {
  const res = await api.get("/api/server");
  return res.data;
};

const getLeaderboard = async () => {
  const res = await api.get("/api/players/leaderboard/kills");
  return res.data;
};

module.exports = { getPlayer, getTopKillers, getClans, getServerStatus, getLeaderboard };
