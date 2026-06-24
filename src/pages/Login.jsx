import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { Heart, Activity, Shield, Building, Database } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedRole, setSelectedRole] = useState('donor'); // donor, hospital, bloodbank, admin
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine redirection target (fallback to dashboard matching the role)
  const from = location.state?.from?.pathname || `/${selectedRole}-dashboard`;

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await login(selectedRole, email, password);
      // Wait for auth context to update and redirect
      const targetPath = `/${selectedRole}-dashboard`;
      navigate(targetPath, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'donor': return <Heart size={16} />;
      case 'hospital': return <Building size={16} />;
      case 'bloodbank': return <Database size={16} />;
      case 'admin': return <Shield size={16} />;
      default: return null;
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative'
    }}>
      {/* Visual background lights */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '25%',
        width: '250px',
        height: '250px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(183, 16, 42, 0.05) 0%, rgba(255, 255, 255, 0) 70%)',
        zIndex: -1
      }} />
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '25%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(72, 95, 132, 0.05) 0%, rgba(255, 255, 255, 0) 70%)',
        zIndex: -1
      }} />

      <GlassCard style={{ width: '100%', maxWidth: '480px', padding: '40px 32px' }} className="animate-slide-up">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--secondary)', marginBottom: '8px' }}>
            Account Sign In
          </h2>
          <p style={{ color: '#8fa0b5', fontSize: '0.9rem' }}>
            Choose your network role to access your workspace
          </p>
        </div>

        {/* Role Tab Selector */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '4px',
          backgroundColor: '#edf2f4',
          padding: '4px',
          borderRadius: 'var(--radius-default)',
          marginBottom: '24px'
        }}>
          {['donor', 'hospital', 'bloodbank', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '10px 4px',
                border: 'none',
                background: selectedRole === role ? '#ffffff' : 'transparent',
                color: selectedRole === role ? 'var(--secondary)' : '#8fa0b5',
                borderRadius: 'calc(var(--radius-default) - 2px)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                transition: 'all var(--transition-fast)'
              }}
            >
              {getRoleIcon(role)}
              <span>{role === 'bloodbank' ? 'Bank' : role}</span>
            </button>
          ))}
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: 'rgba(186, 26, 26, 0.08)',
            border: '1px solid rgba(186, 26, 26, 0.2)',
            color: 'var(--error)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-default)',
            fontSize: '0.85rem',
            fontWeight: 500,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>&times;</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="input-group">
            <label className="input-label" htmlFor="email-input">Email Address</label>
            <input
              id="email-input"
              type="email"
              placeholder="e.g. nurse.smith@hospital.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password-input">Password</label>
            <input
              id="password-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '8px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} className="animate-fade-in" style={{ animation: 'spin 1.5s linear infinite' }} />
                Authenticating...
              </span>
            ) : (
              `Access as ${selectedRole === 'bloodbank' ? 'Blood Bank' : selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
            )}
          </button>
        </form>

        {selectedRole !== 'admin' && (
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#5b6a7e' }}>
            Don't have an account?{' '}
            <Link to={`/register?role=${selectedRole}`} style={{ fontWeight: 600, color: 'var(--primary)' }}>
              Register here
            </Link>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

export default Login;
