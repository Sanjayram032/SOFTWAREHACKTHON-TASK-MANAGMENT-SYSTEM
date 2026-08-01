import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const activeRole = currentUser?.role || '';
  const isAuthenticated = !!currentUser;

  useEffect(() => {
    const token = localStorage.getItem('tms_token');
    if (!token) {
      setLoading(false);
      return;
    }

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Session expired');
        const data = await res.json();
        setCurrentUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem('tms_token');
        setCurrentUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tms_user_id', currentUser._id || currentUser.id || '');
      localStorage.setItem('tms_role', currentUser.role);
    } else {
      localStorage.removeItem('tms_user_id');
      localStorage.removeItem('tms_role');
    }
  }, [currentUser]);

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      let data = {};
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { message: text } : {};
      }

      if (!response.ok) {
        return { success: false, message: data.message || response.statusText || 'Login failed' };
      }

      localStorage.setItem('tms_token', data.token);
      setCurrentUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, message: error.message || 'Unable to complete login request' };
    }
  };

  const googleSignIn = async (idToken) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      let data = {};
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = text ? { message: text } : {};
      }

      if (!response.ok) {
        return { success: false, message: data.message || response.statusText || 'Google sign-in failed' };
      }

      localStorage.setItem('tms_token', data.token);
      setCurrentUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, message: error.message || 'Unable to complete Google sign-in request' };
    }
  };

  const logout = () => {
    localStorage.removeItem('tms_token');
    setCurrentUser(null);
  };

  const updateProfile = (updatedFields) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...updatedFields } : prev));
  };

  return (
    <AuthContext.Provider value={{ currentUser, activeRole, isAuthenticated, loading, login, googleSignIn, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
