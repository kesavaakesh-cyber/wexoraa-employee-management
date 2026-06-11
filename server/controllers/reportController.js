const Report = require('../models/Report');

// Submit report - employee
const submitReport = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Already submitted check
    const existing = await Report.findOne({
      employee: req.user.id,
      date: today
    });

    if (existing) {
      return res.status(400).json({ message: 'Report already submitted today' });
    }

    const { tasksCompleted, hoursWorked, blockers, tomorrowPlan } = req.body;

    const report = await Report.create({
      employee: req.user.id,
      date: today,
      tasksCompleted,
      hoursWorked,
      blockers,
      tomorrowPlan
    });

    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// All reports - admin
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('employee', 'name email department')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// My reports - employee
const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ employee: req.user.id })
      .sort({ date: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitReport, getAllReports, getMyReports };