const mongoose = require('mongoose');

const playerMatchActivitySchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    status: {
      type: String,
      enum: ['Active', 'Injured', 'Suspended', 'Absent', 'Bench'],
      default: 'Active',
    },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 },
    minutesPlayed: { type: Number, default: 0 },
    ownGoals: { type: Number, default: 0 },
    fouls: { type: Number, default: 0 },
    yellowCards: { type: Number, default: 0 },
    redCards: { type: Number, default: 0 },
  },
  { timestamps: true }
);

playerMatchActivitySchema.index({ player: 1, match: 1 }, { unique: true });

module.exports = mongoose.model('PlayerMatchActivity', playerMatchActivitySchema);
