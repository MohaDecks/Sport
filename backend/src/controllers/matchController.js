const Match = require('../models/Match');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, paginateResponse } = require('../utils/pagination');

const getMatches = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.tournament) filter.tournament = req.query.tournament;
  if (req.query.team) {
    filter.$or = [{ homeTeam: req.query.team }, { awayTeam: req.query.team }];
  }
  if (req.query.date) {
    const date = new Date(req.query.date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);
    filter.matchDate = { $gte: date, $lt: nextDay };
  }

  const [matches, total] = await Promise.all([
    Match.find(filter)
      .populate('homeTeam awayTeam tournament')
      .sort({ matchDate: -1 })
      .skip(skip)
      .limit(limit),
    Match.countDocuments(filter),
  ]);

  res.json({ success: true, ...paginateResponse(matches, total, page, limit) });
});

const getTodayMatches = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const filter = { matchDate: { $gte: today, $lt: tomorrow } };
  if (req.user.role === 'coach' && req.user.team) {
    filter.$or = [{ homeTeam: req.user.team._id }, { awayTeam: req.user.team._id }];
  }

  const matches = await Match.find(filter)
    .populate('homeTeam awayTeam tournament')
    .sort({ matchTime: 1 });

  res.json({ success: true, data: matches });
});

const getMatch = asyncHandler(async (req, res) => {
  const match = await Match.findById(req.params.id).populate('homeTeam awayTeam tournament');
  if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
  res.json({ success: true, data: match });
});

const createMatch = asyncHandler(async (req, res) => {
  const match = await Match.create(req.body);
  const populated = await Match.findById(match._id).populate('homeTeam awayTeam tournament');
  res.status(201).json({ success: true, data: populated });
});

const updateMatch = asyncHandler(async (req, res) => {
  const match = await Match.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('homeTeam awayTeam tournament');

  if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
  res.json({ success: true, data: match });
});

const deleteMatch = asyncHandler(async (req, res) => {
  const match = await Match.findByIdAndDelete(req.params.id);
  if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
  res.json({ success: true, message: 'Match deleted' });
});

module.exports = { getMatches, getTodayMatches, getMatch, createMatch, updateMatch, deleteMatch };
