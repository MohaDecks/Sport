const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    type: { type: String, enum: ['Training', 'Match'], required: true },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late'],
      default: 'Present',
    },
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
