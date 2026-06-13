import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Reports = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [reportRes, empRes, taskRes] = await Promise.all([
        API.get('/reports/all'),
        API.get('/employees'),
        API.get('/tasks')
      ]);
      setReports(reportRes.data);
      setEmployees(empRes.data);
      setTasks(taskRes.data);
    } catch (err) { console.log(err); }
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      // Fetch attendance for selected month
      const [year, month] = selectedMonth.split('-');
      const daysInMonth = new Date(year, month, 0).getDate();
      
      // Get all attendance records for the month
      let allAttendance = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const date = `${year}-${month}-${String(day).padStart(2, '0')}`;
        try {
          const res = await API.get(`/attendance/by-date?date=${date}`);
          allAttendance = [...allAttendance, ...res.data];
        } catch (err) {}
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;

      // Header
      doc.setFillColor(22, 163, 74);
      doc.rect(0, 0, pageWidth, 25, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Wexoraa Infotech', 14, 10);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Monthly Report - ${new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}`, 14, 18);
      doc.setTextColor(0, 0, 0);

      let yPos = 35;

      // ── Section 1: Attendance Summary ──
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 163, 74);
      doc.text('1. Attendance Summary', 14, yPos);
      yPos += 6;

      const attData = employees.map(emp => {
        const empAtt = allAttendance.filter(a => a.employee?._id === emp._id || a.employee === emp._id);
        const present = empAtt.filter(a => a.status === 'present').length;
        const late = empAtt.filter(a => a.status === 'late').length;
        const totalWorkMins = Math.round(empAtt.reduce((sum, a) => sum + (a.workSeconds || 0), 0) / 60);
        const totalBreakMins = Math.round(empAtt.reduce((sum, a) => sum + (a.breakSeconds || 0), 0) / 60);
        const totalBreaks = empAtt.reduce((sum, a) => sum + (a.breakCount || 0), 0);
        return [
          emp.name,
          emp.department || '-',
          present,
          late,
          present + late,
          `${Math.floor(totalWorkMins / 60)}h ${totalWorkMins % 60}m`,
          `${Math.floor(totalBreakMins / 60)}h ${totalBreakMins % 60}m`,
          totalBreaks
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [['Employee', 'Department', 'Present', 'Late', 'Total Days', 'Work Hours', 'Break Hours', 'Breaks']],
        body: attData,
        headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
      });

      yPos = doc.lastAutoTable.finalY + 12;

      // ── Section 2: Task Summary ──
      if (yPos > 240) { doc.addPage(); yPos = 20; }

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 163, 74);
      doc.text('2. Task Completion Summary', 14, yPos);
      yPos += 6;

      const taskData = employees.map(emp => {
        const empTasks = tasks.filter(t => t.assignedTo?._id === emp._id || t.assignedTo === emp._id);
        const done = empTasks.filter(t => t.status === 'done').length;
        const inprogress = empTasks.filter(t => t.status === 'inprogress').length;
        const pending = empTasks.filter(t => t.status === 'pending').length;
        const rate = empTasks.length > 0 ? Math.round((done / empTasks.length) * 100) : 0;
        const perf = rate >= 80 ? 'Good' : rate >= 50 ? 'Average' : 'Bad';
        return [emp.name, empTasks.length, done, inprogress, pending, `${rate}%`, perf];
      });

      autoTable(doc, {
        startY: yPos,
        head: [['Employee', 'Total Tasks', 'Done', 'In Progress', 'Pending', 'Completion %', 'Performance']],
        body: taskData,
        headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
      });

      yPos = doc.lastAutoTable.finalY + 12;

      // ── Section 3: Daily Reports Summary ──
      if (yPos > 240) { doc.addPage(); yPos = 20; }

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(22, 163, 74);
      doc.text('3. Daily Reports Summary', 14, yPos);
      yPos += 6;

      const monthReports = reports.filter(r => r.date?.startsWith(selectedMonth));
      const reportData = monthReports.map(r => [
        r.employee?.name || '-',
        r.date,
        `${r.hoursWorked} min`,
        r.tasksCompleted?.substring(0, 50) + (r.tasksCompleted?.length > 50 ? '...' : ''),
        r.blockers ? r.blockers.substring(0, 30) + '...' : 'None'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Employee', 'Date', 'Work Time', 'Tasks Completed', 'Blockers']],
        body: reportData.length > 0 ? reportData : [['No reports submitted', '', '', '', '']],
        headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        styles: { fontSize: 9 },
        margin: { left: 14, right: 14 }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 8);
      }

      doc.save(`Wexoraa_Report_${selectedMonth}.pdf`);
    } catch (err) {
      console.log('Export error:', err);
    } finally {
      setExporting(false);
    }
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
          <p style={{ fontSize: '11px', color: '#888', margin: '4px 0 0' }}>Admin Panel</p>
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
            <p style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Reports</p>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Daily reports & monthly export</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }} />
            <button onClick={handleExportPDF} disabled={exporting} style={{
              padding: '8px 16px', background: exporting ? '#aaa' : '#16a34a', color: 'white',
              border: 'none', borderRadius: '8px', cursor: exporting ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500'
            }}>
              {exporting ? 'Generating...' : '📄 Export PDF'}
            </button>
          </div>
        </div>

        {reports.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '10px', border: '1px solid #eee', padding: '3rem', textAlign: 'center', color: '#888' }}>
            No reports submitted yet
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {reports.map((r) => (
              <div key={r._id} onClick={() => setSelected(selected?._id === r._id ? null : r)} style={{
                background: 'white', borderRadius: '10px', border: '1px solid #eee',
                padding: '1rem', cursor: 'pointer',
                borderLeft: selected?._id === r._id ? '3px solid #16a34a' : '3px solid transparent'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <p style={{ fontWeight: '500', margin: 0, fontSize: '14px' }}>{r.employee?.name}</p>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#f0fdf4', color: '#16a34a' }}>{r.date}</span>
                </div>
                <p style={{ fontSize: '12px', color: '#555', margin: '0 0 4px' }}>
                  <strong>Work Time:</strong> {r.hoursWorked} min
                </p>
                <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                  {r.tasksCompleted?.substring(0, 80)}{r.tasksCompleted?.length > 80 ? '...' : ''}
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
            <p style={{ fontSize: '12px', color: '#888', margin: '0 0 1rem' }}>{selected.date} · {selected.hoursWorked} min worked</p>
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