import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [timerStatus, setTimerStatus] = useState('idle');
  const [workSeconds, setWorkSeconds] = useState(0);
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [breaks, setBreaks] = useState([]);
  const [currentBreakStart, setCurrentBreakStart] = useState(null);
  const [workSaved, setWorkSaved] = useState(false);
  const workIntervalRef = useRef(null);
  const breakIntervalRef = useRef(null);

  useEffect(() => {
    fetchData();
    const saved = localStorage.getItem('workTimer');
    if (saved) {
      const data = JSON.parse(saved);
      setTimerStatus(data.status);
      setWorkSeconds(data.workSeconds || 0);
      setBreakSeconds(data.breakSeconds || 0);
      setStartTime(data.startTime);
      setBreaks(data.breaks || []);
      if (data.status === 'ended') setWorkSaved(true);
    }
  }, []);

  // Work timer - only runs when status is 'working'
  useEffect(() => {
    if (timerStatus === 'working') {
      workIntervalRef.current = setInterval(() => {
        setWorkSeconds(s => {
          const newS = s + 1;
          saveToLocal(newS, breakSeconds, timerStatus);
          return newS;
        });
      }, 1000);
    } else {
      clearInterval(workIntervalRef.current);
    }
    return () => clearInterval(workIntervalRef.current);
  }, [timerStatus]);

  // Break timer - only runs when status is 'break'
  useEffect(() => {
    if (timerStatus === 'break') {
      breakIntervalRef.current = setInterval(() => {
        setBreakSeconds(b => {
          const newB = b + 1;
          saveToLocal(workSeconds, newB, timerStatus);
          return newB;
        });
      }, 1000);
    } else {
      clearInterval(breakIntervalRef.current);
    }
    return () => clearInterval(breakIntervalRef.current);
  }, [timerStatus]);

  const saveToLocal = (ws, bs, status) => {
    localStorage.setItem('workTimer', JSON.stringify({
      status,
      workSeconds: ws,
      breakSeconds: bs,
      startTime,
      breaks
    }));
  };

  const fetchData = async () => {
    try {
      const taskRes = await API.get('/tasks/my');
      setTasks(taskRes.data.slice(0, 4));
    } catch (err) { console.log(err); }
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleStartWork = () => {
    const now = new Date().toTimeString().split(' ')[0];
    setStartTime(now);
    setTimerStatus('working');
    setWorkSeconds(0);
    setBreakSeconds(0);
    setBreaks([]);
    setWorkSaved(false);
    localStorage.removeItem('workTimer');
  };

  const handleBreak = () => {
    const now = new Date().toTimeString().split(' ')[0];
    setCurrentBreakStart(now);
    setTimerStatus('break');
  };

  const handleResume = () => {
    const now = new Date().toTimeString().split(' ')[0];
    const newBreaks = [...breaks, { start: currentBreakStart, end: now }];
    setBreaks(newBreaks);
    setTimerStatus('working');
  };

  const handleEndWork = async () => {
    setTimerStatus('ended');
    clearInterval(workIntervalRef.current);
    clearInterval(breakIntervalRef.current);

    const now = new Date().toTimeString().split(' ')[0];

    localStorage.setItem('workTimer', JSON.stringify({
      status: 'ended',
      workSeconds: workSeconds,
      breakSeconds: breakSeconds,
      startTime: startTime,
      endTime: now,
      breaks: breaks
    }));

    try {
      await API.post('/attendance/save-timer', {
        checkIn: startTime,
        checkOut: now,
        workSeconds: workSeconds,
        breakSeconds: breakSeconds,
        breakCount: breaks.length
      });
    } catch (err) {
      console.log('Save timer error:', err);
    }

    setWorkSaved(true);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const statusColor = (s) => ({
    pending: { bg: '#f3f4f6', color: '#555' },
    inprogress: { bg: '#fef9c3', color: '#ca8a04' },
    done: { bg: '#dcfce7', color: '#16a34a' }
  }[s] || { bg: '#f3f4f6', color: '#555' });

  const sidebarItems = [
    { label: 'Dashboard', path: '/employee/dashboard' },
    { label: 'My Tasks', path: '/employee/tasks' },
    { label: 'Daily Report', path: '/employee/report' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      <div style={{ width: '220px', background: 'white', borderRight: '1px solid #eee', padding: '1rem 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 1rem 1rem', borderBottom: '1px solid #eee', marginBottom: '0.5rem' }}>
          <img src="/logo.png" alt="Wexoraa" style={{ height: '32px', objectFit: 'contain' }} />
          <p style={{ fontSize: '11px', color: '#888', margin: '4px 0 0' }}>Employee</p>
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
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Good morning, {user?.name}!</p>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>{new Date().toDateString()}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '12px', marginBottom: '12px' }}>
          <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #eee', padding: '1.25rem' }}>
            <p style={{ fontWeight: '500', margin: '0 0 1rem', fontSize: '15px' }}>Work Timer</p>

            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              {/* Work Timer Display */}
              <div style={{ marginBottom: '8px' }}>
                <p style={{ fontSize: '11px', color: '#888', margin: '0 0 2px' }}>Work Time</p>
                <div style={{
                  fontSize: '32px', fontWeight: '700', fontFamily: 'monospace',
                  color: timerStatus === 'working' ? '#16a34a' : timerStatus === 'ended' ? '#16a34a' : '#555'
                }}>
                  {formatTime(workSeconds)}
                </div>
              </div>

              {/* Break Timer Display */}
              {timerStatus !== 'idle' && (
                <div>
                  <p style={{ fontSize: '11px', color: '#888', margin: '0 0 2px' }}>Break Time</p>
                  <div style={{
                    fontSize: '20px', fontWeight: '600', fontFamily: 'monospace',
                    color: timerStatus === 'break' ? '#ca8a04' : '#aaa'
                  }}>
                    {formatTime(breakSeconds)}
                  </div>
                </div>
              )}

              <p style={{ fontSize: '12px', color: '#888', margin: '8px 0 0' }}>
                {timerStatus === 'idle' && 'Click Start Work to begin'}
                {timerStatus === 'working' && `🟢 Working • Started ${startTime}`}
                {timerStatus === 'break' && `🟡 On Break`}
                {timerStatus === 'ended' && `✅ Work ended`}
              </p>
            </div>

            {/* Stats */}
            {timerStatus !== 'idle' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1rem' }}>
                <div style={{ background: '#f0fdf4', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', color: '#16a34a', margin: '0 0 2px' }}>Total Work</p>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#16a34a', margin: 0 }}>{Math.floor(workSeconds / 60)} min</p>
                </div>
                <div style={{ background: '#fef9c3', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '11px', color: '#ca8a04', margin: '0 0 2px' }}>Total Break</p>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#ca8a04', margin: 0 }}>{Math.floor(breakSeconds / 60)} min ({breaks.length} times)</p>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {timerStatus === 'idle' && (
                <button onClick={handleStartWork} style={{ width: '100%', padding: '10px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                  ▶ Start Work
                </button>
              )}
              {timerStatus === 'working' && (
                <>
                  <button onClick={handleBreak} style={{ width: '100%', padding: '10px', background: '#fef9c3', color: '#ca8a04', border: '1px solid #fde047', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                    ⏸ Take Break
                  </button>
                  <button onClick={handleEndWork} style={{ width: '100%', padding: '10px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                    ⏹ End Work
                  </button>
                </>
              )}
              {timerStatus === 'break' && (
                <button onClick={handleResume} style={{ width: '100%', padding: '10px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                  ▶ Resume Work
                </button>
              )}
              {timerStatus === 'ended' && (
                <div>
                  <div style={{ padding: '10px', background: '#f0fdf4', borderRadius: '8px', textAlign: 'center', marginBottom: '8px' }}>
                    <p style={{ fontSize: '13px', color: '#16a34a', margin: 0, fontWeight: '500' }}>✓ Work completed!</p>
                    <p style={{ fontSize: '12px', color: '#16a34a', margin: '4px 0 0' }}>
                      Work: {Math.floor(workSeconds / 60)} min | Break: {Math.floor(breakSeconds / 60)} min
                    </p>
                  </div>
                  <button onClick={() => navigate('/employee/report')} style={{ width: '100%', padding: '9px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    📝 Submit Daily Report
                  </button>
                </div>
              )}
            </div>

            {/* Break history */}
            {breaks.length > 0 && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid #f5f5f5', paddingTop: '10px' }}>
                <p style={{ fontSize: '12px', color: '#888', margin: '0 0 6px' }}>Break History ({breaks.length} breaks)</p>
                {breaks.map((b, i) => (
                  <div key={i} style={{ fontSize: '11px', color: '#555', padding: '3px 0' }}>
                    Break {i + 1}: {b.start} → {b.end}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #eee', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <p style={{ fontWeight: '500', margin: 0, fontSize: '15px' }}>My Tasks</p>
              <span onClick={() => navigate('/employee/tasks')} style={{ fontSize: '12px', color: '#16a34a', cursor: 'pointer' }}>View all</span>
            </div>
            {tasks.length === 0 ? (
              <p style={{ color: '#888', fontSize: '13px' }}>No tasks assigned yet</p>
            ) : (
              tasks.map((task) => (
                <div key={task._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '6px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: '500', margin: 0 }}>{task.title}</p>
                    <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>Due: {task.dueDate || 'No date'}</p>
                  </div>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: statusColor(task.status).bg, color: statusColor(task.status).color }}>
                    {task.status === 'inprogress' ? 'In Progress' : task.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #eee', padding: '1.25rem' }}>
          <p style={{ fontWeight: '500', margin: '0 0 1rem', fontSize: '15px' }}>Quick Actions</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/employee/report')} style={{ padding: '10px 20px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>Submit Daily Report</button>
            <button onClick={() => navigate('/employee/tasks')} style={{ padding: '10px 20px', background: 'white', color: '#16a34a', border: '1px solid #16a34a', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>View My Tasks</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;