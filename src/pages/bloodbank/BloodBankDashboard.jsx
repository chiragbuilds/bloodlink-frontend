import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import GlassCard from '../../components/GlassCard';
import { 
  Database, 
  Activity, 
  Droplet, 
  CheckCircle2, 
  Plus, 
  Minus, 
  ClipboardList, 
  Compass,
  AlertCircle
} from 'lucide-react';

const BloodBankDashboard = ({ activeTab }) => {
  const { id, user, updateUserLocalState } = useAuth();

  // Profile / Details
  const [bankDetails, setBankDetails] = useState(user || null);
  const [inventory, setInventory] = useState({
    'A+': 0, 'A-': 0, 'B+': 0, 'B-': 0,
    'AB+': 0, 'AB-': 0, 'O+': 0, 'O-': 0
  });
  const [pendingRequests, setPendingRequests] = useState([]);
  const [acceptedRequests, setAcceptedRequests] = useState([]);

  // Loaders
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingAccepted, setLoadingAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Profile Edit Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  // Sync Bloodbank info on mount
  useEffect(() => {
    const fetchBankDetails = async () => {
      try {
        setLoadingDetails(true);
        const response = await api.get(`/api/bloodbank/${id}`);
        const data = response.data;
        const details = data.bloodBank || data.bloodbank || data;

        setBankDetails(details);
        updateUserLocalState(details);

        setName(details.name || '');
        setAddress(details.address || '');
        setPhone(details.phone || '');
        setCity(details.city || '');
      } catch (err) {
        console.error('Error fetching bloodbank profile:', err);
        setErrorMsg('Failed to sync blood bank settings.');
      } finally {
        setLoadingDetails(false);
      }
    };

    if (id) {
      fetchBankDetails();
    }
  }, [id]);

  // Sync Inventory
  const fetchInventory = async () => {
    try {
      setLoadingInventory(true);
      setErrorMsg('');
      const response = await api.get(`/api/bloodbank/${id}/inventory`);
      const data = response.data;
      // Handle array or object structure
      const invData = data.inventory || data;
      const normalizedInventory = { ...inventory };
      
      if (Array.isArray(invData)) {
        invData.forEach(item => {
          if (item.bloodType && item.units !== undefined) {
            normalizedInventory[item.bloodType] = item.units;
          }
        });
      } else if (typeof invData === 'object' && invData !== null) {
        Object.keys(invData).forEach(key => {
          if (normalizedInventory[key] !== undefined) {
            normalizedInventory[key] = invData[key];
          }
        });
      }
      setInventory(normalizedInventory);
    } catch (err) {
      console.error('Error fetching bloodbank inventory:', err);
      setErrorMsg('Could not fetch blood bank stock levels.');
    } finally {
      setLoadingInventory(false);
    }
  };

  useEffect(() => {
    if (id && activeTab === 'inventory') {
      fetchInventory();
    }
  }, [id, activeTab]);

  // Sync Pending Requests matching
  const fetchPendingRequests = async () => {
    try {
      setLoadingRequests(true);
      setErrorMsg('');
      const response = await api.get(`/api/requests/bloodbank/${id}`);
      const data = response.data;
      setPendingRequests(data.requests || data || []);
    } catch (err) {
      console.error('Error fetching matched requests:', err);
      setErrorMsg('Failed to sync network requests queue.');
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (id && activeTab === 'requests') {
      fetchPendingRequests();
    }
  }, [id, activeTab]);

  // Sync Accepted Requests
  const fetchAcceptedRequests = async () => {
    try {
      setLoadingAccepted(true);
      setErrorMsg('');
      const response = await api.get(`/api/bloodbank/${id}/accepted-requests`);
      const data = response.data;
      setAcceptedRequests(data.requests || data || []);
    } catch (err) {
      console.error('Error fetching accepted requests:', err);
      setErrorMsg('Failed to load active escort tasks.');
    } finally {
      setLoadingAccepted(false);
    }
  };

  useEffect(() => {
    if (id && activeTab === 'accepted') {
      fetchAcceptedRequests();
    }
  }, [id, activeTab]);

  // Update Inventory levels
  const handleInventoryAdjust = async (bloodType, change) => {
    try {
      const newAmount = Math.max(0, (inventory[bloodType] || 0) + change);
      const updatedInv = { ...inventory, [bloodType]: newAmount };
      
      setInventory(updatedInv);
      setErrorMsg('');

      // Send update
      await api.put(`/api/bloodbank/${id}/inventory`, {
        inventory: updatedInv
      });
    } catch (err) {
      console.error('Failed to update inventory level:', err);
      setErrorMsg('Could not save inventory adjustments to server.');
      fetchInventory(); // revert state
    }
  };

  // Accept a hospital request
  const handleAcceptRequest = async (requestId) => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      
      // PUT /api/requests/:id/accept - requires bloodBankId in the body
      await api.put(`/api/requests/${requestId}/accept`, {
        bloodBankId: id
      });
      
      setSuccessMsg('Request successfully accepted! Logistics details sent to hospital.');
      fetchPendingRequests();
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Accept request failed:', err);
      setErrorMsg('Failed to accept request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Complete an accepted request
  const handleCompleteRequest = async (requestId) => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      
      // PUT /api/requests/:id/complete
      await api.put(`/api/requests/${requestId}/complete`);
      
      setSuccessMsg('Logistics task completed! Blood units marked as delivered.');
      fetchAcceptedRequests();
      
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Complete request failed:', err);
      setErrorMsg('Failed to complete request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save profile settings
  const handleSaveProfile = async (e) => {
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

      const response = await api.put(`/api/bloodbank/${id}`, {
        name,
        address,
        phone: strippedPhone,
        city
      });

      const updated = response.data.bloodBank || response.data.bloodbank || response.data;
      setBankDetails(updated);
      updateUserLocalState(updated);
      setSuccessMsg('Blood Bank details updated successfully!');

      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to save profile details:', err);
      setErrorMsg('Failed to update profile settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingDetails) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Activity size={32} className="animate-fade-in" style={{ animation: 'spin 1.5s linear infinite', color: 'var(--primary)' }} />
        <p style={{ marginTop: '16px', color: 'var(--secondary)' }}>Accessing storage records...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', width: '100%' }}>
      
      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--secondary)' }}>
          {bankDetails?.name || 'Blood Bank Depot'}
        </h1>
        <p style={{ color: '#8fa0b5' }}>Storage Stockpile & Dispatch Console</p>
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

      {/* Inventory Panel */}
      {activeTab === 'inventory' && (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h3>Blood Inventory Levels</h3>
            <p style={{ color: '#8fa0b5', fontSize: '0.9rem' }}>Adjust counts directly by using quick controls (+ / -)</p>
          </div>

          {loadingInventory ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Activity size={24} className="animate-fade-in" style={{ animation: 'spin 1.5s linear infinite', color: 'var(--primary)' }} />
              <p style={{ marginTop: '8px', color: '#8fa0b5' }}>Reading inventory sensors...</p>
            </div>
          ) : (
            <div className="grid-cols-4">
              {Object.keys(inventory).map((bloodType) => (
                <GlassCard key={bloodType} style={{ padding: '24px 16px', textAlign: 'center' }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(183, 16, 42, 0.08)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    margin: '0 auto 16px auto'
                  }}>
                    {bloodType}
                  </div>
                  
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--secondary)', marginBottom: '16px' }}>
                    {inventory[bloodType]} <span style={{ fontSize: '1rem', color: '#8fa0b5' }}>Units</span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button
                      onClick={() => handleInventoryAdjust(bloodType, -1)}
                      className="btn btn-glass"
                      style={{ padding: '8px 12px', display: 'flex', alignItems: 'center' }}
                      title="Decrement Units"
                    >
                      <Minus size={14} />
                    </button>
                    <button
                      onClick={() => handleInventoryAdjust(bloodType, 1)}
                      className="btn btn-glass"
                      style={{ padding: '8px 12px', display: 'flex', alignItems: 'center' }}
                      title="Increment Units"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Matched hospital requests */}
      {activeTab === 'requests' && (
        <GlassCard style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>Incoming Logistics Demands</h3>
          <p style={{ color: '#8fa0b5', fontSize: '0.9rem', marginBottom: '24px' }}>
            Hospitals looking for blood supply in the network. Review compatibility before accepting.
          </p>

          {loadingRequests ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Activity size={24} className="animate-fade-in" style={{ animation: 'spin 1.5s linear infinite', color: 'var(--primary)' }} />
              <p style={{ marginTop: '8px', color: '#8fa0b5' }}>Checking queues...</p>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8fa0b5' }}>
              <Droplet size={40} style={{ strokeWidth: 1, marginBottom: '16px' }} />
              <p>No pending blood requests available in the matching pool.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(72, 95, 132, 0.1)', color: 'var(--secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>Requesting Center</th>
                    <th style={{ padding: '12px 16px' }}>Blood Type</th>
                    <th style={{ padding: '12px 16px' }}>Quantity</th>
                    <th style={{ padding: '12px 16px' }}>Priority</th>
                    <th style={{ padding: '12px 16px' }}>In Stock</th>
                    <th style={{ padding: '12px 16px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((req) => {
                    const stock = inventory[req.bloodGroup] || 0;
                    const canFulfill = stock >= req.unitsRequired;
                    return (
                      <tr key={req._id || req.id} style={{ borderBottom: '1px solid rgba(72, 95, 132, 0.05)', fontSize: '0.95rem' }}>
                        <td data-label="Requesting Center" style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'right' }}>
                            <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>
                              {req.hospitalId?.name || req.hospitalName || 'Hospital Center'}
                            </span>
                            <div style={{ fontSize: '0.8rem', color: '#8fa0b5' }}>
                              {req.hospitalId?.address || req.location || req.city || 'Network Location'}
                            </div>
                          </div>
                        </td>
                        <td data-label="Blood Type" style={{ padding: '16px', fontWeight: 700, color: 'var(--primary)' }}>
                          {req.bloodGroup}
                        </td>
                        <td data-label="Quantity" style={{ padding: '16px' }}>{req.unitsRequired} Units</td>
                        <td data-label="Priority" style={{ padding: '16px' }}>
                          <span className={`status-chip ${req.priority === 'critical' ? 'status-chip-critical' : 'status-chip-pending'}`}>
                            {req.priority || 'Normal'}
                          </span>
                        </td>
                        <td data-label="In Stock" style={{ padding: '16px', fontWeight: 600, color: canFulfill ? '#1e7e34' : 'var(--primary)' }}>
                          {stock} Units
                        </td>
                        <td data-label="Action" style={{ padding: '16px' }}>
                          <button
                            onClick={() => handleAcceptRequest(req._id || req.id)}
                            disabled={isSubmitting || !canFulfill}
                            className="btn btn-primary"
                            style={{ 
                              padding: '8px 16px', 
                              fontSize: '0.8rem', 
                              backgroundColor: canFulfill ? 'var(--secondary)' : '#a5b5cb',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <Compass size={14} />
                            <span>Accept Cargo</span>
                          </button>
                          {!canFulfill && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '4px', fontWeight: 600 }}>
                              Insufficient Stocks
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      )}

      {/* Accepted Requests in-progress */}
      {activeTab === 'accepted' && (
        <GlassCard style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>Active Dispatch Escorts</h3>
          <p style={{ color: '#8fa0b5', fontSize: '0.9rem', marginBottom: '24px' }}>
            Deliveries currently committed by this bank. Mark as complete once received by the hospital.
          </p>

          {loadingAccepted ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Activity size={24} className="animate-fade-in" style={{ animation: 'spin 1.5s linear infinite', color: 'var(--primary)' }} />
              <p style={{ marginTop: '8px', color: '#8fa0b5' }}>Scanning escorts list...</p>
            </div>
          ) : acceptedRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#8fa0b5' }}>
              <ClipboardList size={40} style={{ strokeWidth: 1, marginBottom: '16px' }} />
              <p>No active escorts are in transit for this center.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(72, 95, 132, 0.1)', color: 'var(--secondary)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>Destination Center</th>
                    <th style={{ padding: '12px 16px' }}>Blood Type</th>
                    <th style={{ padding: '12px 16px' }}>Volume Delivered</th>
                    <th style={{ padding: '12px 16px' }}>Contact</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {acceptedRequests
                  .sort((a, b) => (a.status === "accepted" ? -1 : 1))
                  .map((req) => (
                    <tr key={req._id || req.id} style={{ borderBottom: '1px solid rgba(72, 95, 132, 0.05)', fontSize: '0.95rem' }}>
                      <td data-label="Destination Center" style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'right' }}>
                          <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>
                            {req.hospitalId?.name || req.hospitalName || 'Hospital Center'}
                          </span>
                          <div style={{ fontSize: '0.8rem', color: '#8fa0b5' }}>
                            {req.hospitalId?.address || req.location || req.city || 'Network Location'}
                          </div>
                        </div>
                      </td>
                      <td data-label="Blood Type" style={{ padding: '16px', fontWeight: 700, color: 'var(--primary)' }}>
                        {req.bloodGroup}
                      </td>
                      <td data-label="Volume Delivered" style={{ padding: '16px' }}>{req.unitsRequired} Units</td>
                      <td data-label="Contact" style={{ padding: '16px', color: '#5b6a7e' }}>
                        {req.hospitalId?.phone || req.phone || 'N/A'}
                      </td>
                      <td data-label="Status" style={{ padding: '16px' }}>
                        <span className="status-chip status-chip-info" style={{ textTransform: 'capitalize' }}>
                          {req.status}
                        </span>
                      </td>
                      <td data-label="Action" style={{ padding: '16px' }}>
                        <button
                          onClick={() => handleCompleteRequest(req._id || req.id)}
                          disabled={isSubmitting || req.status !== 'accepted'}
                          className="btn btn-primary"
                          style={{ 
                            padding: '8px 16px', 
                            fontSize: '0.8rem', 
                            backgroundColor: '#28a745',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <CheckCircle2 size={14} />
                          <span>{ (isSubmitting || req.status === 'accepted') ? 'Confirm Delivery' : 'Delivered'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      )}

      {/* Profile */}
      {activeTab === 'profile' && (
        <GlassCard style={{ padding: '32px' }}>
          <h3 style={{ marginBottom: '24px' }}>Update Storage Profile</h3>
          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="input-group">
              <label className="input-label" htmlFor="bank-profile-name">Blood Bank Depot Name</label>
              <input
                id="bank-profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="grid-cols-2">
              <div className="input-group">
                <label className="input-label" htmlFor="bank-profile-contact">Contact Phone Number</label>
                <input
                  id="bank-profile-contact"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="bank-profile-address">Depot Storage Address</label>
                <input
                  id="bank-profile-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="bank-profile-city">City</label>
              <input
                id="bank-profile-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input-field"
                required
                disabled={isSubmitting}
              />
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

export default BloodBankDashboard;
