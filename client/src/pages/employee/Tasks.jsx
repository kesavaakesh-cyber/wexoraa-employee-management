import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

const MyTasks = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    try {
      const res = await API.get('/tasks/my');
      setTasks(res.data);
    } catch (err) { console.log(err); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.put(`/tasks/${id}/status`, { status });
      fetchTasks();
    } catch (err) { console.log(err); }
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

  const priorityColor = (p) => ({
    high: { bg: '#fee2e2', color: '#dc2626' },
    medium: { bg: '#fef9c3', color: '#ca8a04' },
    low: { bg: '#f3f4f6', color: '#555' }
  }[p] || { bg: '#f3f4f6', color: '#555' });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      <div style={{ width: '220px', background: 'white', borderRight: '1px solid #eee', padding: '1rem 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 1rem 1rem', borderBottom: '1px solid #eee', marginBottom: '0.5rem' }}>
          <img src="/logo.png" alt="Wexoraa" style={{ height: '32px', objectFit: 'contain' }} />
          <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Employee</p>
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
          <p style={{ fontSize: '11px', color: '#888', margin: '0 0 8px' }}>Employee</p>
          <button onClick={handleLogout} style={{ width: '100%', padding: '7px', fontSize: '13px', background: '#fff0f0', border: '1px solid #ffcccc', borderRadius: '6px', color: '#cc0000', cursor: 'pointer' }}>Logout</button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>My Tasks</p>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>{tasks.length} tasks assigned</p>
        </div>

        {tasks.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #eee', padding: '3rem', textAlign: 'center', color: '#888' }}>
            No tasks assigned yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tasks.map((task) => (
              <div key={task._id} style={{ background: 'white', borderRadius: '10px', border: '1px solid #eee', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <p style={{ fontWeight: '500', margin: '0 0 4px', fontSize: '15px' }}>{task.title}</p>
                    <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>{task.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: priorityColor(task.priority).bg, color: priorityColor(task.priority).color }}>{task.priority}</span>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: statusColor(task.status).bg, color: statusColor(task.status).color }}>
                      {task.status === 'inprogress' ? 'In Progress' : task.status}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f5f5f5' }}>
                  <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Due: {task.dueDate || 'No date'}</p>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {task.status !== 'inprogress' && task.status !== 'done' && (
                      <button onClick={() => handleStatusUpdate(task._id, 'inprogress')} style={{ padding: '5px 10px', fontSize: '12px', background: '#fef9c3', border: '1px solid #fde047', borderRadius: '6px', color: '#ca8a04', cursor: 'pointer' }}>Start</button>
                    )}
                    {task.status !== 'done' && (
                      <button onClick={() => handleStatusUpdate(task._id, 'done')} style={{ padding: '5px 10px', fontSize: '12px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '6px', color: '#16a34a', cursor: 'pointer' }}>Done</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasks;