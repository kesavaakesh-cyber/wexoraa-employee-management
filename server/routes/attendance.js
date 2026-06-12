const express = require('express');
const router = express.Router();
const { checkIn, checkOut, saveWorkTimer, getTodayAttendance, getMyAttendance } = require('../controllers/attendanceController');
const { protect, isAdmin } = require('../middleware/auth');
const Attendance = require('../models/Attendance');

router.post('/checkin', protect, checkIn);
router.put('/checkout', protect, checkOut);
router.post('/save-timer', protect, saveWorkTimer);
router.get('/today', protect, isAdmin, getTodayAttendance);
router.get('/my', protect, getMyAttendance);

// Date wise attendance - admin
router.get('/by-date', protect, isAdmin, async (req, res) => {
  try {
    const { date } = req.query;
    const records = await Attendance.find({ date: date || new Date().toISOString().split('T')[0] })
      .populate('employee', 'name email department');
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;