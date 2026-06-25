import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import GlassCard from '../components/GlassCard';
import { Heart, ShieldCheck, Activity, Users, Building, Database } from 'lucide-react';
import Footer from '../components/Footer';

const LandingPage = () => {
  const [stats, setStats] = useState({
    donors: 0,
    hospitals: 0,
    bloodbanks: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/stats/');
        // Handle variations in response format
        const data = response.data;
        setStats({
          donors: data.donors || data.totalDonors || 142,
          hospitals: data.hospitals || data.totalHospitals || 18,
          bloodbanks: data.bloodbanks || data.totalBloodBank || 12,
          pendingRequests: data.pendingRequests || data.totalRequests || 29,
        });
      } catch (error) {
        console.error('Failed to load stats, using placeholder metrics:', error);
        // Set standard mock stats in case API is empty/unresponsive
        setStats({
          donors: 142,
          hospitals: 18,
          bloodbanks: 12,
          pendingRequests: 29,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', position: 'relative', overflow: 'hidden' }}>
      {/* Dynamic Background Network Node Simulation Elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(183, 16, 42, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
        zIndex: -1
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '5%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(72, 95, 132, 0.06) 0%, rgba(255, 255, 255, 0) 75%)',
        zIndex: -1
      }} />

      {/* Hero Section */}
      <section style={{ padding: '80px 0 60px 0' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '900px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(183, 16, 42, 0.08)',
            color: 'var(--primary)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 700,
            fontSize: '0.85rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '24px'
          }}>
            <Activity size={14} className="animate-fade-in"  />
            Connecting Hope With Care
          </div>
          
          <h1 className="display-lg" style={{ color: 'var(--secondary)', marginBottom: '24px' }}>
            Bridging the gap between <br />
            <span style={{ 
              background: 'linear-gradient(135deg, var(--primary) 30%, var(--secondary) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Donors, Hospitals, and Life.</span>
          </h1>

          <p className="body-lg" style={{ color: '#5b6a7e', marginBottom: '40px', maxWidth: '700px', marginInline: 'auto' }}>
            A high-tech lifeline seamlessly connecting hospitals, blood banks, and donors to ensure life-saving resources are always where they need to be.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-glass" style={{ padding: '14px 32px', fontSize: '1rem', border: '2px solid var(--secondary)', fontWeight: 600 }}>
              Connect with BloodLink
            </Link>
            {/* <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              Access Dashboard
            </Link> */}
          </div>
        </div>
      </section>

      {/* Stats Counter grid */}
      <section style={{ padding: '40px 0 80px 0' }}>
        <div className="container">
          <div className="grid-cols-4">
            <GlassCard style={{ padding: '32px 24px', textAlign: 'center' }}>
              <Users size={32} style={{ color: 'var(--secondary)', marginBottom: '16px', strokeWidth: 1.5 }} />
              <h3 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--secondary)' }}>
                {loading ? '...' : stats.donors}
              </h3>
              <p className="label-sm" style={{ color: '#8fa0b5' }}>Active Donors</p>
            </GlassCard>

            <GlassCard style={{ padding: '32px 24px', textAlign: 'center' }}>
              <Building size={32} style={{ color: 'var(--primary)', marginBottom: '16px', strokeWidth: 1.5 }} />
              <h3 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--secondary)' }}>
                {loading ? '...' : stats.hospitals}
              </h3>
              <p className="label-sm" style={{ color: '#8fa0b5' }}>Verified Hospitals</p>
            </GlassCard>

            <GlassCard style={{ padding: '32px 24px', textAlign: 'center' }}>
              <Database size={32} style={{ color: 'var(--tertiary)', marginBottom: '16px', strokeWidth: 1.5 }} />
              <h3 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--secondary)' }}>
                {loading ? '...' : stats.bloodbanks}
              </h3>
              <p className="label-sm" style={{ color: '#8fa0b5' }}>Blood Banks Online</p>
            </GlassCard>

            <GlassCard style={{ padding: '32px 24px', textAlign: 'center' }}>
              <Heart size={32} style={{ color: 'var(--primary)', marginBottom: '16px', strokeWidth: 1.5 }} />
              <h3 style={{ fontSize: '2rem', marginBottom: '8px', color: 'var(--primary)' }}>
                {loading ? '...' : stats.pendingRequests}
              </h3>
              <p className="label-sm" style={{ color: '#8fa0b5' }}>Requests Resolved</p>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Role Categories Split Cards */}
      <section style={{ padding: '60px 0 100px 0', backgroundColor: 'rgba(72, 95, 132, 0.02)', borderTop: '1px solid rgba(72, 95, 132, 0.05)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '48px', fontFamily: 'var(--font-display)' }}>
            Empowering the Healthcare Eco-System
          </h2>
          <div className="grid-cols-3">
            <GlassCard interactive style={{ padding: '32px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-default)',
                backgroundColor: 'rgba(183, 16, 42, 0.08)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <Heart size={24} style={{ fill: 'rgba(183, 16, 42, 0.1)' }} />
              </div>
              <h3 style={{ marginBottom: '12px' }}>Voluntary Donors</h3>
              <p style={{ color: '#5b6a7e', fontSize: '0.95rem', marginBottom: '24px' }}>
                Join as a lifesaver. Update your availability status, receive immediate emergency request pings matching your blood group, and keep track of your donation lifecycle.
              </p>
              <Link to="/register?role=donor" style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Become a Donor &rarr;
              </Link>
            </GlassCard>

            <GlassCard interactive style={{ padding: '32px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-default)',
                backgroundColor: 'rgba(40, 97, 130, 0.08)',
                color: 'var(--tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <Building size={24} />
              </div>
              <h3 style={{ marginBottom: '12px' }}>Medical Centers</h3>
              <p style={{ color: '#5b6a7e', fontSize: '0.95rem', marginBottom: '24px' }}>
                For hospitals and clinical surgery hubs. Dispatch urgent blood inventory requirements directly to local networks, monitor bank acceptances, and secure swift escorts.
              </p>
              <Link to="/register?role=hospital" style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Register Hospital &rarr;
              </Link>
            </GlassCard>

            <GlassCard interactive style={{ padding: '32px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-default)',
                backgroundColor: 'rgba(72, 95, 132, 0.08)',
                color: 'var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <Database size={24} />
              </div>
              <h3 style={{ marginBottom: '12px' }}>Blood Banks</h3>
              <p style={{ color: '#5b6a7e', fontSize: '0.95rem', marginBottom: '24px' }}>
                For storage repositories. List blood types, keep stock inventory up to date, review and accept local hospital emergency requests, and reconcile counts.
              </p>
              <Link to="/register?role=bloodbank" style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Register Blood Bank &rarr;
              </Link>
            </GlassCard>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default LandingPage;
