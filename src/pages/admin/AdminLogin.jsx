import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const { login } = useAuth();
  const [AdminID, setAdminID] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!AdminID || !password) {
      setError('Please enter both admin ID and password.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await login('admin', AdminID, password);
      navigate('/admin-dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      position: 'relative'
    }}>
      {/* Background gradients */}
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

      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '40px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--secondary)', marginBottom: '8px' }}>
            System Administrator
          </h2>
          <p style={{ color: '#8fa0b5', fontSize: '0.9rem' }}>
            Secure Portal Verification
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="input-group">
            <label className="input-label" htmlFor="admin-id-input">Admin ID</label>
            <input
              id="admin-id-input"
              type="text"
              placeholder="Enter your administrative key"
              value={AdminID}
              onChange={(e) => setAdminID(e.target.value)}
              className="input-field"
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password-input">Security Password</label>
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
            {isSubmitting ? 'Authenticating Access...' : 'Authenticate Access'}
          </button>
        </form>

        {error && (
          <div style={{
            backgroundColor: 'rgba(186, 26, 26, 0.08)',
            border: '1px solid rgba(186, 26, 26, 0.2)',
            color: 'var(--error)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-default)',
            fontSize: '0.85rem',
            fontWeight: 500,
            marginTop: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;