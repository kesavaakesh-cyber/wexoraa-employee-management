const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getTodayAttendance, getMyAttendance } = require('../controllers/attendanceController');
const { protect, isAdmin } = require('../middleware/auth');

router.post('/checkin', protect, checkIn);
router.put('/checkout', protect, checkOut);
router.get('/today', protect, isAdmin, getTodayAttendance);
router.get('/my', protect, getMyAttendance);

module.exports = router;