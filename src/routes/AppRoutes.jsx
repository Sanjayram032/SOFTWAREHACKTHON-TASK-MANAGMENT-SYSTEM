import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import LoginPage from '../pages/LoginPage';
import HomePage from '../pages/HomePage';
import AdminDashboard from '../pages/AdminDashboard';
import StaffDashboard from '../pages/StaffDashboard';
import StudentDashboard from '../pages/StudentDashboard';
import TaskManagementPage from '../pages/TaskManagementPage';
import UserManagementPage from '../pages/UserManagementPage';
import SubmissionsPage from '../pages/SubmissionsPage';
import NotificationsPage from '../pages/NotificationsPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-slate-50">
        <p className="text-sm text-slate-500">Checking session…</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* App Routes (with Sidebar + Navbar) */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/tasks" element={<TaskManagementPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/submissions" element={<SubmissionsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
