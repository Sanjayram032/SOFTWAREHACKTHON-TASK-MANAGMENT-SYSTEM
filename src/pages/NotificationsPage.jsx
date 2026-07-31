import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { Bell, CheckCheck, CheckSquare, Clock, ThumbsUp, ThumbsDown, AlertOctagon, BellOff } from 'lucide-react';

const NOTIF_TABS = ['All', 'Unread', 'Task Assigned', 'Deadline Reminder', 'Submission Approved', 'Submission Rejected', 'Query Escalation'];

const typeIconMap = {
  'Task Assigned': { icon: CheckSquare, color: 'bg-blue-100 text-blue-600' },
  'Deadline Reminder': { icon: Clock, color: 'bg-orange-100 text-orange-600' },
  'Submission Approved': { icon: ThumbsUp, color: 'bg-emerald-100 text-emerald-600' },
  'Submission Rejected': { icon: ThumbsDown, color: 'bg-rose-100 text-rose-600' },
  'Query Escalation': { icon: AlertOctagon, color: 'bg-purple-100 text-purple-600' },
  'Task Submission': { icon: CheckSquare, color: 'bg-blue-100 text-blue-600' }
};

const NotificationsPage = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useTask();
  const { currentUser, activeRole } = useAuth();
  const [activeTab, setActiveTab] = useState('All');

  const visibleNotifs = notifications.filter(n => {
    if (activeRole === 'admin') return true;
    return n.user_id === currentUser.id;
  });

  const filtered = visibleNotifs.filter(n => {
    if (activeTab === 'Unread') return !n.read_status;
    if (activeTab === 'All') return true;
    return n.type === activeTab;
  });

  const unreadCount = visibleNotifs.filter(n => !n.read_status).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {unreadCount > 0 ? (
              <span><strong className="text-blue-600">{unreadCount} unread</strong> notifications awaiting your attention.</span>
            ) : (
              'All caught up! No unread notifications.'
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" icon={CheckCheck} onClick={markAllNotificationsRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs — scrollable on mobile */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
        {NOTIF_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Notification Cards */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((notif) => {
            const typeInfo = typeIconMap[notif.type] || { icon: Bell, color: 'bg-slate-100 text-slate-600' };
            const IconComponent = typeInfo.icon;

            return (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                  !notif.read_status
                    ? 'bg-blue-50/50 border-blue-200/60 hover:border-blue-400'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl shrink-0 ${typeInfo.color}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-900">{notif.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                      </div>
                      {!notif.read_status && (
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0 animate-pulse" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 font-medium">{notif.sent_at}</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <BellOff className="w-10 h-10" />
            <p className="text-sm font-semibold">No notifications in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
