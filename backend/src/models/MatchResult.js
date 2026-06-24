const mongoose = require('mongoose');

const goalScorerSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  minute: { type: Number, required: true },
  isOwnGoal: { type: Boolean, default: false },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
});

const cardSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  type: { type: String, enum: ['Yellow', 'Red'], required: true },
  minute: { type: Number, required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
});

const playerStatSchema = new mongoose.Schema({
  player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  goals: { type: Number, default: 0 },
  assists: { type: Number, default: 0 },
  minutesPlayed: { type: Number, default: 0 },
  ownGoals: { type: Number, default: 0 },
  fouls: { type: Number, default: 0 },
  yellowCards: { type: Number, default: 0 },
  redCards: { type: Number, default: 0 },
  matchStatus: {
    type: String,
    enum: ['Active', 'Injured', 'Suspended', 'Absent', 'Bench'],
    default: 'Active',
  },
});

const matchResultSchema = new mongoose.Schema(
  {
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true, unique: true },
    homeScore: { type: Number, default: 0 },
    awayScore: { type: Number, default: 0 },
    goalScorers: [goalScorerSchema],
    cards: [cardSchema],
    playerStats: [playerStatSchema],
    possession: { home: { type: Number, default: 50 }, away: { type: Number, default: 50 } },
    shots: { home: { type: Number, default: 0 }, away: { type: Number, default: 0 } },
    shotsOnTarget: { home: { type: Number, default: 0 }, away: { type: Number, default: 0 } },
    corners: { home: { type: Number, default: 0 }, away: { type: Number, default: 0 } },
    fouls: { home: { type: Number, default: 0 }, away: { type: Number, default: 0 } },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MatchResult', matchResultSchema);
