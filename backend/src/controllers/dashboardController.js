const Team = require('../models/Team');
const Player = require('../models/Player');
const Coach = require('../models/Coach');
const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const asyncHandler = require('../utils/asyncHandler');

const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [totalTeams, totalPlayers, totalCoaches, todayMatches, totalTournaments] =
    await Promise.all([
      Team.countDocuments({ isActive: true }),
      Player.countDocuments({ isActive: true }),
      Coach.countDocuments({ isActive: true }),
      Match.countDocuments({ matchDate: { $gte: today, $lt: tomorrow } }),
      Tournament.countDocuments(),
    ]);

  res.json({
    success: true,
    data: {
      totalTeams,
      totalPlayers,
      totalCoaches,
      todayMatches,
      totalTournaments,
    },
  });
});

module.exports = { getDashboardStats };
