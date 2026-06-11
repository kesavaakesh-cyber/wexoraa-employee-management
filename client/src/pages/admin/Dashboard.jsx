import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    totalTasks: 0,
    reportsToday: 0
  });
  const [attendance, setAttendance] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [empRes, attRes, reportRes, taskRes] = await Promise.all([
        API.get('/employees'),
        API.get('/attendance/today'),
        API.get('/reports/all'),
        API.get('/tasks')
      ]);
      setAttendance(attRes.data);
      setReports(reportRes.data.slice(0, 5));
      setStats({
        totalEmployees: empRes.data.length,
        presentToday: attRes.data.length,
        totalTasks: taskRes.data.length,
        reportsToday: reportRes.data.length
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Sidebar */}
      <div style={{
        width: '220px', background: 'white', borderRight: '1px solid #eee',
        padding: '1rem 0', display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '0 1rem 1rem', borderBottom: '1px solid #eee', marginBottom: '0.5rem' }}>
          <p style={{ fontWeight: '600', margin: 0, fontSize: '16px' }}>Wexoraa infotech</p>
          <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Admin Panel</p>
        </div>
        {[
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Employees', path: '/admin/employees' },
          { label: 'Attendance', path: '/admin/attendance' },
          { label: 'Tasks', path: '/admin/tasks' },
          { label: 'Reports', path: '/admin/reports' },
        ].map((item) => (
          <div key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              padding: '10px 1rem', cursor: 'pointer', fontSize: '14px',
              background: window.location.pathname === item.path ? '#eff6ff' : 'transparent',
              color: window.location.pathname === item.path ? '#2563eb' : '#444',
              fontWeight: window.location.pathname === item.path ? '500' : 'normal'
            }}>
            {item.label}
          </div>
        ))}
        <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid #eee' }}>
          <p style={{ fontSize: '13px', fontWeight: '500', margin: '0 0 2px' }}>{user?.name}</p>
          <p style={{ fontSize: '11px', color: '#888', margin: '0 0 8px' }}>Admin</p>
          <button onClick={handleLogout} style={{
            width: '100%', padding: '7px', fontSize: '13px',
            background: '#fff0f0', border: '1px solid #ffcccc',
            borderRadius: '6px', color: '#cc0000', cursor: 'pointer'
          }}>Logout</button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Dashboard</p>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
            {new Date().toDateString()}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Employees', value: stats.totalEmployees, color: '#2563eb' },
            { label: 'Present Today', value: stats.presentToday, color: '#16a34a' },
            { label: 'Active Tasks', value: stats.totalTasks, color: '#d97706' },
            { label: 'Reports Today', value: stats.reportsToday, color: '#7c3aed' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'white', borderRadius: '10px', padding: '1rem',
              border: '1px solid #eee'
            }}>
              <p style={{ fontSize: '13px', color: '#888', margin: '0 0 6px' }}>{stat.label}</p>
              <p style={{ fontSize: '28px', fontWeight: '600', margin: 0, color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Attendance + Reports */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
          <div style={{ background: 'white', borderRadius: '10px', padding: '1rem', border: '1px solid #eee' }}>
            <p style={{ fontWeight: '500', margin: '0 0 1rem', fontSize: '15px' }}>Today's Attendance</p>
            {attendance.length === 0 ? (
              <p style={{ color: '#888', fontSize: '13px' }}>No attendance records yet</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #eee' }}>
                    <th style={{ textAlign: 'left', padding: '6px 0', color: '#888', fontWeight: '500' }}>Employee</th>
                    <th style={{ textAlign: 'left', padding: '6px 0', color: '#888', fontWeight: '500' }}>Check In</th>
                    <th style={{ textAlign: 'left', padding: '6px 0', color: '#888', fontWeight: '500' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((a) => (
                    <tr key={a._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '8px 0' }}>{a.employee?.name}</td>
                      <td style={{ padding: '8px 0', color: '#555' }}>{a.checkIn}</td>
                      <td style={{ padding: '8px 0' }}>
                        <span style={{
                          fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                          background: a.status === 'present' ? '#dcfce7' : a.status === 'late' ? '#fef9c3' : '#fee2e2',
                          color: a.status === 'present' ? '#16a34a' : a.status === 'late' ? '#ca8a04' : '#dc2626'
                        }}>{a.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div style={{ background: 'white', borderRadius: '10px', padding: '1rem', border: '1px solid #eee' }}>
            <p style={{ fontWeight: '500', margin: '0 0 1rem', fontSize: '15px' }}>Recent Reports</p>
            {reports.length === 0 ? (
              <p style={{ color: '#888', fontSize: '13px' }}>No reports yet</p>
            ) : (
              reports.map((r) => (
                <div key={r._id} style={{
                  padding: '10px', background: '#f8f9fa', borderRadius: '8px',
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: '13px', fontWeight: '500', margin: 0 }}>{r.employee?.name}</p>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>{r.date}</p>
                  </div>
                  <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0' }}>
                    {r.tasksCompleted?.substring(0, 60)}...
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;