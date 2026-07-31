import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTask } from '../context/TaskContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import EditProfileModal from '../components/modals/EditProfileModal';
import { Edit2, Mail, Phone, Building2, Shield, Calendar } from 'lucide-react';

const ProfilePage = () => {
  const { currentUser, activeRole } = useAuth();
  const { tasks, submissions, auditLogs } = useTask();
  const [editOpen, setEditOpen] = useState(false);

  const myTasks = tasks.filter(t => t.assigned_to === currentUser.id || t.created_by === currentUser.id);
  const mySubmissions = submissions.filter(s => s.submitted_by === currentUser.id);

  const roleBadgeColors = {
    admin: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    staff: 'bg-blue-100 text-blue-700 border-blue-200',
    student: 'bg-emerald-100 text-emerald-700 border-emerald-200'
  };

  return (
    <div className="space-y-6">
      {/* Profile Hero Card */}
      <Card className="!p-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm"
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=CBD5E1&color=1F2937&size=80`; }}
            />
            <div className="pb-1">
              <h2 className="text-xl font-black text-slate-900">{currentUser.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${roleBadgeColors[activeRole]}`}>
                  {activeRole}
                </span>
                <StatusBadge status={currentUser.status} />
              </div>
            </div>
          </div>
          <Button variant="outline" icon={Edit2} onClick={() => setEditOpen(true)}>
            Edit Profile
          </Button>
        </div>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="lg:col-span-2">
          <Card title="Profile Information" subtitle="Institutional contact and role details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {[
                { label: 'Email Address', value: currentUser.email, icon: Mail },
                { label: 'Contact Phone', value: currentUser.phone || 'Not provided', icon: Phone },
                { label: 'Department', value: currentUser.department, icon: Building2 },
                { label: 'System Role', value: activeRole.toUpperCase(), icon: Shield },
                { label: 'Member Since', value: currentUser.joinedDate || '2024-01-01', icon: Calendar },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg mt-0.5">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Activity Stats */}
        <div className="space-y-4">
          <Card title="Activity Summary">
            <div className="space-y-3 mt-1">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Tasks Involved</span>
                <span className="text-sm font-black text-slate-900">{myTasks.length}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Completed</span>
                <span className="text-sm font-black text-emerald-600">{myTasks.filter(t => t.status === 'Completed').length}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-600">Proof Submissions</span>
                <span className="text-sm font-black text-blue-600">{mySubmissions.length}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs font-semibold text-slate-600">System Actions</span>
                <span className="text-sm font-black text-slate-900">{auditLogs.filter(l => l.user_name === currentUser.name).length}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <Card title="Recent System Activity" subtitle="Your last interactions with the task management system">
        <div className="space-y-3 mt-2">
          {auditLogs.slice(0, 6).map((log, idx) => (
            <div key={log.id} className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900">{log.action}</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">{log.details}</p>
                <p className="text-[10px] text-slate-400 mt-1">{log.timestamp} · by {log.user_name}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <EditProfileModal isOpen={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  );
};

export default ProfilePage;
