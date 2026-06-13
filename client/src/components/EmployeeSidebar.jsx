import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EmployeeSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const sidebarItems = [
    { label: 'Dashboard', path: '/employee/dashboard', icon: '🏠' },
    { label: 'My Tasks', path: '/employee/tasks', icon: '✅' },
    { label: 'Daily Report', path: '/employee/report', icon: '📝' },
  ];

  return (
    <div style={{
      width: '240px', flexShrink: 0,
      background: 'white',
      borderRight: '1px solid #e2e8f0',
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh',
      boxShadow: '2px 0 8px rgba(0,0,0,0.04)'
    }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
        <img src="/logo.png" alt="Wexoraa" style={{ height: '36px', objectFit: 'contain', objectPosition: 'left' }} />
        <p style={{ fontSize: '11px', color: '#94a3b8', margin: '6px 0 0', fontWeight: '500', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Employee Portal</p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0.75rem 0' }}>
        {sidebarItems.map((item) => {
          const isActive = window.location.pathname === item.path;
          return (
            <div key={item.path} onClick={() => navigate(item.path)} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px 1.25rem', cursor: 'pointer',
              margin: '2px 0.5rem', borderRadius: '10px',
              background: isActive ? '#f0fdf4' : 'transparent',
              color: isActive ? '#16a34a' : '#475569',
              fontWeight: isActive ? '600' : '400',
              fontSize: '14px', transition: 'all 0.15s'
            }}>
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
              {isActive && <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />}
            </div>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: '#dcfce7', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '14px', fontWeight: '600', color: '#16a34a', flexShrink: 0
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: '#0f172a' }}>{user?.name}</p>
            <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Employee</p>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '8px',
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '8px', color: '#dc2626',
          fontSize: '13px', cursor: 'pointer', fontWeight: '500'
        }}>Logout</button>
      </div>
    </div>
  );
};

export default EmployeeSidebar;