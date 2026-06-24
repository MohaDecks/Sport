const Coach = require('../models/Coach');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, paginateResponse } = require('../utils/pagination');

const getCoaches = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = { isActive: true };

  if (req.query.search) {
    filter.fullName = { $regex: req.query.search, $options: 'i' };
  }
  if (req.query.team) filter.team = req.query.team;

  const [coaches, total] = await Promise.all([
    Coach.find(filter).populate('team').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Coach.countDocuments(filter),
  ]);

  res.json({ success: true, ...paginateResponse(coaches, total, page, limit) });
});

const getCoach = asyncHandler(async (req, res) => {
  const coach = await Coach.findById(req.params.id).populate('team');
  if (!coach) return res.status(404).json({ success: false, message: 'Coach not found' });
  res.json({ success: true, data: coach });
});

const createCoach = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.profile = `/uploads/${req.file.filename}`;

  const coach = await Coach.create(data);

  if (data.email && data.password) {
    await User.create({
      fullName: coach.fullName,
      email: data.email,
      phone: coach.phone,
      password: data.password,
      role: 'coach',
      coach: coach._id,
      team: coach.team,
    });
  }

  const populated = await Coach.findById(coach._id).populate('team');
  res.status(201).json({ success: true, data: populated });
});

const updateCoach = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) data.profile = `/uploads/${req.file.filename}`;

  const coach = await Coach.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  }).populate('team');

  if (!coach) return res.status(404).json({ success: false, message: 'Coach not found' });
  res.json({ success: true, data: coach });
});

const deleteCoach = asyncHandler(async (req, res) => {
  const coach = await Coach.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!coach) return res.status(404).json({ success: false, message: 'Coach not found' });
  res.json({ success: true, message: 'Coach deleted' });
});

module.exports = { getCoaches, getCoach, createCoach, updateCoach, deleteCoach };
