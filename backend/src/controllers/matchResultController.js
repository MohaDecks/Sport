const MatchResult = require('../models/MatchResult');
const Match = require('../models/Match');
const Player = require('../models/Player');
const PlayerCard = require('../models/PlayerCard');
const Suspension = require('../models/Suspension');
const Standing = require('../models/Standing');
const asyncHandler = require('../utils/asyncHandler');
const { updateStandings } = require('../services/standingsService');
const { applyCardSuspensions } = require('../services/disciplineService');

const getMatchResult = asyncHandler(async (req, res) => {
  const result = await MatchResult.findOne({ match: req.params.matchId })
    .populate('goalScorers.player goalScorers.team cards.player cards.team playerStats.player');

  if (!result) return res.status(404).json({ success: false, message: 'Match result not found' });
  res.json({ success: true, data: result });
});

const createOrUpdateResult = asyncHandler(async (req, res) => {
  const { matchId } = req.params;
  const match = await Match.findById(matchId);
  if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

  const { homeScore, awayScore, goalScorers, cards, playerStats, possession, shots, shotsOnTarget, corners, fouls } = req.body;

  let result = await MatchResult.findOne({ match: matchId });
  const isUpdate = !!result;

  const resultData = {
    match: matchId,
    homeScore,
    awayScore,
    goalScorers: goalScorers || [],
    cards: cards || [],
    playerStats: playerStats || [],
    possession,
    shots,
    shotsOnTarget,
    corners,
    fouls,
  };

  if (result) {
    result = await MatchResult.findByIdAndUpdate(result._id, resultData, { new: true });
  } else {
    result = await MatchResult.create(resultData);
  }

  await Match.findByIdAndUpdate(matchId, {
    homeScore,
    awayScore,
    status: 'Finished',
  });

  if (cards?.length) {
    if (isUpdate) {
      const existingCards = await PlayerCard.find({ match: matchId });
      for (const existing of existingCards) {
        const field = existing.type === 'Yellow' ? 'yellowCards' : 'redCards';
        await Player.findByIdAndUpdate(existing.player, { $inc: { [field]: -1 } });
      }
      await PlayerCard.deleteMany({ match: matchId });
    }

    for (const card of cards) {
      await PlayerCard.create({
        player: card.player,
        match: matchId,
        type: card.type,
        minute: card.minute,
        team: card.team,
      });

      const updateField = card.type === 'Yellow' ? { $inc: { yellowCards: 1 } } : { $inc: { redCards: 1 } };
      await Player.findByIdAndUpdate(card.player, updateField);
    }
    await applyCardSuspensions(cards, matchId);
  }

  await updateStandings(match.tournament, matchId, homeScore, awayScore, match.homeTeam, match.awayTeam);

  const populated = await MatchResult.findById(result._id)
    .populate('goalScorers.player cards.player playerStats.player');

  res.json({ success: true, data: populated });
});

module.exports = { getMatchResult, createOrUpdateResult };
