import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, LogOut, User, Menu } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { isAuthenticated, role, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'status-chip-critical';
      case 'donor': return 'status-chip-active';
      case 'hospital': return 'status-chip-info';
      case 'bloodbank': return 'status-chip-pending';
      default: return '';
    }
  };

  const getRoleDisplayName = (role) => {
    if (!role) return '';
    if (role === 'bloodbank') return 'Blood Bank';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
      background: 'rgba(255, 255, 255, 0.75)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.4)',
      backdropFilter: 'saturate(180%) blur(20px)',
      WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      boxShadow: '0 2px 10px rgba(29, 53, 87, 0.02)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isAuthenticated && (
            <button 
              onClick={onToggleSidebar}
              className="btn btn-glass"
              style={{ padding: '8px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center' }}
              title="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>
          )}
          
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
            <HeartPulse size={32} style={{ fill: 'rgba(183, 16, 42, 0.1)' }} />
            <span className="navbar-logo-text" style={{ 
              fontFamily: 'var(--font-display)', 
              fontWeight: 800, 
              fontSize: '1.5rem', 
              color: 'var(--secondary)', 
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              Blood<span style={{ color: 'var(--primary)' }}>Link</span>
            </span>
          </Link>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn btn-secondary hide-on-mobile" style={{ padding: '8px 20px', fontSize: '0.875rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary navbar-action-btn">
                Join Network
              </Link>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span className={`status-chip ${getRoleBadgeClass(role)} navbar-role-badge`} style={{ textTransform: 'uppercase' }}>
                {getRoleDisplayName(role)}
              </span>
              
              <div className="navbar-user-section" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--secondary)' }}>
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  background: 'rgba(72, 95, 132, 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.5)'
                }}>
                  <User size={18} style={{ color: 'var(--secondary)' }} />
                </div>
                <span className="navbar-user-name" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {user?.name || user?.hospitalName || user?.bloodBankName || user?.email || 'User'}
                </span>
              </div>

              <button 
                onClick={handleLogout}
                className="btn btn-glass navbar-logout-btn"
                style={{ padding: '8px 16px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LogOut size={16} />
                <span className="navbar-logout-text">Logout</span>
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
