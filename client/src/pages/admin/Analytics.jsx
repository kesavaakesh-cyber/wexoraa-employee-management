import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [empStats, setEmpStats] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [empRes, taskRes, reportRes] = await Promise.all([
        API.get('/employees'),
        API.get('/tasks'),
        API.get('/reports/all')
      ]);
      setEmployees(empRes.data);
      setTasks(taskRes.data);
      setReports(reportRes.data);

      const stats = empRes.data.map(emp => {
        const empTasks = taskRes.data.filter(t => t.assignedTo?._id === emp._id || t.assignedTo === emp._id);
        const empReports = reportRes.data.filter(r => r.employee?._id === emp._id || r.employee === emp._id);
        const done = empTasks.filter(t => t.status === 'done').length;
        const inprogress = empTasks.filter(t => t.status === 'inprogress').length;
        const pending = empTasks.filter(t => t.status === 'pending').length;
        const totalHours = empReports.reduce((sum, r) => sum + (Number(r.hoursWorked) || 0), 0);
        const avgHours = empReports.length > 0 ? (totalHours / empReports.length).toFixed(1) : 0;
        const completionRate = empTasks.length > 0 ? Math.round((done / empTasks.length) * 100) : 0;
        const performance = completionRate >= 80 ? 'Good' : completionRate >= 50 ? 'Average' : 'Bad';
        const perfColor = completionRate >= 80 ? '#16a34a' : completionRate >= 50 ? '#ca8a04' : '#dc2626';
        return {
          id: emp._id,
          name: emp.name,
          department: emp.department,
          total: empTasks.length,
          done, inprogress, pending,
          totalHours, avgHours,
          completionRate, performance, perfColor,
          reports: empReports.length
        };
      });
      setEmpStats(stats);
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

  const COLORS = ['#16a34a', '#ca8a04', '#dc2626'];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>
      <div style={{ width: '220px', background: 'white', borderRight: '1px solid #eee', padding: '1rem 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 1rem 1rem', borderBottom: '1px solid #eee', marginBottom: '0.5rem' }}>
          <img src="/src/assets/logo.png" alt="Wexoraa" style={{ height: '32px', objectFit: 'contain' }} />
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

      <div style={{ flex: 1, padding: '1.5rem', overflow: 'auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Analytics</p>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Employee performance overview</p>
        </div>

        {/* Employee Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '1.5rem' }}>
          {empStats.map((emp) => (
            <div key={emp.id} onClick={() => setSelected(selected?.id === emp.id ? null : emp)}
              style={{ background: 'white', borderRadius: '10px', border: selected?.id === emp.id ? '2px solid #2563eb' : '1px solid #eee', padding: '1rem', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <p style={{ fontWeight: '500', margin: 0, fontSize: '14px' }}>{emp.name}</p>
                  <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>{emp.department}</p>
                </div>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: emp.perfColor + '20', color: emp.perfColor, fontWeight: '500' }}>
                  {emp.performance}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#555', marginBottom: '8px' }}>
                <span>Tasks: {emp.total}</span>
                <span>Done: {emp.done}</span>
                <span>Avg hrs: {emp.avgHours}h</span>
              </div>
              <div style={{ background: '#f3f4f6', borderRadius: '20px', height: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${emp.completionRate}%`, background: emp.perfColor, height: '100%', borderRadius: '20px' }} />
              </div>
              <p style={{ fontSize: '11px', color: '#888', margin: '4px 0 0', textAlign: 'right' }}>{emp.completionRate}% complete</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        {selected && (
          <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #eee', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: '500', margin: '0 0 1.5rem', fontSize: '16px' }}>{selected.name} - Detailed Analytics</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <p style={{ fontSize: '13px', color: '#888', margin: '0 0 1rem' }}>Task Status Breakdown</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={[
                      { name: 'Done', value: selected.done },
                      { name: 'In Progress', value: selected.inprogress },
                      { name: 'Pending', value: selected.pending }
                    ]} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#888', margin: '0 0 1rem' }}>Summary</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: 'Total Tasks', value: selected.total },
                    { label: 'Completed', value: selected.done },
                    { label: 'In Progress', value: selected.inprogress },
                    { label: 'Pending', value: selected.pending },
                    { label: 'Total Hours', value: `${selected.totalHours}h` },
                    { label: 'Avg Hours/Day', value: `${selected.avgHours}h` },
                    { label: 'Reports Submitted', value: selected.reports },
                    { label: 'Completion Rate', value: `${selected.completionRate}%` },
                  ].map((item) => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8f9fa', borderRadius: '8px' }}>
                      <span style={{ fontSize: '13px', color: '#555' }}>{item.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bar Chart - All employees */}
        <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #eee', padding: '1.5rem' }}>
          <p style={{ fontWeight: '500', margin: '0 0 1rem', fontSize: '15px' }}>Task Completion - All Employees</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={empStats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="done" name="Done" fill="#16a34a" />
              <Bar dataKey="inprogress" name="In Progress" fill="#ca8a04" />
              <Bar dataKey="pending" name="Pending" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;