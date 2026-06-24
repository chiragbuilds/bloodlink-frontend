import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [id, setId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize session from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('bloodlink_user');
      const storedRole = localStorage.getItem('bloodlink_role');
      const storedId = localStorage.getItem('bloodlink_id');

      if (
        storedUser && 
        storedRole && 
        storedId && 
        storedId !== 'undefined' && 
        storedId !== 'null'
      ) {
        setUser(JSON.parse(storedUser));
        setRole(storedRole);
        setId(storedId);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('bloodlink_user');
        localStorage.removeItem('bloodlink_role');
        localStorage.removeItem('bloodlink_id');
      }
    } catch (err) {
      console.error('Error reading session data:', err);
      localStorage.removeItem('bloodlink_user');
      localStorage.removeItem('bloodlink_role');
      localStorage.removeItem('bloodlink_id');
    } finally {
      setLoading(false);
    }
  }, []);

  // Login handler
  const login = async (selectedRole, email, password) => {
    setLoading(true);
    try {
      let response;
      if (selectedRole === 'admin') {
        // Backend expects 'adminId' instead of 'email' for admin login
        response = await api.post('/api/admin/login', { adminId: email, password });
      } else {
        response = await api.post('/api/login', { role: selectedRole, email, password });
      }

      const data = response.data;
      
      let loggedInUser;
      let userId;

      if (selectedRole === 'admin') {
        userId = 'admin';
        loggedInUser = { name: 'Platform Admin', email, role: 'admin' };
      } else {
        loggedInUser = data.user || data.donor || data.hospital || data.bloodBank || data.bloodbank || data;
        // Backend returns 'userId' inside the flat data response on success
        userId = data.userId || loggedInUser._id || loggedInUser.id || data.id || data._id;
      }
      
      const finalRole = selectedRole;

      if (!userId) {
        throw new Error('Login failed: Server response did not contain user ID');
      }

      setUser(loggedInUser);
      setRole(finalRole);
      setId(userId);
      setIsAuthenticated(true);

      localStorage.setItem('bloodlink_user', JSON.stringify(loggedInUser));
      localStorage.setItem('bloodlink_role', finalRole);
      localStorage.setItem('bloodlink_id', userId);

      return loggedInUser;
    } catch (error) {
      console.error('Login service error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (selectedRole, registerData) => {
    setLoading(true);
    try {
      // Send register request: endpoint is /api/register for all non-admin roles
      const response = await api.post('/api/register', {
        role: selectedRole,
        ...registerData,
      });
      return response.data;
    } catch (error) {
      console.error('Register service error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setRole(null);
    setId(null);
    setIsAuthenticated(false);
    localStorage.removeItem('bloodlink_user');
    localStorage.removeItem('bloodlink_role');
    localStorage.removeItem('bloodlink_id');
  };

  const updateUserLocalState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('bloodlink_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    role,
    id,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUserLocalState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
