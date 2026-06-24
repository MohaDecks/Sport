const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['news', 'match', 'announcement', 'system'],
      default: 'announcement',
    },
    targetRole: {
      type: String,
      enum: ['all', 'admin', 'coach', 'team'],
      default: 'all',
    },
    targetTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    isPush: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isRead: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
