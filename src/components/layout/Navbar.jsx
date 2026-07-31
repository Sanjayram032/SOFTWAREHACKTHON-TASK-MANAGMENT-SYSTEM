import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTask } from '../../context/TaskContext';
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  LogOut, 
  ChevronDown, 
  ShieldAlert, 
  UserCheck, 
  GraduationCap 
} from 'lucide-react';

const Navbar = ({ onOpenSidebar }) => {
  const { activeRole, switchRole, currentUser, logout } = useAuth();
  const { notifications } = useTask();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read_status && (n.user_id === currentUser.id || activeRole === 'admin')).length;

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    switchRole(newRole);
    if (newRole === 'admin') navigate('/admin/dashboard');
    else if (newRole === 'staff') navigate('/staff/dashboard');
    else navigate('/student/dashboard');
  };

  return (
    <header className="sticky top-0 z-30 h-16 glass-nav px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left Section: Mobile Menu & Search */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenSidebar} 
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden focus:outline-hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative hidden sm:flex items-center w-64 lg:w-80">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search tasks, users, reports..." 
            className="w-full bg-slate-100/80 border border-slate-200/80 rounded-xl py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-hidden transition-all"
          />
        </div>
      </div>

      {/* Right Section: Role Switcher, Notification & Profile */}
      <div className="flex items-center gap-3">
        {/* Role Selector Pill */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <span className="hidden md:inline text-[10px] font-bold text-slate-500 uppercase px-2">Switch View:</span>
          <div className="relative">
            <select
              value={activeRole}
              onChange={handleRoleChange}
              className="bg-white border border-slate-200 text-xs font-semibold text-blue-700 py-1 pl-2.5 pr-7 rounded-lg shadow-2xs focus:outline-hidden cursor-pointer capitalize"
            >
              <option value="admin">🛡️ Admin View</option>
              <option value="staff">👨‍🏫 Staff View</option>
              <option value="student">🎓 Student View</option>
            </select>
          </div>
        </div>

        {/* Notification Bell Button */}
        <button 
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors focus:outline-hidden"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
          )}
        </button>

        {/* Profile Menu Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-hidden"
          >
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs" 
            />
            <span className="hidden md:inline text-xs font-semibold text-slate-800">{currentUser.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 hidden md:inline" />
          </button>

          {/* Profile Dropdown Box */}
          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{activeRole} • {currentUser.department}</p>
                </div>

                <div className="py-1">
                  <Link 
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <User className="w-4 h-4" />
                    <span>My Profile</span>
                  </Link>
                  <Link 
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>Settings & Support</span>
                  </Link>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button 
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
