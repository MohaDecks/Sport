const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
  {
    homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    matchDate: { type: Date, required: true },
    matchTime: { type: String, required: true },
    stadium: { type: String, required: true, trim: true },
    tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
    status: {
      type: String,
      enum: ['Upcoming', 'Live', 'Finished'],
      default: 'Upcoming',
    },
    homeScore: { type: Number, default: 0 },
    awayScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Match', matchSchema);
