const mongoose = require('mongoose');

const standingSchema = new mongoose.Schema(
  {
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    played: { type: Number, default: 0 },
    won: { type: Number, default: 0 },
    drawn: { type: Number, default: 0 },
    lost: { type: Number, default: 0 },
    goalsFor: { type: Number, default: 0 },
    goalsAgainst: { type: Number, default: 0 },
    goalDifference: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
  },
  { timestamps: true }
);

standingSchema.index({ tournament: 1, team: 1 }, { unique: true });

module.exports = mongoose.model('Standing', standingSchema);
