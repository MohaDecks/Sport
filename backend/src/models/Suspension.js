const mongoose = require('mongoose');

const suspensionSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    reason: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
    isActive: { type: Boolean, default: true },
    type: {
      type: String,
      enum: ['Yellow Accumulation', 'Red Card', 'Disciplinary', 'Other'],
      default: 'Disciplinary',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Suspension', suspensionSchema);
