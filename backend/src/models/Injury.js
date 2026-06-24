const mongoose = require('mongoose');

const injurySchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    injuryType: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    injuryDate: { type: Date, required: true },
    expectedRecoveryDate: { type: Date },
    status: {
      type: String,
      enum: ['Minor', 'Serious', 'Recovered'],
      default: 'Minor',
    },
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Injury', injurySchema);
