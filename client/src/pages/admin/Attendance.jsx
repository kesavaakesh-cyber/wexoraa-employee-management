import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

const Attendance = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState([]);

  useEffect(() => { fetchAttendance(); }, []);

  const fetchAttendance = async () => {
    try {
      const res = await API.get('/attendance/today');
      setAttendance(res.data);
    } catch (err) { console.log(err); }
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
          <p style={{ fontWeight: '600', margin: 0, fontSize: '16px' }}>Wexoraa infotech</p>
          <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Admin Panel</p>
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
          <p style={{ fontSize: '11px', color: '#888', margin: '0 0 8px' }}>Admin</p>
          <button onClick={handleLogout} style={{ width: '100%', padding: '7px', fontSize: '13px', background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '6px', color: '#cc0000', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Attendance</p>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Today - {new Date().toDateString()}</p>
        </div>

        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #eee' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee', background: '#f8f9fa' }}>
                <th style={{ textAlign: 'left', padding: '12px 1rem', fontWeight: '500', color: '#555' }}>Employee</th>
                <th style={{ textAlign: 'left', padding: '12px 1rem', fontWeight: '500', color: '#555' }}>Department</th>
                <th style={{ textAlign: 'left', padding: '12px 1rem', fontWeight: '500', color: '#555' }}>Check In</th>
                <th style={{ textAlign: 'left', padding: '12px 1rem', fontWeight: '500', color: '#555' }}>Check Out</th>
                <th style={{ textAlign: 'left', padding: '12px 1rem', fontWeight: '500', color: '#555' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No attendance records today</td></tr>
              ) : (
                attendance.map((a) => (
                  <tr key={a._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '12px 1rem', fontWeight: '500' }}>{a.employee?.name}</td>
                    <td style={{ padding: '12px 1rem', color: '#555' }}>{a.employee?.department || '-'}</td>
                    <td style={{ padding: '12px 1rem', color: '#555' }}>{a.checkIn || '-'}</td>
                    <td style={{ padding: '12px 1rem', color: '#555' }}>{a.checkOut || '-'}</td>
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