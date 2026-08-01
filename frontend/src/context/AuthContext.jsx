import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

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
      // Use Firebase Auth for email/password sign-in, then send ID token to backend for user provisioning
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();
      const result = await googleSignIn(idToken);
      if (!result.success) return { success: false, message: result.message || 'Login failed' };
      return { success: true, user: result.user };
    } catch (error) {
      const errorMessage = /auth\//i.test(error.code || '') ? error.message : (error.message || 'Unable to complete login request');
      return { success: false, message: errorMessage };
    }
  };

  const googleSignIn = async (idToken, preferredRole) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, preferredRole })
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
        let errorMessage = data.message || response.statusText || 'Google sign-in failed';
        if (response.status === 502 || /gateway/i.test(response.statusText || '')) {
          errorMessage = 'Authentication server is not available. Start the backend server and try again.';
        }
        return { success: false, message: errorMessage };
      }

      if (data.needsRole) {
        return {
          success: false,
          needsRole: true,
          email: data.email,
          name: data.name,
          picture: data.picture
        };
      }

      localStorage.setItem('tms_token', data.token);
      setCurrentUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      const errorMessage = /failed to fetch|network|502|gateway/i.test(error.message || '')
        ? 'Unable to reach the authentication server. Start the backend and try again.'
        : error.message || 'Unable to complete Google sign-in request';
      return { success: false, message: errorMessage };
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
