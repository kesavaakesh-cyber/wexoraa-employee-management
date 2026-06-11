const express = require('express');
const router = express.Router();
const { submitReport, getAllReports, getMyReports } = require('../controllers/reportController');
const { protect, isAdmin } = require('../middleware/auth');

router.post('/submit', protect, submitReport);
router.get('/all', protect, isAdmin, getAllReports);
router.get('/my', protect, getMyReports);

module.exports = router;