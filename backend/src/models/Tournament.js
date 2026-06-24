const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Upcoming',
    },
    description: { type: String, default: '' },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tournament', tournamentSchema);
