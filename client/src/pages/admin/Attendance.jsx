import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

const Attendance = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { fetchAttendance(); }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      const res = await API.get(`/attendance/by-date?date=${selectedDate}`);
      setAttendance(res.data);
    } catch (err) { console.log(err); }
  };

  const formatTime = (secs) => {
    if (!secs) return '—';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const sidebarItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Employees', path: '/admin/employees' },
    { label: 'Attendance', path: '/admin/attendance' },
    { label: 'Tasks', path: '/admin/tasks' },
    { label: 'Reports', path: '/admin/reports' },
    { label: 'Analytics', path: '/admin/analytics' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      <div style={{ width: '220px', background: 'white', borderRight: '1px solid #eee', padding: '1rem 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 1rem 1rem', borderBottom: '1px solid #eee', marginBottom: '0.5rem' }}>
          <img src="/logo.png" alt="Wexoraa" style={{ height: '32px', objectFit: 'contain' }} />
          <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Admin Panel</p>
        </div>
        {sidebarItems.map((item) => (
          <div key={item.path} onClick={() => navigate(item.path)} style={{
            padding: '10px 1rem', cursor: 'pointer', fontSize: '14px',
            background: window.location.pathname === item.path ? '#f0fdf4' : 'transparent',
            color: window.location.pathname === item.path ? '#16a34a' : '#444',
            fontWeight: window.location.pathname === item.path ? '500' : 'normal'
          }}>{item.label}</div>
        ))}
        <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid #eee' }}>
          <p style={{ fontSize: '13px', fontWeight: '500', margin: '0 0 2px' }}>{user?.name}</p>
          <p style={{ fontSize: '11px', color: '#888', margin: '0 0 8px' }}>Admin</p>
          <button onClick={handleLogout} style={{ width: '100%', padding: '7px', fontSize: '13px', background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '6px', color: '#cc0000', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <p style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Attendance</p>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Employee work & break hours</p>
          </div>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }} />
        </div>

        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #eee', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee', background: '#f8f9fa' }}>
                <th style={{ textAlign: 'left', padding: '12px 1rem', fontWeight: '500', color: '#555' }}>Employee</th>
                <th style={{ textAlign: 'left', padding: '12px 1rem', fontWeight: '500', color: '#555' }}>Check In</th>
                <th style={{ textAlign: 'left', padding: '12px 1rem', fontWeight: '500', color: '#555' }}>Check Out</th>
                <th style={{ textAlign: 'left', padding: '12px 1rem', fontWeight: '500', color: '#555' }}>Work Hours</th>
                <th style={{ textAlign: 'left', padding: '12px 1rem', fontWeight: '500', color: '#555' }}>Break Hours</th>
                <th style={{ textAlign: 'left', padding: '12px 1rem', fontWeight: '500', color: '#555' }}>Breaks</th>
                <th style={{ textAlign: 'left', padding: '12px 1rem', fontWeight: '500', color: '#555' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No attendance records for this date</td></tr>
              ) : (
                attendance.map((a) => (
                  <tr key={a._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '12px 1rem' }}>
                      <p style={{ margin: 0, fontWeight: '500' }}>{a.employee?.name}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>{a.employee?.department}</p>
                    </td>
                    <td style={{ padding: '12px 1rem', color: '#555' }}>{a.checkIn || '—'}</td>
                    <td style={{ padding: '12px 1rem', color: '#555' }}>{a.checkOut || '—'}</td>
                    <td style={{ padding: '12px 1rem' }}>
                      <span style={{ fontWeight: '500', color: '#16a34a' }}>{formatTime(a.workSeconds)}</span>
                    </td>
                    <td style={{ padding: '12px 1rem' }}>
                      <span style={{ fontWeight: '500', color: '#ca8a04' }}>{formatTime(a.breakSeconds)}</span>
                    </td>
                    <td style={{ padding: '12px 1rem', color: '#555' }}>{a.breakCount || 0} times</td>
                    <td style={{ padding: '12px 1rem' }}>
                      <span style={{
                        fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                        background: a.status === 'present' ? '#dcfce7' : a.status === 'late' ? '#fef9c3' : '#fee2e2',
                        color: a.status === 'present' ? '#16a34a' : a.status === 'late' ? '#ca8a04' : '#dc2626'
                      }}>{a.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;