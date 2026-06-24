import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '16px',
        backgroundColor: 'var(--background)'
      }}>
        <Activity size={48} className="animate-fade-in" style={{ color: 'var(--primary)', animation: 'spin 2s linear infinite' }} />
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--secondary)' }}>Loading your secure session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page, saving the original landing location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If authenticated but role is unauthorized, redirect to standard dashboard for that role
    if (role === 'donor') return <Navigate to="/donor-dashboard" replace />;
    if (role === 'hospital') return <Navigate to="/hospital-dashboard" replace />;
    if (role === 'bloodbank') return <Navigate to="/bloodbank-dashboard" replace />;
    if (role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
