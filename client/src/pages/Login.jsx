import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      if (res.data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#f0fdf4',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', width: '600px', height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(22,163,74,0.08) 0%, transparent 70%)',
        top: '-150px', left: '-150px', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', width: '400px', height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(22,163,74,0.06) 0%, transparent 70%)',
        bottom: '-100px', right: '-100px', pointerEvents: 'none'
      }} />

      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '4rem'
      }}>
        <img src="/logo.png" alt="Wexoraa" style={{ height: '52px', objectFit: 'contain', objectPosition: 'left', marginBottom: '2.5rem' }} />
        
        <h1 style={{ color: '#0f172a', fontSize: '38px', fontWeight: '700', margin: '0 0 1rem', lineHeight: 1.2 }}>
          Employee Management<br />
          <span style={{ color: '#16a34a' }}>Made Simple.</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '16px', margin: '0 0 2.5rem', lineHeight: 1.7 }}>
          Track attendance, manage tasks, and monitor performance — all in one place.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[
            { icon: '⏱', text: 'Real-time work timer with break tracking' },
            { icon: '📊', text: 'Advanced analytics & performance insights' },
            { icon: '📄', text: 'Monthly PDF report export' },
            { icon: '✅', text: 'Task management & daily reports' }
          ].map((item) => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: '#dcfce7', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '16px', flexShrink: 0
              }}>
                {item.icon}
              </div>
              <p style={{ color: '#334155', fontSize: '14px', margin: 0, fontWeight: '500' }}>{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - Login form */}
      <div style={{
        width: '480px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
      }}>
        <div style={{
          width: '100%', maxWidth: '380px',
          background: 'white',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img src="/logo.png" alt="Wexoraa" style={{ height: '40px', objectFit: 'contain', marginBottom: '1rem' }} />
            <h2 style={{ color: '#0f172a', fontSize: '22px', fontWeight: '600', margin: '0 0 4px' }}>Welcome back</h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: '500' }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@wexoraa.com"
                required
                style={{
                  width: '100%', padding: '11px 14px',
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '10px', fontSize: '14px',
                  color: '#0f172a', boxSizing: 'border-box',
                  outline: 'none', transition: 'border 0.2s'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#374151', marginBottom: '6px', fontWeight: '500' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%', padding: '11px 40px 11px 14px',
                    background: '#f8fafc',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '10px', fontSize: '14px',
                    color: '#0f172a', boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', cursor: 'pointer',
                    color: '#94a3b8', fontSize: '16px', userSelect: 'none'
                  }}
                >
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px', marginBottom: '1rem',
                fontSize: '13px', color: '#dc2626'
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? '#86efac' : '#16a34a',
                color: 'white', border: 'none',
                borderRadius: '10px', fontSize: '15px',
                fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(22,163,74,0.25)',
                transition: 'all 0.2s'
              }}
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#cbd5e1', marginTop: '1.5rem', margin: '1.5rem 0 0' }}>
            Wexoraa Infotech © 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;