import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  Droplet, 
  Settings, 
  PlusCircle, 
  Database, 
  ClipboardList, 
  ShieldCheck,
  Building,
  Heart
} from 'lucide-react';

const Sidebar = ({ isOpen, activeTab, setActiveTab }) => {
  const { role } = useAuth();

  if (!isOpen) return null;

  const renderNavLinks = () => {
    switch (role) {
      case 'donor':
        return (
          <>
            <button 
              onClick={() => setActiveTab('overview')}
              className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}
            >
              <Activity size={18} />
              <span>Availability & Stats</span>
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`sidebar-link ${activeTab === 'requests' ? 'active' : ''}`}
            >
              <Droplet size={18} />
              <span>Blood Requests</span>
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <Settings size={18} />
              <span>Donor Settings</span>
            </button>
          </>
        );
      case 'hospital':
        return (
          <>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`sidebar-link ${activeTab === 'requests' ? 'active' : ''}`}
            >
              <ClipboardList size={18} />
              <span>My Requests</span>
            </button>
            <button 
              onClick={() => setActiveTab('new-request')}
              className={`sidebar-link ${activeTab === 'new-request' ? 'active' : ''}`}
            >
              <PlusCircle size={18} />
              <span>Request Blood</span>
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <Settings size={18} />
              <span>Hospital Details</span>
            </button>
          </>
        );
      case 'bloodbank':
        return (
          <>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`sidebar-link ${activeTab === 'inventory' ? 'active' : ''}`}
            >
              <Database size={18} />
              <span>Blood Stocks</span>
            </button>
            <button 
              onClick={() => setActiveTab('requests')}
              className={`sidebar-link ${activeTab === 'requests' ? 'active' : ''}`}
            >
              <Droplet size={18} />
              <span>Matched Requests</span>
            </button>
            <button 
              onClick={() => setActiveTab('accepted')}
              className={`sidebar-link ${activeTab === 'accepted' ? 'active' : ''}`}
            >
              <ClipboardList size={18} />
              <span>Accepted Escorts</span>
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}
            >
              <Settings size={18} />
              <span>Bank Settings</span>
            </button>
          </>
        );
      case 'admin':
        return (
          <>
            <button 
              onClick={() => setActiveTab('stats')}
              className={`sidebar-link ${activeTab === 'stats' ? 'active' : ''}`}
            >
              <Activity size={18} />
              <span>Global Overview</span>
            </button>
            <button 
              onClick={() => setActiveTab('donors')}
              className={`sidebar-link ${activeTab === 'donors' ? 'active' : ''}`}
            >
              <Heart size={18} />
              <span>Verify Donors</span>
            </button>
            <button 
              onClick={() => setActiveTab('hospitals')}
              className={`sidebar-link ${activeTab === 'hospitals' ? 'active' : ''}`}
            >
              <Building size={18} />
              <span>Verify Hospitals</span>
            </button>
            <button 
              onClick={() => setActiveTab('bloodbanks')}
              className={`sidebar-link ${activeTab === 'bloodbanks' ? 'active' : ''}`}
            >
              <Database size={18} />
              <span>Verify Blood Banks</span>
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <aside style={{
      width: '260px',
      flexShrink: 0,
      background: 'rgba(255, 255, 255, 0.65)',
      borderRight: '1px solid rgba(255, 255, 255, 0.4)',
      backdropFilter: 'saturate(180%) blur(20px)',
      WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      alignSelf: 'stretch'
    }}>
      <style>{`
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 14px 16px;
          border-radius: var(--radius-default);
          border: none;
          background: transparent;
          color: var(--secondary);
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .sidebar-link:hover {
          background: rgba(72, 95, 132, 0.08);
          color: var(--secondary);
        }
        
        .sidebar-link.active {
          background: var(--secondary);
          color: var(--on-secondary);
          box-shadow: 0 4px 12px rgba(72, 95, 132, 0.15);
        }
      `}</style>
      
      <div style={{
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#8fa0b5',
        paddingLeft: '16px',
        marginBottom: '12px'
      }}>
        Dashboard Menu
      </div>
      
      {renderNavLinks()}
    </aside>
  );
};

export default Sidebar;
