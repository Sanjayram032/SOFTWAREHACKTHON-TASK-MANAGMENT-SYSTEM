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
import ReportsPage from '../pages/ReportsPage';
import ProfilePage from '../pages/ProfilePage';
import SettingsPage from '../pages/SettingsPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* App Routes (with Sidebar + Navbar) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/tasks" element={<TaskManagementPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/submissions" element={<SubmissionsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
