import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialUsers } from '../data/dummyData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUserId = localStorage.getItem('tms_user_id');
    if (!storedUserId) return null;
    const foundUser = initialUsers.find(u => u.id === storedUserId);
    if (!foundUser) {
      localStorage.removeItem('tms_user_id');
      localStorage.removeItem('tms_role');
      return null;
    }
    return foundUser;
  });

  const activeRole = currentUser?.role || '';
  const isAuthenticated = !!currentUser;

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('tms_user_id', currentUser.id);
      localStorage.setItem('tms_role', currentUser.role);
    } else {
      localStorage.removeItem('tms_user_id');
      localStorage.removeItem('tms_role');
    }
  }, [currentUser]);

  const login = (email, password) => {
    const foundUser = initialUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      setCurrentUser(foundUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateProfile = (updatedFields) => {
    setCurrentUser((prev) => (prev ? { ...prev, ...updatedFields } : prev));
  };

  return (
    <AuthContext.Provider value={{ currentUser, activeRole, isAuthenticated, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
