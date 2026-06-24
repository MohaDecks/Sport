const mongoose = require('mongoose');

const playerCardSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    type: { type: String, enum: ['Yellow', 'Red'], required: true },
    minute: { type: Number, required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    suspensionApplied: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlayerCard', playerCardSchema);
