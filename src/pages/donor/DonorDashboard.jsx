import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import GlassCard from '../../components/GlassCard';
import { 
  Heart, 
  Activity, 
  Calendar, 
  ToggleLeft, 
  ToggleRight, 
  User, 
  Droplet, 
  AlertCircle, 
  Trash2,
  CheckCircle2,
  Phone,
  MapPin
} from 'lucide-react';

const DonorDashboard = ({ activeTab }) => {
  const { id, user, logout, updateUserLocalState } = useAuth();
  
  // States
  const [donorDetails, setDonorDetails] = useState(user || null);
  const [requests, setRequests] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editing profile fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');

  // Fetch Donor details on mount or ID change
  useEffect(() => {
    const fetchDonorDetails = async () => {
      try {
        setLoadingDetails(true);
        const response = await api.get(`/api/donor/${id}`);
        const data = response.data;
        const details = data.donor || data;
        setDonorDetails(details);
        updateUserLocalState(details);
        
        // Prep form fields
        setName(details.name || '');
        setPhone(details.phone || '');
        setCity(details.city || '');
        setBloodGroup(details.bloodGroup || 'O+');
      } catch (err) {
        console.error('Error fetching donor profile:', err);
        setErrorMsg('Could not sync donor profile from server.');
      } finally {
        setLoadingDetails(false);
      }
    };

    if (id) {
      fetchDonorDetails();
    }
  }, [id]);

  // Fetch matching blood requests
  useEffect(() => {
    const fetchRequests = async () => {
      if (activeTab !== 'requests') return;
      try {
        setLoadingRequests(true);
        setErrorMsg('');
        const response = await api.get(`/api/donor/${id}/requests`);
        const data = response.data;
        setRequests(data.requests || data || []);
      } catch (err) {
        console.error('Error fetching donor matched requests:', err);
        setErrorMsg('Failed to pull matching blood requests.');
      } finally {
        setLoadingRequests(false);
      }
    };

    if (id && activeTab === 'requests') {
      fetchRequests();
    }
  }, [id, activeTab]);

  // Handle Availability Toggle
  const handleToggleAvailability = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      
      const newAvailabilityState = !donorDetails.available;
      
      const response = await api.put(`/api/donor/${id}/availability`, {
        available: newAvailabilityState
      });
      
      const updated = response.data.donor || response.data;
      setDonorDetails(prev => ({ ...prev, available: newAvailabilityState }));
      updateUserLocalState({ ...donorDetails, available: newAvailabilityState });
      setSuccessMsg(`Availability successfully updated to: ${newAvailabilityState ? 'Available' : 'Unavailable'}`);
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Availability toggle failure:', err);
      setErrorMsg('Failed to change availability status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Record Donation (sets last donation date to today)
  const handleRecordDonation = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      
      const response = await api.put(`/api/donor/${id}/donate`);
      const updated = response.data.donor || response.data;
      
      // Update local states
      setDonorDetails(updated);
      updateUserLocalState(updated);
      setSuccessMsg('Donation logged successfully! Next eligibility date recalculated.');
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Record donation failure:', err);
      setErrorMsg('Could not register donation event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Profile Info
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
      
      const response = await api.put(`/api/donor/${id}`, {
        name,
        phone: strippedPhone,
        city,
        bloodGroup
      });

      const updated = response.data.donor || response.data;
      setDonorDetails(updated);
      updateUserLocalState(updated);
      setSuccessMsg('Profile updated successfully!');
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Profile update failure:', err);
      setErrorMsg(err.message || 'Failed to save profile changes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'WARNING: Are you absolutely sure you want to delete your donor profile? This action is irreversible.'
    );
    if (!confirmed) return;

    try {
      setIsSubmitting(true);
      await api.delete(`/api/donor/${id}`);
      alert('Your donor account has been successfully deleted.');
      logout();
    } catch (err) {
      console.error('Account deletion failure:', err);
      setErrorMsg('Failed to process account deletion.');
      setIsSubmitting(false);
    }
  };

  // Calculate Eligibility based on last donation (90 days limit)
  const calculateEligibility = () => {
    if (!donorDetails?.lastDonationDate) {
      return { eligible: true, daysRemaining: 0 };
    }
    const lastDate = new Date(donorDetails.lastDonationDate);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 90) {
      return { eligible: true, daysRemaining: 0 };
    } else {
      return { eligible: false, daysRemaining: 90 - diffDays };
    }
  };

  if (loadingDetails) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Activity size={32} className="animate-fade-in" style={{ animation: 'spin 1.5s linear infinite', color: 'var(--primary)' }} />
        <p style={{ marginTop: '16px', color: 'var(--secondary)' }}>Retrieving donor dashboard...</p>
      </div>
    );
  }

  const eligibility = calculateEligibility();
  const isAvailable = donorDetails?.available !== false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      
      {/* Title Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--secondary)' }}>
            Welcome back, {donorDetails?.name || 'Donor'}
          </h1>
          <p style={{ color: '#8fa0b5' }}>Lifeline Network Donor Workspace</p>
        </div>
        
        {/* Availability Quick Switch */}
        <GlassCard style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 24px' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--secondary)' }}>
            My Status: {isAvailable ? 'AVAILABLE' : 'OFFLINE'}
          </span>
          <button
            onClick={handleToggleAvailability}
            disabled={isSubmitting}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              color: isAvailable ? 'var(--primary)' : 'var(--secondary)',
              transition: 'color var(--transition-fast)'
            }}
          >
            {isAvailable ? <ToggleRight size={44} /> : <ToggleLeft size={44} style={{ color: '#8fa0b5' }} />}
          </button>
        </GlassCard>
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

      {/* Main Tab Rendering */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Metrics Row */}
          <div className="grid-cols-3">
            {/* Blood Type Card */}
            <GlassCard style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(183, 16, 42, 0.08)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800
              }}>
                {donorDetails?.bloodGroup || 'O+'}
              </div>
              <div>
                <h4 style={{ color: 'var(--secondary)' }}>Blood Group</h4>
                <p style={{ color: '#8fa0b5', fontSize: '0.85rem' }}>Registered Type</p>
              </div>
            </GlassCard>

            {/* Last Donation Card */}
            <GlassCard style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(40, 97, 130, 0.08)',
                color: 'var(--tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar size={24} />
              </div>
              <div>
                <h4 style={{ color: 'var(--secondary)' }}>
                  {donorDetails?.lastDonationDate 
                    ? new Date(donorDetails.lastDonationDate).toLocaleDateString()
                    : 'No Record'}
                </h4>
                <p style={{ color: '#8fa0b5', fontSize: '0.85rem' }}>Last Donation Date</p>
              </div>
            </GlassCard>

            {/* Eligibility Card */}
            <GlassCard style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: eligibility.eligible ? 'rgba(40, 167, 69, 0.08)' : 'rgba(183, 16, 42, 0.08)',
                color: eligibility.eligible ? '#1e7e34' : 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {eligibility.eligible ? <CheckCircle2 size={26} /> : <AlertCircle size={26} />}
              </div>
              <div>
                <h4 style={{ color: 'var(--secondary)' }}>
                  {eligibility.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                </h4>
                <p style={{ color: '#8fa0b5', fontSize: '0.85rem' }}>
                  {eligibility.eligible ? 'Ready to donate' : `${eligibility.daysRemaining} days cooldown remaining`}
                </p>
              </div>
            </GlassCard>
          </div>

          {/* Quick Actions Panel */}
          <GlassCard style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '16px' }}>Donation Record Registry</h3>
            <p style={{ color: '#5b6a7e', fontSize: '0.95rem', marginBottom: '24px' }}>
              If you have recently donated blood at one of our network bloodbanks or associated hospitals, 
              please register the donation. Doing so helps keep our matching queues accurate.
            </p>
            <button
              onClick={handleRecordDonation}
              disabled={isSubmitting || !eligibility.eligible}
              className="btn btn-critical"
              style={{ display: 'inline-flex', alignItems: 'center' }}
            >
              <Droplet size={18} style={{ fill: 'currentColor' }} />
              <span>Record Donation Completed Today</span>
            </button>
            {!eligibility.eligible && (
              <p style={{ color: 'var(--primary)', fontSize: '0.85rem', marginTop: '12px', fontWeight: 600 }}>
                * Record donation is locked during your 90-day physical cooldown period.
              </p>
            )}
          </GlassCard>
        </div>
      )}

      {activeTab === 'requests' && (
        <GlassCard style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h3 style={{ color: 'var(--secondary)' }}>Matched Emergency Requests</h3>
              <p style={{ color: '#8fa0b5', fontSize: '0.9rem' }}>
                Urgent blood requests that match your blood type ({donorDetails?.bloodGroup}) and city ({donorDetails?.city})
              </p>
            </div>
            {!isAvailable && (
              <span className="status-chip status-chip-critical">
                OFFLINE (Toggle Available to receive pings)
              </span>
            )}
          </div>

          {loadingRequests ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Activity size={24} className="animate-fade-in" style={{ animation: 'spin 1.5s linear infinite', color: 'var(--primary)' }} />
              <p style={{ marginTop: '8px', color: '#8fa0b5' }}>Scanning blood network...</p>
            </div>
          ) : requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8fa0b5' }}>
              <AlertCircle size={40} style={{ strokeWidth: 1, marginBottom: '16px' }} />
              <p>No matching active requests found in your area at this time.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(72, 95, 132, 0.1)', color: 'var(--secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>Requester</th>
                    <th style={{ padding: '12px 16px' }}>Blood Group</th>
                    <th style={{ padding: '12px 16px' }}>Requested Units</th>
                    <th style={{ padding: '12px 16px' }}>Priority</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req._id || req.id} style={{ borderBottom: '1px solid rgba(72, 95, 132, 0.05)', fontSize: '0.95rem' }}>
                      <td style={{ padding: '16px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>
                          {req.hospitalId?.hospitalName || req.hospitalName || 'Hospital Center'}
                        </span>
                        <div style={{ fontSize: '0.8rem', color: '#8fa0b5' }}>
                          {req.hospitalId?.address || req.location || req.city || 'Network Location'}
                        </div>
                      </td>
                      <td style={{ padding: '16px', fontWeight: 700, color: 'var(--primary)' }}>
                        {req.bloodGroup}
                      </td>
                      <td style={{ padding: '16px' }}>{req.unitsRequired || req.units} Units</td>
                      <td style={{ padding: '16px' }}>
                        <span className={`status-chip ${req.priority === 'critical' || req.urgency === 'Critical' ? 'status-chip-critical' : 'status-chip-pending'}`}>
                          {req.priority || req.urgency || 'Normal'}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span className={`status-chip ${req.status === 'Completed' || req.status === 'completed' ? 'status-chip-active' : 'status-chip-info'}`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      )}

      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <GlassCard style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '24px' }}>Edit Profile Information</h3>
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="grid-cols-2">
                <div className="input-group">
                  <label className="input-label" htmlFor="profile-name">Full Name</label>
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="profile-bloodgroup">Blood Group</label>
                  <select
                    id="profile-bloodgroup"
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
              </div>

              <div className="grid-cols-2">
                <div className="input-group">
                  <label className="input-label" htmlFor="profile-phone">Phone Number (10 digits)</label>
                  <input
                    id="profile-phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="profile-city">City</label>
                  <input
                    id="profile-city"
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
                {isSubmitting ? 'Saving Changes...' : 'Save Settings'}
              </button>
            </form>
          </GlassCard>

          <GlassCard style={{ padding: '32px', borderColor: 'rgba(186, 26, 26, 0.2)' }}>
            <h3 style={{ color: 'var(--error)', marginBottom: '8px' }}>Danger Zone</h3>
            <p style={{ color: '#5b6a7e', fontSize: '0.95rem', marginBottom: '24px' }}>
              Deactivating your profile will remove your records and statistics from the active donor database. 
              Hospitals will no longer be able to match or request your blood type.
            </p>
            <button
              onClick={handleDeleteAccount}
              disabled={isSubmitting}
              className="btn btn-critical"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
            >
              <Trash2 size={16} />
              <span>Delete Donor Account</span>
            </button>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;
