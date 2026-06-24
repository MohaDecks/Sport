const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, paginateResponse } = require('../utils/pagination');
const { sendPushForNotification } = require('../utils/notificationHelpers');

const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {
    $or: [
      { targetRole: 'all' },
      { targetRole: req.user.role },
      { targetTeam: req.user.team?._id },
    ],
  };

  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);

  res.json({ success: true, ...paginateResponse(notifications, total, page, limit) });
});

const createNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.create({
    ...req.body,
    createdBy: req.user._id,
  });

  await sendPushForNotification(notification);

  res.status(201).json({ success: true, data: notification });
});

const markAsRead = asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, {
    $addToSet: { isRead: req.user._id },
  });
  res.json({ success: true, message: 'Marked as read' });
});

module.exports = { getNotifications, createNotification, markAsRead };
