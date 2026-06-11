import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [attRes, taskRes] = await Promise.all([
        API.get('/attendance/my'),
        API.get('/tasks/my')
      ]);
      const today = new Date().toISOString().split('T')[0];
      const todayAtt = attRes.data.find(a => a.date === today);
      if (todayAtt) {
        setAttendance(todayAtt);
        setCheckedIn(true);
        if (todayAtt.checkOut) setCheckedOut(true);
      }
      setTasks(taskRes.data.slice(0, 4));
    } catch (err) { console.log(err); }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const res = await API.post('/attendance/checkin');
      setAttendance(res.data);
      setCheckedIn(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    } finally { setLoading(false); }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const res = await API.put('/attendance/checkout');
      setAttendance(res.data);
      setCheckedOut(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    } finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const sidebarItems = [
    { label: 'Dashboard', path: '/employee/dashboard' },
    { label: 'My Tasks', path: '/employee/tasks' },
    { label: 'Daily Report', path: '/employee/report' },
  ];

  const statusColor = (s) => ({
    pending: { bg: '#f3f4f6', color: '#555' },
    inprogress: { bg: '#fef9c3', color: '#ca8a04' },
    done: { bg: '#dcfce7', color: '#16a34a' }
  }[s] || { bg: '#f3f4f6', color: '#555' });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      <div style={{ width: '220px', background: 'white', borderRight: '1px solid #eee', padding: '1rem 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 1rem 1rem', borderBottom: '1px solid #eee', marginBottom: '0.5rem' }}>
          <p style={{ fontWeight: '600', margin: 0, fontSize: '16px' }}>Wexoraa infotech</p>
          <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Employee</p>
        </div>
        {sidebarItems.map((item) => (
          <div key={item.path} onClick={() => navigate(item.path)} style={{
            padding: '10px 1rem', cursor: 'pointer', fontSize: '14px',
            background: window.location.pathname === item.path ? '#eff6ff' : 'transparent',
            color: window.location.pathname === item.path ? '#2563eb' : '#444',
            fontWeight: window.location.pathname === item.path ? '500' : 'normal'
          }}>{item.label}</div>
        ))}
        <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid #eee' }}>
          <p style={{ fontSize: '13px', fontWeight: '500', margin: '0 0 2px' }}>{user?.name}</p>
          <p style={{ fontSize: '11px', color: '#888', margin: '0 0 8px' }}>Employee</p>
          <button onClick={handleLogout} style={{ width: '100%', padding: '7px', fontSize: '13px', background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '6px', color: '#cc0000', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Good morning, {user?.name}!</p>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>{new Date().toDateString()}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '12px', marginBottom: '12px' }}>
          <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #eee', padding: '1.25rem' }}>
            <p style={{ fontWeight: '500', margin: '0 0 1rem', fontSize: '15px' }}>Today's Attendance</p>
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 12px',
                background: checkedIn ? '#dcfce7' : '#f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px'
              }}>
                {checkedIn ? '✓' : '○'}
              </div>
              <p style={{ fontWeight: '500', margin: '0 0 2px', color: checkedIn ? '#16a34a' : '#555' }}>
                {checkedIn ? (checkedOut ? 'Checked Out' : 'Checked In') : 'Not Checked In'}
              </p>
              {attendance?.checkIn && (
                <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>In: {attendance.checkIn}</p>
              )}
              {attendance?.checkOut && (
                <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Out: {attendance.checkOut}</p>
              )}
            </div>
            <div style={{ marginTop: '1rem' }}>
              {!checkedIn && (
                <button onClick={handleCheckIn} disabled={loading} style={{
                  width: '100%', padding: '9px', background: '#2563eb', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
                }}>Check In</button>
              )}
              {checkedIn && !checkedOut && (
                <button onClick={handleCheckOut} disabled={loading} style={{
                  width: '100%', padding: '9px', background: '#dc2626', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
                }}>Check Out</button>
              )}
              {checkedOut && (
                <p style={{ textAlign: 'center', fontSize: '13px', color: '#16a34a', margin: 0 }}>✓ Done for today!</p>
              )}
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #eee', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ fontWeight: '500', margin: 0, fontSize: '15px' }}>My Tasks</p>
              <span onClick={() => navigate('/employee/tasks')} style={{ fontSize: '12px', color: '#2563eb', cursor: 'pointer' }}>View all</span>
            </div>
            {tasks.length === 0 ? (
              <p style={{ color: '#888', fontSize: '13px' }}>No tasks assigned yet</p>
            ) : (
              tasks.map((task) => (
                <div key={task._id} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '6px'
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: '500', margin: 0 }}>{task.title}</p>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Due: {task.dueDate || 'No date'}</p>
                  </div>
                  <span style={{
                    fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                    background: statusColor(task.status).bg, color: statusColor(task.status).color
                  }}>{task.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #eee', padding: '1.25rem' }}>
          <p style={{ fontWeight: '500', margin: '0 0 1rem', fontSize: '15px' }}>Quick Actions</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/employee/report')} style={{
              padding: '10px 20px', background: '#2563eb', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
            }}>Submit Daily Report</button>
            <button onClick={() => navigate('/employee/tasks')} style={{
              padding: '10px 20px', background: 'white', color: '#2563eb',
              border: '1px solid #2563eb', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
            }}>View My Tasks</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;