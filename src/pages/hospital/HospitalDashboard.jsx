import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import GlassCard from '../../components/GlassCard';
import { 
  Building, 
  Activity, 
  PlusCircle, 
  ClipboardList, 
  AlertCircle, 
  CheckCircle2, 
  Trash2,
  Phone,
  MapPin
} from 'lucide-react';

const HospitalDashboard = ({ activeTab, setActiveTab }) => {
  const { id, user, updateUserLocalState } = useAuth();

  // Profile info state
  const [hospitalDetails, setHospitalDetails] = useState(user || null);
  const [requests, setRequests] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Request form state
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [unitsRequired, setUnitsRequired] = useState('1');
  const [priority, setPriority] = useState('normal');

  // Hospital edit fields state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  // Sync details from server on mount
  useEffect(() => {
    const fetchHospitalDetails = async () => {
      try {
        setLoadingDetails(true);
        const response = await api.get(`/api/hospital/${id}`);
        const data = response.data;
        const details = data.hospital || data;
        
        setHospitalDetails(details);
        updateUserLocalState(details);

        setName(details.name || '');
        setAddress(details.address || '');
        setPhone(details.phone || '');
        setCity(details.city || '');
      } catch (err) {
        console.error('Error fetching hospital profiles:', err);
        setErrorMsg('Failed to sync hospital information with the server.');
      } finally {
        setLoadingDetails(false);
      }
    };

    if (id) {
      fetchHospitalDetails();
    }
  }, [id]);

  // Sync hospital requests
  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      setErrorMsg('');
      const response = await api.get(`/api/hospital/${id}/requests`);
      const data = response.data;
      setRequests(data.requests || data || []);
    } catch (err) {
      console.error('Error fetching hospital requests:', err);
      setErrorMsg('Failed to sync blood requests logs.');
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (id && activeTab === 'requests') {
      fetchRequests();
    }
  }, [id, activeTab]);

  // Handle Request Submission
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      setSuccessMsg('');

      if (Number(unitsRequired) <= 0) {
        throw new Error('Requested blood units must be greater than 0.');
      }

      await api.post(`/api/hospital/${id}/requests`, {
        bloodGroup,
        unitsRequired: Number(unitsRequired),
        priority,
        city: city || hospitalDetails?.city
      });

      setSuccessMsg('Blood request registered in the network successfully!');
      
      // Reset request fields
      setBloodGroup('O+');
      setUnitsRequired('1');
      setPriority('normal');

      // Switch to list view tab after brief delay
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('requests');
      }, 2000);
    } catch (err) {
      console.error('Failed to register blood request:', err);
      setErrorMsg(err.message || 'Error processing blood request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Request Cancellation
  const handleCancelRequest = async (requestId) => {
    const confirmed = window.confirm('Are you sure you want to cancel and delete this request?');
    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      
      // Endpoint: DELETE /api/hospital/:hospitalId/requests/:requestId
      await api.delete(`/api/hospital/${id}/requests/${requestId}`);
      
      setSuccessMsg('Request deleted successfully.');
      fetchRequests(); // reload list
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to cancel request:', err);
      setErrorMsg('Could not process request deletion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const strippedPhone = phone.replace(/\D/g, '');
    if (strippedPhone.length !== 10) {
      setErrorMsg('Phone number must be exactly 10 digits (e.g. 9876543210).');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.put(`/api/hospital/${id}`, {
        name,
        address,
        phone: strippedPhone,
        city
      });

      const updated = response.data.hospital || response.data;
      setHospitalDetails(updated);
      updateUserLocalState(updated);
      setSuccessMsg('Hospital credentials updated successfully!');

      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to save hospital settings:', err);
      setErrorMsg('Could not update hospital records.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingDetails) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Activity size={32} className="animate-fade-in" style={{ animation: 'spin 1.5s linear infinite', color: 'var(--primary)' }} />
        <p style={{ marginTop: '16px', color: 'var(--secondary)' }}>Accessing clinical terminal...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--secondary)' }}>
          {hospitalDetails?.name || 'Hospital Workspace'}
        </h1>
        <p style={{ color: '#8fa0b5' }}>Clinical Transfusion Logistics Dashboard</p>
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

      {/* Requests log panel */}
      {activeTab === 'requests' && (
        <GlassCard style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3>Dispatched Supply Requests</h3>
              <p style={{ color: '#8fa0b5', fontSize: '0.9rem' }}>Trace live and resolved blood requests</p>
            </div>
            <button 
              onClick={() => setActiveTab('new-request')}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <PlusCircle size={16} />
              <span>Create New Request</span>
            </button>
          </div>

          {loadingRequests ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Activity size={24} className="animate-fade-in" style={{ animation: 'spin 1.5s linear infinite', color: 'var(--primary)' }} />
              <p style={{ marginTop: '8px', color: '#8fa0b5' }}>Querying logistics database...</p>
            </div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8fa0b5' }}>
              <ClipboardList size={40} style={{ strokeWidth: 1, marginBottom: '16px' }} />
              <p>No blood supply requests have been recorded for this center.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(72, 95, 132, 0.1)', color: 'var(--secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>Request ID</th>
                    <th style={{ padding: '12px 16px' }}>Blood Group</th>
                    <th style={{ padding: '12px 16px' }}>Volume (Units)</th>
                    <th style={{ padding: '12px 16px' }}>Priority</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Reason / Details</th>
                    <th style={{ padding: '12px 16px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req._id || req.id} style={{ borderBottom: '1px solid rgba(72, 95, 132, 0.05)', fontSize: '0.95rem' }}>
                      <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#8fa0b5' }}>
                        {(req._id || req.id).substring(0, 8).toUpperCase()}...
                      </td>
                      <td style={{ padding: '16px', fontWeight: 700, color: 'var(--primary)' }}>
                        {req.bloodGroup}
                      </td>
                      <td style={{ padding: '16px' }}>{req.unitsRequired} Units</td>
                      <td style={{ padding: '16px' }}>
                        <span className={`status-chip ${req.priority === 'critical' ? 'status-chip-critical' : 'status-chip-pending'}`}>
                          {req.priority || 'Normal'}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span className={`status-chip ${
                          req.status === 'Completed' || req.status === 'completed' ? 'status-chip-active' :
                          req.status === 'Accepted' || req.status === 'accepted' ? 'status-chip-info' :
                          'status-chip-pending'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#5b6a7e', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.reason || '-'}
                      </td>
                      <td style={{ padding: '16px' }}>
                        {req.status === 'Pending' || req.status === 'pending' ? (
                          <button
                            onClick={() => handleCancelRequest(req._id || req.id)}
                            disabled={isSubmitting}
                            className="btn btn-glass"
                            style={{ 
                              padding: '6px 12px', 
                              fontSize: '0.8rem', 
                              color: 'var(--error)', 
                              borderColor: 'rgba(186, 26, 26, 0.15)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="Cancel Request"
                          >
                            <Trash2 size={12} />
                            <span>Cancel</span>
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#8fa0b5', fontWeight: 600 }}>Locked</span>
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

      {/* New supply request form */}
      {activeTab === 'new-request' && (
        <GlassCard style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '24px' }}>Dispatch Blood Supply Request</h3>
          <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="grid-cols-3">
              <div className="input-group">
                <label className="input-label" htmlFor="req-bloodgroup">Blood Group Required</label>
                <select
                  id="req-bloodgroup"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="input-field select-field"
                  required
                  disabled={isSubmitting}
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="req-units">Quantity Needed (Units)</label>
                <input
                  id="req-units"
                  type="number"
                  value={unitsRequired}
                  onChange={(e) => setUnitsRequired(e.target.value)}
                  className="input-field"
                  required
                  min={1}
                  disabled={isSubmitting}
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="req-priority">Priority Urgency Level</label>
                <select
                  id="req-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="input-field select-field"
                  required
                  disabled={isSubmitting}
                >
                  <option value="normal">Normal (Stocking / Scheduler)</option>
                  <option value="critical">Critical Emergency (Immediate Alert)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start', padding: '12px 32px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Posting Request...' : 'Dispatch Request'}
            </button>
          </form>
        </GlassCard>
      )}

      {/* Hospital settings */}
      {activeTab === 'profile' && (
        <GlassCard style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '24px' }}>Update Clinic Profile</h3>
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="grid-cols-2">
              <div className="input-group">
                <label className="input-label" htmlFor="hosp-profile-name">Hospital Name</label>
                <input
                  id="hosp-profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="hosp-profile-contact">Contact Phone Number</label>
                <input
                  id="hosp-profile-contact"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="grid-cols-2">
              <div className="input-group">
                <label className="input-label" htmlFor="hosp-profile-address">Clinic Physical Address</label>
                <input
                  id="hosp-profile-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="hosp-profile-city">City</label>
                <input
                  id="hosp-profile-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="input-field"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start', padding: '12px 32px' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating settings...' : 'Save Settings'}
            </button>
          </form>
        </GlassCard>
      )}
    </div>
  );
};

export default HospitalDashboard;
