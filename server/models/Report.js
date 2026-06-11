const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  tasksCompleted: {
    type: String,
    required: true
  },
  hoursWorked: {
    type: Number,
    required: true
  },
  blockers: {
    type: String,
    default: ''
  },
  tomorrowPlan: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);