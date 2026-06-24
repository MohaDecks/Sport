const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, default: '' },
    district: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Football', 'Basketball', 'Volleyball', 'Other'],
      default: 'Football',
    },
    coach: { type: mongoose.Schema.Types.ObjectId, ref: 'Coach' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
