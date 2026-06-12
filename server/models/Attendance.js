const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  checkIn: { type: String, default: null },
  checkOut: { type: String, default: null },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'present'
  },
  workSeconds: { type: Number, default: 0 },
  breakSeconds: { type: Number, default: 0 },
  breakCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);