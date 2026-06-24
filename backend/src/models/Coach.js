const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    profile: { type: String, default: '' },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coach', coachSchema);
