const express = require('express');
const router = express.Router();
const { getEmployees, addEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { protect, isAdmin } = require('../middleware/auth');

router.get('/', protect, isAdmin, getEmployees);
router.post('/', protect, isAdmin, addEmployee);
router.put('/:id', protect, isAdmin, updateEmployee);
router.delete('/:id', protect, isAdmin, deleteEmployee);

module.exports = router;