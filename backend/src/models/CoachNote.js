const mongoose = require('mongoose');

const coachNoteSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach', required: true },
    type: {
      type: String,
      enum: ['Performance', 'Medical'],
      required: true,
    },
    note: { type: String, required: true },
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
    isPrivate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CoachNote', coachNoteSchema);
