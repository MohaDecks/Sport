const Injury = require('../models/Injury');
const Attendance = require('../models/Attendance');
const Suspension = require('../models/Suspension');
const CoachNote = require('../models/CoachNote');
const PlayerMatchActivity = require('../models/PlayerMatchActivity');
const PlayerCard = require('../models/PlayerCard');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, paginateResponse } = require('../utils/pagination');

// Injuries
const getInjuries = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.player) filter.player = req.query.player;
  if (req.query.status) filter.status = req.query.status;

  const injuries = await Injury.find(filter).populate('player match').sort({ injuryDate: -1 });
  res.json({ success: true, data: injuries });
});

const createInjury = asyncHandler(async (req, res) => {
  const injury = await Injury.create(req.body);
  const populated = await Injury.findById(injury._id).populate('player');
  res.status(201).json({ success: true, data: populated });
});

const updateInjury = asyncHandler(async (req, res) => {
  const injury = await Injury.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('player');
  if (!injury) return res.status(404).json({ success: false, message: 'Injury not found' });
  res.json({ success: true, data: injury });
});

// Attendance
const getAttendance = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.player) filter.player = req.query.player;
  if (req.query.type) filter.type = req.query.type;

  const records = await Attendance.find(filter).populate('player match').sort({ date: -1 });
  res.json({ success: true, data: records });
});

const createAttendance = asyncHandler(async (req, res) => {
  const record = await Attendance.create(req.body);
  const populated = await Attendance.findById(record._id).populate('player');
  res.status(201).json({ success: true, data: populated });
});

const bulkAttendance = asyncHandler(async (req, res) => {
  const { records } = req.body;
  const created = await Attendance.insertMany(records);
  res.status(201).json({ success: true, data: created });
});

// Suspensions
const getSuspensions = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.player) filter.player = req.query.player;

  const suspensions = await Suspension.find(filter).populate('player match').sort({ startDate: -1 });
  res.json({ success: true, data: suspensions });
});

const createSuspension = asyncHandler(async (req, res) => {
  const suspension = await Suspension.create(req.body);
  const populated = await Suspension.findById(suspension._id).populate('player');
  res.status(201).json({ success: true, data: populated });
});

// Coach Notes
const getCoachNotes = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.player) filter.player = req.query.player;
  if (req.query.type) filter.type = req.query.type;

  const notes = await CoachNote.find(filter).populate('player coach match').sort({ createdAt: -1 });
  res.json({ success: true, data: notes });
});

const createCoachNote = asyncHandler(async (req, res) => {
  const note = await CoachNote.create({ ...req.body, coach: req.user.coach?._id || req.body.coach });
  const populated = await CoachNote.findById(note._id).populate('player coach');
  res.status(201).json({ success: true, data: populated });
});

// Player Match Activity
const getPlayerActivities = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.player) filter.player = req.query.player;
  if (req.query.match) filter.match = req.query.match;

  const activities = await PlayerMatchActivity.find(filter)
    .populate('player match')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: activities });
});

const createOrUpdateActivity = asyncHandler(async (req, res) => {
  const { player, match, ...data } = req.body;

  const activity = await PlayerMatchActivity.findOneAndUpdate(
    { player, match },
    data,
    { new: true, upsert: true, runValidators: true }
  ).populate('player match');

  res.json({ success: true, data: activity });
});

// Player Cards history
const getPlayerCards = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.player) filter.player = req.query.player;

  const cards = await PlayerCard.find(filter)
    .populate('player team')
    .populate({ path: 'match', populate: { path: 'homeTeam awayTeam' } })
    .sort({ createdAt: -1 });
  res.json({ success: true, data: cards });
});

// Player discipline summary
const getPlayerDiscipline = asyncHandler(async (req, res) => {
  const { playerId } = req.params;

  const [injuries, suspensions, cards, attendance, notes, activities] = await Promise.all([
    Injury.find({ player: playerId }).sort({ injuryDate: -1 }),
    Suspension.find({ player: playerId }).sort({ startDate: -1 }),
    PlayerCard.find({ player: playerId }).populate('match'),
    Attendance.find({ player: playerId }).sort({ date: -1 }).limit(20),
    CoachNote.find({ player: playerId }).populate('coach').sort({ createdAt: -1 }),
    PlayerMatchActivity.find({ player: playerId }).populate('match').sort({ createdAt: -1 }),
  ]);

  res.json({
    success: true,
    data: { injuries, suspensions, cards, attendance, notes, activities },
  });
});

module.exports = {
  getInjuries, createInjury, updateInjury,
  getAttendance, createAttendance, bulkAttendance,
  getSuspensions, createSuspension,
  getCoachNotes, createCoachNote,
  getPlayerActivities, createOrUpdateActivity,
  getPlayerCards, getPlayerDiscipline,
};
