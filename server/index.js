const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = 'mongodb://kesavaakesh_db_user:g56VPQSuf1WUaLbJ@ac-myltg3m-shard-00-00.wdx9vls.mongodb.net:27017,ac-myltg3m-shard-00-01.wdx9vls.mongodb.net:27017,ac-myltg3m-shard-00-02.wdx9vls.mongodb.net:27017/worktrack?ssl=true&replicaSet=atlas-84jidk-shard-0&authSource=admin&retryWrites=true&w=majority';
const PORT = 5000;
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const employeeRoutes = require('./routes/employees');
app.use('/api/employees', employeeRoutes);
const attendanceRoutes = require('./routes/attendance');
const taskRoutes = require('./routes/tasks');
const reportRoutes = require('./routes/reports');
app.use('/api/reports', reportRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', taskRoutes);
app.get('/', (req, res) => {
  res.json({ message: 'Wexoraa infotech server running!' });
});

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log('Server running on port ' + PORT);
    });
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err);
  });