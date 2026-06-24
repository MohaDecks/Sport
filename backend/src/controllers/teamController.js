const Team = require('../models/Team');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, paginateResponse } = require('../utils/pagination');

const getTeams = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { isActive: true };

  if (req.query.search) {
    filter.name = { $regex: req.query.search, $options: 'i' };
  }
  if (req.query.district) filter.district = req.query.district;
  if (req.query.category) filter.category = req.query.category;

  const [teams, total] = await Promise.all([
    Team.find(filter).populate('coach').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Team.countDocuments(filter),
  ]);

  res.json({ success: true, ...paginateResponse(teams, total, page, limit) });
});

const getTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id).populate('coach');
  if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
  res.json({ success: true, data: team });
});

const createTeam = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.logo = `/uploads/${req.file.filename}`;

  const team = await Team.create(data);
  res.status(201).json({ success: true, data: team });
});

const updateTeam = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.logo = `/uploads/${req.file.filename}`;

  const team = await Team.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  }).populate('coach');

  if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
  res.json({ success: true, data: team });
});

const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
  res.json({ success: true, message: 'Team deleted' });
});

module.exports = { getTeams, getTeam, createTeam, updateTeam, deleteTeam };
