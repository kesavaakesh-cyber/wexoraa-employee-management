import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

const DailyReport = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    tasksCompleted: '',
    hoursWorked: '',
    blockers: '',
    tomorrowPlan: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  useEffect(() => {
    // Timer la irunthu auto fill pannuvom
    const saved = localStorage.getItem('workTimer');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.seconds > 0) {
        const workSecs = data.seconds - (data.breakSeconds || 0);
        const hours = (workSecs / 3600).toFixed(1);
        setForm(prev => ({ ...prev, hoursWorked: hours }));
        setAutoFilled(true);
      }
    }
  }, []);

  const handleSubmit = async () => {
    if (!form.tasksCompleted || !form.hoursWorked) {
      setError('Tasks completed and hours worked are required!');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await API.post('/reports/submit', form);
      setSuccess(true);
      setForm({ tasksCompleted: '', hoursWorked: '', blockers: '', tomorrowPlan: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting report');
    } finally { setLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const sidebarItems = [
    { label: 'Dashboard', path: '/employee/dashboard' },
    { label: 'My Tasks', path: '/employee/tasks' },
    { label: 'Daily Report', path: '/employee/report' },
  ];

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
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Daily Report</p>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>{new Date().toDateString()}</p>
        </div>

        {autoFilled && (
          <div style={{ padding: '10px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', marginBottom: '1rem', fontSize: '13px', color: '#2563eb' }}>
            ⏱ Hours auto-filled from your work timer!
          </div>
        )}

        {success && (
          <div style={{ padding: '12px 16px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '10px', marginBottom: '1rem', fontSize: '14px', color: '#16a34a' }}>
            ✓ Report submitted successfully!
          </div>
        )}

        {error && (
          <div style={{ padding: '12px 16px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', marginBottom: '1rem', fontSize: '14px', color: '#dc2626' }}>
            {error}
          </div>
        )}

        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #eee', padding: '1.5rem', maxWidth: '640px' }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#555' }}>Tasks Completed Today *</label>
            <textarea value={form.tasksCompleted} onChange={(e) => setForm({ ...form, tasksCompleted: e.target.value })}
              placeholder="Describe what you completed today..."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', minHeight: '100px', resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#555' }}>
              Hours Worked * {autoFilled && <span style={{ color: '#2563eb', fontWeight: '400' }}>(auto-filled from timer)</span>}
            </label>
            <input type="number" min="0" max="24" step="0.1" value={form.hoursWorked} onChange={(e) => setForm({ ...form, hoursWorked: e.target.value })}
              placeholder="8"
              style={{ width: '120px', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#555' }}>Blockers / Issues <span style={{ color: '#aaa', fontWeight: '400' }}>(optional)</span></label>
            <textarea value={form.blockers} onChange={(e) => setForm({ ...form, blockers: e.target.value })}
              placeholder="Any blockers or issues..."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', minHeight: '70px', resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: '#555' }}>Tomorrow's Plan <span style={{ color: '#aaa', fontWeight: '400' }}>(optional)</span></label>
            <textarea value={form.tomorrowPlan} onChange={(e) => setForm({ ...form, tomorrowPlan: e.target.value })}
              placeholder="What will you work on tomorrow..."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', minHeight: '70px', resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          <button onClick={handleSubmit} disabled={loading} style={{
            padding: '10px 24px', background: loading ? '#aaa' : '#2563eb', color: 'white',
            border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500'
          }}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyReport;