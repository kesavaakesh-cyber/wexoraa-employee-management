const Attendance = require('../models/Attendance');

const checkIn = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const existing = await Attendance.findOne({ employee: req.user.id, date: today });
    if (existing) {
      return res.status(400).json({ message: 'Already checked in today' });
    }
    const now = new Date();
    const time = now.toTimeString().split(' ')[0];
    const hour = now.getHours();
    const min = now.getMinutes();
    const isLate = hour > 9 || (hour === 9 && min > 30);
    const attendance = await Attendance.create({
      employee: req.user.id,
      date: today,
      checkIn: time,
      status: isLate ? 'late' : 'present'
    });
    res.status(201).json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const checkOut = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const attendance = await Attendance.findOne({ employee: req.user.id, date: today });
    if (!attendance) {
      return res.status(400).json({ message: 'Not checked in today' });
    }
    if (attendance.checkOut) {
      return res.status(400).json({ message: 'Already checked out' });
    }
    const time = new Date().toTimeString().split(' ')[0];
    attendance.checkOut = time;
    await attendance.save();
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Work timer save - employee end work panna call aagum
const saveWorkTimer = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { checkIn, checkOut, workSeconds, breakSeconds, breakCount } = req.body;

    let attendance = await Attendance.findOne({ employee: req.user.id, date: today });

    if (!attendance) {
      const now = new Date();
      const hour = now.getHours();
      const min = now.getMinutes();
      const isLate = hour > 9 || (hour === 9 && min > 30);
      attendance = new Attendance({
        employee: req.user.id,
        date: today,
        checkIn,
        status: isLate ? 'late' : 'present'
      });
    }

    attendance.checkOut = checkOut;
    attendance.workSeconds = workSeconds;
    attendance.breakSeconds = breakSeconds;
    attendance.breakCount = breakCount;
    await attendance.save();

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getTodayAttendance = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const records = await Attendance.find({ date: today })
      .populate('employee', 'name email department');
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ employee: req.user.id })
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { checkIn, checkOut, saveWorkTimer, getTodayAttendance, getMyAttendance };