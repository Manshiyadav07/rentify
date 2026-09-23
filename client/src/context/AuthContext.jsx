import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Ensure Authorization header is present on every single outgoing request
axios.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('rentifyUser');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
  } catch (e) {
    // Ignore JSON parse errors
  }
  return config;
});

// Auto-handle stale/expired tokens across the platform
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const msg = error.response.data?.message || '';
      if (
        msg.toLowerCase().includes('token') ||
        msg.toLowerCase().includes('not authorized') ||
        msg.toLowerCase().includes('user not found')
      ) {
        localStorage.removeItem('rentifyUser');
        delete axios.defaults.headers.common['Authorization'];
        window.dispatchEvent(new CustomEvent('rentify-auth-expired'));
      }
    }
    return Promise.reject(error);
  }
);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('rentifyUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Listen for automatic token expiry
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
    };
    window.addEventListener('rentify-auth-expired', handleExpired);
    return () => window.removeEventListener('rentify-auth-expired', handleExpired);
  }, []);

  // Sync Axios default header with current user token
  useEffect(() => {
    if (user?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [user]);

  const login = (userData) => {
    localStorage.setItem('rentifyUser', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('rentifyUser');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    localStorage.setItem('rentifyUser', JSON.stringify(merged));
    setUser(merged);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);