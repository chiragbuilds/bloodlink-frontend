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
    // <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
    //       <div className="input-group">
    //         <label className="input-label" htmlFor="admin-id-input">Admin ID</label>
    //         <input
    //           id="email-input"
    //           type="text"
    //           placeholder="e.g. nurse.smith@hospital.org"
    //           value={AdminID}
    //           onChange={(e) => setAdminID(e.target.value)}
    //           className="input-field"
    //           required
    //         />
    //       </div>

    //       <div className="input-group">
    //         <label className="input-label" htmlFor="password-input">Password</label>
    //         <input
    //           id="password-input"
    //           type="password"
    //           placeholder="••••••••"
    //           value={password}
    //           onChange={(e) => setPassword(e.target.value)}
    //           className="input-field"
    //           required
    //         />
    //       </div>

    //       <button
    //         type="submit"
    //         className="btn btn-primary"
    //         style={{ width: '100%', padding: '14px', marginTop: '8px' }}
    //       >
    //       </button>
    //     </form>
    <form 
  onSubmit={handleSubmit} 
  style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px', 
    maxWidth: '400px', 
    margin: '0 auto',
    fontFamily: 'sans-serif'
  }}
>
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
    <label 
      htmlFor="admin-id-input"
      style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}
    >
      Admin ID
    </label>
    <input
      id="admin-id-input"
      type="text"
      placeholder="enter your admin ID"
      value={AdminID}
      onChange={(e) => setAdminID(e.target.value)}
      required
      style={{
        padding: '12px 16px',
        fontSize: '16px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        color: '#111827',
        outline: 'none'
      }}
    />
  </div>

  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
    <label 
      htmlFor="password-input"
      style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}
    >
      Password
    </label>
    <input
      id="password-input"
      type="password"
      placeholder="••••••••"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      style={{
        padding: '12px 16px',
        fontSize: '16px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        backgroundColor: '#ffffff',
        color: '#111827',
        outline: 'none'
      }}
    />
  </div>

  <button
    type="submit"
    style={{ 
      width: '100%', 
      padding: '14px', 
      marginTop: '8px',
      backgroundColor: '#2563eb',
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: '600',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer'
    }}
  >
    Sign In
  </button>
  <div className="">
    {error.length > 0 ? error : null}
  </div>
</form>
  )
}
export default AdminLogin;