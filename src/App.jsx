import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import DonorDashboard from './pages/donor/DonorDashboard';
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import BloodBankDashboard from './pages/bloodbank/BloodBankDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLogin from './pages/admin/AdminLogin';

const AppContent = () => {
  const { isAuthenticated, role } = useAuth();
  
  // Tab states for all dashboard workspaces
  const [donorTab, setDonorTab] = useState('overview');
  const [hospitalTab, setHospitalTab] = useState('requests');
  const [bloodBankTab, setBloodBankTab] = useState('inventory');
  const [adminTab, setAdminTab] = useState('stats');

  // Sidebar visibility drawer toggle
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  const handleTabChange = (tabSetter) => (tab) => {
    tabSetter(tab);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const getSidebarProps = () => {
    switch (role) {
      case 'donor':
        return { activeTab: donorTab, setActiveTab: handleTabChange(setDonorTab) };
      case 'hospital':
        return { activeTab: hospitalTab, setActiveTab: handleTabChange(setHospitalTab) };
      case 'bloodbank':
        return { activeTab: bloodBankTab, setActiveTab: handleTabChange(setBloodBankTab) };
      case 'admin':
        return { activeTab: adminTab, setActiveTab: handleTabChange(setAdminTab) };
      default:
        return null;
    }
  };

  const sidebarProps = getSidebarProps();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar onToggleSidebar={isAuthenticated ? () => setSidebarOpen(!sidebarOpen) : undefined} />
            {isAuthenticated && sidebarProps ? (
              <div className="dashboard-layout">
                {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
                <Sidebar isOpen={sidebarOpen} {...sidebarProps} />
                <main className="dashboard-main-content">
                  <LandingPage />
                </main>
              </div>
            ) : (
              <main style={{ flex: 1 }}>
                <LandingPage />
              </main>
            )}
          </div>
        } />
        
        <Route path="/login" element={
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Login />
            </main>
          </div>
        } />
        
        <Route path="/register" element={
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Register />
            </main>
          </div>
        } />

        {/* Protected Donor Workspace */}
        <Route path="/donor-dashboard" element={
          <ProtectedRoute allowedRoles={['donor']}>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
              <div className="dashboard-layout">
                {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
                <Sidebar isOpen={sidebarOpen} activeTab={donorTab} setActiveTab={handleTabChange(setDonorTab)} />
                <main className="dashboard-main-content">
                  <div className="container" style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <DonorDashboard activeTab={donorTab} />
                  </div>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />

        {/* Protected Hospital Workspace */}
        <Route path="/hospital-dashboard" element={
          <ProtectedRoute allowedRoles={['hospital']}>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
              <div className="dashboard-layout">
                {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
                <Sidebar isOpen={sidebarOpen} activeTab={hospitalTab} setActiveTab={handleTabChange(setHospitalTab)} />
                <main className="dashboard-main-content">
                  <div className="container" style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <HospitalDashboard activeTab={hospitalTab} setActiveTab={setHospitalTab} />
                  </div>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />

        {/* Protected Blood Bank Workspace */}
        <Route path="/bloodbank-dashboard" element={
          <ProtectedRoute allowedRoles={['bloodbank']}>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
              <div className="dashboard-layout">
                {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
                <Sidebar isOpen={sidebarOpen} activeTab={bloodBankTab} setActiveTab={handleTabChange(setBloodBankTab)} />
                <main className="dashboard-main-content">
                  <div className="container" style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <BloodBankDashboard activeTab={bloodBankTab} />
                  </div>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />

        {/* Protected Global Admin Workspace */}
        <Route path="/adminLogin" element={<AdminLogin />} />

        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
              <div className="dashboard-layout">
                {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
                <Sidebar isOpen={sidebarOpen} activeTab={adminTab} setActiveTab={handleTabChange(setAdminTab)} />
                <main className="dashboard-main-content">
                  <div className="container" style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <AdminDashboard activeTab={adminTab} />
                  </div>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />

        {/* Redirection fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
