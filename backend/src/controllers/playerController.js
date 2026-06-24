const Player = require('../models/Player');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, paginateResponse } = require('../utils/pagination');

const getPlayers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { isActive: true };

  if (req.query.search) {
    filter.fullName = { $regex: req.query.search, $options: 'i' };
  }
  if (req.query.team) filter.team = req.query.team;
  if (req.query.position) filter.position = req.query.position;

  const [players, total] = await Promise.all([
    Player.find(filter).populate('team').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Player.countDocuments(filter),
  ]);

  res.json({ success: true, ...paginateResponse(players, total, page, limit) });
});

const getPlayer = asyncHandler(async (req, res) => {
  const player = await Player.findById(req.params.id).populate('team');
  if (!player) return res.status(404).json({ success: false, message: 'Player not found' });
  res.json({ success: true, data: player });
});

const createPlayer = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.photo = `/uploads/${req.file.filename}`;

  const player = await Player.create(data);
  const populated = await Player.findById(player._id).populate('team');
  res.status(201).json({ success: true, data: populated });
});

const updatePlayer = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.photo = `/uploads/${req.file.filename}`;

  const player = await Player.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  }).populate('team');

  if (!player) return res.status(404).json({ success: false, message: 'Player not found' });
  res.json({ success: true, data: player });
});

const deletePlayer = asyncHandler(async (req, res) => {
  const player = await Player.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!player) return res.status(404).json({ success: false, message: 'Player not found' });
  res.json({ success: true, message: 'Player deleted' });
});

module.exports = { getPlayers, getPlayer, createPlayer, updatePlayer, deletePlayer };
