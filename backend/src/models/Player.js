const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    photo: { type: String, default: '' },
    age: { type: Number, required: true, min: 10, max: 50 },
    position: { type: String, required: true, trim: true },
    jerseyNumber: { type: Number, required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    yellowCards: { type: Number, default: 0 },
    redCards: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

playerSchema.index({ team: 1, jerseyNumber: 1 }, { unique: true });

module.exports = mongoose.model('Player', playerSchema);
