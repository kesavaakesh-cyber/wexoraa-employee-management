const express = require('express');
const router = express.Router();
const { createTask, getAllTasks, getMyTasks, updateTaskStatus } = require('../controllers/taskController');
const { protect, isAdmin } = require('../middleware/auth');

router.post('/', protect, isAdmin, createTask);
router.get('/', protect, isAdmin, getAllTasks);
router.get('/my', protect, getMyTasks);
router.put('/:id/status', protect, updateTaskStatus);

module.exports = router;