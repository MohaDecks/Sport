const Standing = require('../models/Standing');
const asyncHandler = require('../utils/asyncHandler');

const getStandings = asyncHandler(async (req, res) => {
  const { tournamentId } = req.params;

  const standings = await Standing.find({ tournament: tournamentId })
    .populate('team')
    .sort({ points: -1, goalDifference: -1, goalsFor: -1 });

  res.json({ success: true, data: standings });
});

module.exports = { getStandings };
