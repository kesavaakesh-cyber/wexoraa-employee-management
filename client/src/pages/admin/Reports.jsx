import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

const Reports = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const res = await API.get('/reports/all');
      setReports(res.data);
    } catch (err) { console.log(err); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const sidebarItems = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Employees', path: '/admin/employees' },
    { label: 'Attendance', path: '/admin/attendance' },
    { label: 'Tasks', path: '/admin/tasks' },
    { label: 'Reports', path: '/admin/reports' },
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
          <p style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Daily Reports</p>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>All employee reports</p>
        </div>

        {reports.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #eee', padding: '3rem', textAlign: 'center', color: '#888' }}>
            No reports submitted yet
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {reports.map((r) => (
              <div key={r._id} onClick={() => setSelected(r)} style={{
                background: 'white', borderRadius: '10px', border: '1px solid #eee',
                padding: '1rem', cursor: 'pointer',
                borderLeft: selected?._id === r._id ? '3px solid #2563eb' : '3px solid transparent'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <p style={{ fontWeight: '500', margin: 0, fontSize: '14px' }}>{r.employee?.name}</p>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#eff6ff', color: '#2563eb' }}>{r.date}</span>
                </div>
                <p style={{ fontSize: '12px', color: '#555', margin: '0 0 4px' }}>
                  <strong>Hours:</strong> {r.hoursWorked}h
                </p>
                <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                  {r.tasksCompleted?.substring(0, 80)}...
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', width: '480px', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>{selected.employee?.name}'s Report</p>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#888' }}>✕</button>
            </div>
            <p style={{ fontSize: '12px', color: '#888', margin: '0 0 1rem' }}>{selected.date} · {selected.hoursWorked} hours worked</p>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '13px', fontWeight: '500', color: '#555', margin: '0 0 4px' }}>Tasks Completed</p>
              <p style={{ fontSize: '14px', margin: 0, background: '#f8f9fa', padding: '10px', borderRadius: '8px' }}>{selected.tasksCompleted}</p>
            </div>
            {selected.blockers && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#555', margin: '0 0 4px' }}>Blockers</p>
                <p style={{ fontSize: '14px', margin: 0, background: '#fff0f0', padding: '10px', borderRadius: '8px' }}>{selected.blockers}</p>
              </div>
            )}
            {selected.tomorrowPlan && (
              <div>
                <p style={{ fontSize: '13px', fontWeight: '500', color: '#555', margin: '0 0 4px' }}>Tomorrow's Plan</p>
                <p style={{ fontSize: '14px', margin: 0, background: '#f0fdf4', padding: '10px', borderRadius: '8px' }}>{selected.tomorrowPlan}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;