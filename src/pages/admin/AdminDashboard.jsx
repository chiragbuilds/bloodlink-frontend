import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import GlassCard from '../../components/GlassCard';
import { 
  ShieldCheck, 
  Activity, 
  Users, 
  Building, 
  Database, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const AdminDashboard = ({ activeTab }) => {
  // Aggregate Stats
  const [stats, setStats] = useState({
    donors: 0,
    hospitals: 0,
    bloodbanks: 0,
    pendingRequests: 0,
  });

  // Entities List State
  const [donors, setDonors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [bloodbanks, setBloodbanks] = useState([]);

  // Loaders
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch stats
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await api.get('/api/stats/');
      const data = response.data;
      setStats({
        donors: data.donors || data.totalDonors || 0,
        hospitals: data.hospitals || data.totalHospitals || 0,
        bloodbanks: data.bloodbanks || data.totalBloodbanks || 0,
        pendingRequests: data.pendingRequests || data.activeRequests || 0,
      });
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
      setErrorMsg('Failed to sync global networks analytics.');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'stats') {
      fetchStats();
    }
  }, [activeTab]);

  // Sync Lists based on Active Tab
  const fetchEntities = async () => {
    try {
      setLoadingList(true);
      setErrorMsg('');
      
      if (activeTab === 'donors') {
        const response = await api.get('/api/admin/donors');
        setDonors(response.data.donors || response.data || []);
      } else if (activeTab === 'hospitals') {
        const response = await api.get('/api/admin/hospitals');
        setHospitals(response.data.hospitals || response.data || []);
      } else if (activeTab === 'bloodbanks') {
        const response = await api.get('/api/admin/bloodbanks');
        setBloodbanks(response.data.bloodbanks || response.data || []);
      }
    } catch (err) {
      console.error(`Failed to fetch ${activeTab} list:`, err);
      setErrorMsg(`Failed to sync the ${activeTab} registry.`);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    if (['donors', 'hospitals', 'bloodbanks'].includes(activeTab)) {
      fetchEntities();
    }
  }, [activeTab]);

  // Entity verification trigger
  const handleVerify = async (role, entityId) => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      
      let endpoint = '';
      if (role === 'donor') endpoint = `/api/admin/donors/${entityId}/verify`;
      else if (role === 'hospital') endpoint = `/api/admin/hospitals/${entityId}/verify`;
      else if (role === 'bloodbank') endpoint = `/api/admin/bloodbanks/${entityId}/verify`;

      await api.put(endpoint);

      setSuccessMsg('Member verified successfully.');
      fetchEntities(); // reload matching list
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(`Failed to verify ${role}:`, err);
      setErrorMsg(`Failed to process verification command for this member.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--secondary)' }}>
          Platform Administration
        </h1>
        <p style={{ color: '#8fa0b5' }}>Global Registry & Member Verification Center</p>
      </div>

      {errorMsg && (
        <div style={{
          backgroundColor: 'rgba(186, 26, 26, 0.08)',
          border: '1px solid rgba(186, 26, 26, 0.2)',
          color: 'var(--error)',
          padding: '12px 16px',
          borderRadius: 'var(--radius-default)',
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{
          backgroundColor: 'rgba(40, 167, 69, 0.08)',
          border: '1px solid rgba(40, 167, 69, 0.2)',
          color: '#1e7e34',
          padding: '12px 16px',
          borderRadius: 'var(--radius-default)',
          fontSize: '0.9rem',
          fontWeight: 500
        }}>
          {successMsg}
        </div>
      )}

      {/* Global overview tab */}
      {activeTab === 'stats' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="grid-cols-4">
            <GlassCard style={{ padding: '32px 24px', textAlign: 'center' }}>
              <Users size={32} style={{ color: 'var(--secondary)', marginBottom: '16px', strokeWidth: 1.5 }} />
              <h3 style={{ fontSize: '2.25rem', marginBottom: '8px', color: 'var(--secondary)' }}>
                {loadingStats ? '...' : stats.donors}
              </h3>
              <p className="label-sm" style={{ color: '#8fa0b5' }}>Registered Donors</p>
            </GlassCard>

            <GlassCard style={{ padding: '32px 24px', textAlign: 'center' }}>
              <Building size={32} style={{ color: 'var(--primary)', marginBottom: '16px', strokeWidth: 1.5 }} />
              <h3 style={{ fontSize: '2.25rem', marginBottom: '8px', color: 'var(--secondary)' }}>
                {loadingStats ? '...' : stats.hospitals}
              </h3>
              <p className="label-sm" style={{ color: '#8fa0b5' }}>Affiliated Clinics</p>
            </GlassCard>

            <GlassCard style={{ padding: '32px 24px', textAlign: 'center' }}>
              <Database size={32} style={{ color: 'var(--tertiary)', marginBottom: '16px', strokeWidth: 1.5 }} />
              <h3 style={{ fontSize: '2.25rem', marginBottom: '8px', color: 'var(--secondary)' }}>
                {loadingStats ? '...' : stats.bloodbanks}
              </h3>
              <p className="label-sm" style={{ color: '#8fa0b5' }}>Active Blood Banks</p>
            </GlassCard>

            <GlassCard style={{ padding: '32px 24px', textAlign: 'center' }}>
              <ShieldCheck size={32} style={{ color: 'var(--primary)', marginBottom: '16px', strokeWidth: 1.5 }} />
              <h3 style={{ fontSize: '2.25rem', marginBottom: '8px', color: 'var(--primary)' }}>
                {loadingStats ? '...' : stats.pendingRequests}
              </h3>
              <p className="label-sm" style={{ color: '#8fa0b5' }}>Unresolved Demands</p>
            </GlassCard>
          </div>

          <GlassCard style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '16px' }}>Regulatory System Overview</h3>
            <p style={{ color: '#5b6a7e', fontSize: '0.95rem', lineHeight: '1.7' }}>
              As a global network administrator, you have access to the full registry of users. 
              Before new clinics, blood centers, or donor profiles can accept transits or request emergency blood units, 
              they must undergo validation checkmarks in their respective menus.
            </p>
          </GlassCard>
        </div>
      )}

      {/* Donors Tab */}
      {activeTab === 'donors' && (
        <GlassCard style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '24px' }}>Verify Donor Profiles</h3>
          {loadingList ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Activity size={24} className="animate-fade-in" style={{ animation: 'spin 1.5s linear infinite', color: 'var(--primary)' }} />
              <p style={{ marginTop: '8px', color: '#8fa0b5' }}>Syncing donors...</p>
            </div>
          ) : donors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8fa0b5' }}>
              <AlertCircle size={40} style={{ strokeWidth: 1, marginBottom: '16px' }} />
              <p>No donors registered in the database.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(72, 95, 132, 0.1)', color: 'var(--secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>Name</th>
                    <th style={{ padding: '12px 16px' }}>Email</th>
                    <th style={{ padding: '12px 16px' }}>Blood Group</th>
                    <th style={{ padding: '12px 16px' }}>Phone</th>
                    <th style={{ padding: '12px 16px' }}>City</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {donors.map((donor) => (
                    <tr key={donor._id || donor.id} style={{ borderBottom: '1px solid rgba(72, 95, 132, 0.05)', fontSize: '0.95rem' }}>
                      <td style={{ padding: '16px', fontWeight: 600, color: 'var(--secondary)' }}>
                        {donor.name || 'Anonymous Donor'}
                      </td>
                      <td style={{ padding: '16px' }}>{donor.email}</td>
                      <td style={{ padding: '16px', fontWeight: 700, color: 'var(--primary)' }}>
                        {donor.bloodGroup}
                      </td>
                      <td style={{ padding: '16px', color: '#5b6a7e' }}>
                        {donor.phone}
                      </td>
                      <td style={{ padding: '16px', color: '#5b6a7e' }}>
                        {donor.city || '-'}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span className={`status-chip ${donor.verified ? 'status-chip-active' : 'status-chip-pending'}`}>
                          {donor.verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {!donor.verified ? (
                          <button
                            onClick={() => handleVerify('donor', donor._id || donor.id)}
                            disabled={isSubmitting}
                            className="btn btn-primary"
                            style={{ padding: '6px 16px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <CheckCircle size={12} />
                            <span>Verify Profile</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: '#8fa0b5', fontWeight: 600 }}>Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      )}

      {/* Hospitals Tab */}
      {activeTab === 'hospitals' && (
        <GlassCard style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '24px' }}>Verify Clinics & Surgical Centers</h3>
          {loadingList ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Activity size={24} className="animate-fade-in" style={{ animation: 'spin 1.5s linear infinite', color: 'var(--primary)' }} />
              <p style={{ marginTop: '8px', color: '#8fa0b5' }}>Syncing clinics...</p>
            </div>
          ) : hospitals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8fa0b5' }}>
              <AlertCircle size={40} style={{ strokeWidth: 1, marginBottom: '16px' }} />
              <p>No hospitals registered in the database.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(72, 95, 132, 0.1)', color: 'var(--secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>Hospital Name</th>
                    <th style={{ padding: '12px 16px' }}>Email</th>
                    <th style={{ padding: '12px 16px' }}>Address</th>
                    <th style={{ padding: '12px 16px' }}>Contact Phone</th>
                    <th style={{ padding: '12px 16px' }}>City</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {hospitals.map((hosp) => (
                    <tr key={hosp._id || hosp.id} style={{ borderBottom: '1px solid rgba(72, 95, 132, 0.05)', fontSize: '0.95rem' }}>
                      <td style={{ padding: '16px', fontWeight: 600, color: 'var(--secondary)' }}>
                        {hosp.name || 'Clinical Center'}
                      </td>
                      <td style={{ padding: '16px' }}>{hosp.email}</td>
                      <td style={{ padding: '16px', color: '#5b6a7e', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {hosp.address}
                      </td>
                      <td style={{ padding: '16px' }}>{hosp.phone}</td>
                      <td style={{ padding: '16px', color: '#5b6a7e' }}>{hosp.city}</td>
                      <td style={{ padding: '16px' }}>
                        <span className={`status-chip ${hosp.verified ? 'status-chip-active' : 'status-chip-pending'}`}>
                          {hosp.verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {!hosp.verified ? (
                          <button
                            onClick={() => handleVerify('hospital', hosp._id || hosp.id)}
                            disabled={isSubmitting}
                            className="btn btn-primary"
                            style={{ padding: '6px 16px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <CheckCircle size={12} />
                            <span>Verify Center</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: '#8fa0b5', fontWeight: 600 }}>Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      )}

      {/* Bloodbanks Tab */}
      {activeTab === 'bloodbanks' && (
        <GlassCard style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '24px' }}>Verify Blood Repositories</h3>
          {loadingList ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Activity size={24} className="animate-fade-in" style={{ animation: 'spin 1.5s linear infinite', color: 'var(--primary)' }} />
              <p style={{ marginTop: '8px', color: '#8fa0b5' }}>Syncing repositories...</p>
            </div>
          ) : bloodbanks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8fa0b5' }}>
              <AlertCircle size={40} style={{ strokeWidth: 1, marginBottom: '16px' }} />
              <p>No blood banks registered in the database.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(72, 95, 132, 0.1)', color: 'var(--secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>Bank Name</th>
                    <th style={{ padding: '12px 16px' }}>Email</th>
                    <th style={{ padding: '12px 16px' }}>Address</th>
                    <th style={{ padding: '12px 16px' }}>Contact Phone</th>
                    <th style={{ padding: '12px 16px' }}>City</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bloodbanks.map((bank) => (
                    <tr key={bank._id || bank.id} style={{ borderBottom: '1px solid rgba(72, 95, 132, 0.05)', fontSize: '0.95rem' }}>
                      <td style={{ padding: '16px', fontWeight: 600, color: 'var(--secondary)' }}>
                        {bank.name || 'Storage Bank'}
                      </td>
                      <td style={{ padding: '16px' }}>{bank.email}</td>
                      <td style={{ padding: '16px', color: '#5b6a7e', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {bank.address}
                      </td>
                      <td style={{ padding: '16px' }}>{bank.phone}</td>
                      <td style={{ padding: '16px', color: '#5b6a7e' }}>{bank.city}</td>
                      <td style={{ padding: '16px' }}>
                        <span className={`status-chip ${bank.verified ? 'status-chip-active' : 'status-chip-pending'}`}>
                          {bank.verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {!bank.verified ? (
                          <button
                            onClick={() => handleVerify('bloodbank', bank._id || bank.id)}
                            disabled={isSubmitting}
                            className="btn btn-primary"
                            style={{ padding: '6px 16px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <CheckCircle size={12} />
                            <span>Verify Depot</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: '#8fa0b5', fontWeight: 600 }}>Active</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
};

export default AdminDashboard;
