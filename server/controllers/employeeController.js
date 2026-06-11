const User = require('../models/User');
const bcrypt = require('bcryptjs');

// All employees get pannuvom
const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('-password');
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// New employee add pannuvom
const addEmployee = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    // Email already irukka check pannuvom
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const employee = await User.create({
      name,
      email,
      password: hashedPassword,
      department,
      role: 'employee'
    });

    res.status(201).json({
      id: employee._id,
      name: employee.name,
      email: employee.email,
      department: employee.department,
      role: employee.role
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Employee update pannuvom
const updateEmployee = async (req, res) => {
  try {
    const { name, email, department, isActive } = req.body;
    const employee = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, department, isActive },
      { new: true }
    ).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Employee delete pannuvom
const deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getEmployees, addEmployee, updateEmployee, deleteEmployee };