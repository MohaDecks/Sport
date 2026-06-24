const Tournament = require('../models/Tournament');
const Standing = require('../models/Standing');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, paginateResponse } = require('../utils/pagination');

const getTournaments = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};

  if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };
  if (req.query.status) filter.status = req.query.status;

  const [tournaments, total] = await Promise.all([
    Tournament.find(filter).populate('teams').sort({ startDate: -1 }).skip(skip).limit(limit),
    Tournament.countDocuments(filter),
  ]);

  res.json({ success: true, ...paginateResponse(tournaments, total, page, limit) });
});

const getTournament = asyncHandler(async (req, res) => {
  const tournament = await Tournament.findById(req.params.id).populate('teams');
  if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' });
  res.json({ success: true, data: tournament });
});

const createTournament = asyncHandler(async (req, res) => {
  const tournament = await Tournament.create(req.body);

  if (req.body.teams?.length) {
    const standings = req.body.teams.map((teamId) => ({
      tournament: tournament._id,
      team: teamId,
    }));
    await Standing.insertMany(standings);
  }

  res.status(201).json({ success: true, data: tournament });
});

const updateTournament = asyncHandler(async (req, res) => {
  const tournament = await Tournament.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('teams');

  if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' });
  res.json({ success: true, data: tournament });
});

const deleteTournament = asyncHandler(async (req, res) => {
  const tournament = await Tournament.findByIdAndDelete(req.params.id);
  if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' });
  await Standing.deleteMany({ tournament: req.params.id });
  res.json({ success: true, message: 'Tournament deleted' });
});

module.exports = { getTournaments, getTournament, createTournament, updateTournament, deleteTournament };
