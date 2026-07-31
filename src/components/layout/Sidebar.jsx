import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTask } from '../../context/TaskContext';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  BarChart3, 
  Bell, 
  Settings, 
  GraduationCap, 
  FileCheck, 
  UserCircle,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { activeRole, currentUser } = useAuth();
  const { notifications } = useTask();

  const unreadCount = notifications.filter(
    (n) => !n.read_status && (n.user_id === currentUser?.id || activeRole === 'admin')
  ).length;

  const adminNav = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Status', path: '/users', icon: Users },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Submissions', path: '/submissions', icon: FileCheck },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { label: 'Settings & Queries', path: '/settings', icon: Settings },
  ];

  const staffNav = [
    { label: 'Dashboard', path: '/staff/dashboard', icon: LayoutDashboard },
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Students', path: '/users', icon: GraduationCap },
    { label: 'Reviews', path: '/submissions', icon: FileCheck },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const studentNav = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Tasks', path: '/tasks', icon: CheckSquare },
    { label: 'Submissions', path: '/submissions', icon: FileCheck },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { label: 'Profile', path: '/profile', icon: UserCircle },
  ];

  const navItems = activeRole === 'admin' ? adminNav : activeRole === 'staff' ? staffNav : studentNav;

  const roleLabels = {
    admin: { name: 'Administrator', icon: ShieldCheck, color: 'bg-indigo-500' },
    staff: { name: 'Faculty Staff', icon: UserCheck, color: 'bg-blue-500' },
    student: { name: 'Student', icon: GraduationCap, color: 'bg-emerald-500' }
  };

  const currentRoleInfo = roleLabels[activeRole] || roleLabels.admin;

  if (!currentUser) {
    return null;
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200/80 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col justify-between`}>
        <div>
          {/* Header Brand */}
          <div className="flex items-center gap-3 h-16 px-6 border-b border-slate-100 bg-slate-50/50">
            <div className="w-9 h-9 rounded-xl blue-gradient-bg flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
              🎓
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm tracking-tight">TaskFlow Portal</h1>
              <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Institutional System</p>
            </div>
          </div>

          {/* Active Role Indicator Card */}
          <div className="mx-4 mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
            <div className={`p-2 rounded-lg text-white ${currentRoleInfo.color}`}>
              <currentRoleInfo.icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Current Role</p>
              <p className="text-xs font-bold text-slate-800 capitalize truncate">{activeRole}</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 mt-5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
