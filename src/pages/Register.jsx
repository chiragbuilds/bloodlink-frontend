import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import { Heart, Activity, Building, Database } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Selected registration role
  const [selectedRole, setSelectedRole] = useState('donor'); // donor, hospital, bloodbank
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Synchronize role with URL parameters if present
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['donor', 'hospital', 'bloodbank'].includes(roleParam)) {
      setSelectedRole(roleParam);
    }
  }, [searchParams]);

  // Form Fields State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Phone validation: backend has strict /^[0-9]{10}$/ regex matching
    const strippedPhone = phone.replace(/\D/g, '');
    if (strippedPhone.length !== 10) {
      setErrorMsg('Phone number must be exactly 10 digits (e.g. 1234567890).');
      return;
    }

    setIsSubmitting(true);

    try {
      let payload = {
        name,
        email,
        password,
        phone: strippedPhone,
        city,
      };

      if (selectedRole === 'donor') {
        payload = {
          ...payload,
          bloodGroup,
        };
      } else {
        payload = {
          ...payload,
          address,
        };
      }

      await register(selectedRole, payload);

      setSuccessMsg('Account registered successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { state: { role: selectedRole } });
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check your data.');
      setIsSubmitting(false);
    }
  };

  const getRolePlaceholder = () => {
    if (selectedRole === 'hospital') return 'e.g. Saint Jude General Hospital';
    if (selectedRole === 'bloodbank') return 'e.g. Central Red Cross Blood Bank';
    return 'e.g. Jane Doe';
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
      {/* Background radial gradients */}
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '20%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(183, 16, 42, 0.04) 0%, rgba(255, 255, 255, 0) 70%)',
        zIndex: -1
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '20%',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(72, 95, 132, 0.04) 0%, rgba(255, 255, 255, 0) 70%)',
        zIndex: -1
      }} />

      <GlassCard className="auth-card register-card animate-slide-up">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--secondary)', marginBottom: '8px' }}>
            Register Account
          </h2>
          <p style={{ color: '#8fa0b5', fontSize: '0.9rem' }}>
            Select your account type to register in the BloodLink network
          </p>
        </div>

        {/* Role Picker */}
        <div className="role-picker-grid">
          {[
            { id: 'donor', label: 'Donor', icon: <Heart size={16} /> },
            { id: 'hospital', label: 'Hospital', icon: <Building size={16} /> },
            { id: 'bloodbank', label: 'Bank', icon: <Database size={16} /> },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => handleRoleChange(type.id)}
              disabled={isSubmitting}
              className={selectedRole === type.id ? 'role-picker-btn active' : 'role-picker-btn'}
            >
              {type.icon}
              <span>{type.label}</span>
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
            marginBottom: '24px'
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
            fontSize: '0.85rem',
            fontWeight: 500,
            marginBottom: '24px'
          }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* General Fields */}
          <div className="grid-cols-2">
            <div className="input-group">
              <label className="input-label" htmlFor="email-input">Email Address</label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="e.g. name@domain.com"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div className="input-group">
              <label className="input-label" htmlFor="password-input">Account Password</label>
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Minimum 6 characters"
                required
                disabled={isSubmitting}
                minLength={6}
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="input-group">
              <label className="input-label" htmlFor="name-input">
                {selectedRole === 'donor' ? 'Full Name' : selectedRole === 'hospital' ? 'Hospital Name' : 'Blood Bank Name'}
              </label>
              <input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder={getRolePlaceholder()}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="phone-input">Phone Number (10 digits)</label>
              <input
                id="phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field"
                placeholder="e.g. 9876543210"
                required
                maxLength={15}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid-cols-2">
            <div className="input-group">
              <label className="input-label" htmlFor="city-input">City</label>
              <input
                id="city-input"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input-field"
                placeholder="e.g. Mumbai"
                required
                disabled={isSubmitting}
              />
            </div>

            {selectedRole === 'donor' ? (
              <div className="input-group">
                <label className="input-label" htmlFor="blood-group-select">Blood Group</label>
                <select
                  id="blood-group-select"
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
            ) : (
              <div className="input-group">
                <label className="input-label" htmlFor="address-input">Physical Address</label>
                <input
                  id="address-input"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field"
                  placeholder="Street, Area, Landmark"
                  required
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', marginTop: '12px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} className="animate-fade-in" style={{ animation: 'spin 1.5s linear infinite' }} />
                Submitting Registration...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: '#5b6a7e' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary)' }}>
            Sign in here
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};

export default Register;
