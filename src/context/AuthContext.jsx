import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialUsers } from '../data/dummyData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Saved active role or default to admin
  const [activeRole, setActiveRole] = useState(() => {
    return localStorage.getItem('tms_role') || 'admin';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const role = localStorage.getItem('tms_role') || 'admin';
    return initialUsers.find(u => u.role === role) || initialUsers[0];
  });

  useEffect(() => {
    localStorage.setItem('tms_role', activeRole);
  }, [activeRole]);

  // Switch role preset dynamically
  const switchRole = (newRole) => {
    setActiveRole(newRole);
    const targetUser = initialUsers.find(u => u.role === newRole);
    if (targetUser) {
      setCurrentUser(targetUser);
    }
  };

  // Login handler
  const login = (email, password, selectedRole = 'admin') => {
    const foundUser = initialUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      setCurrentUser(foundUser);
      setActiveRole(foundUser.role);
    } else {
      // Fallback preset if dummy email typed
      switchRole(selectedRole);
    }
    return true;
  };

  const logout = () => {
    // Standard UI reset
    switchRole('admin');
  };

  return (
    <AuthContext.Provider value={{ currentUser, activeRole, switchRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
