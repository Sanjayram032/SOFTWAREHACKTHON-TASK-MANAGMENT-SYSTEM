import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeStyle = (statusName) => {
    const statusLower = (statusName || '').toLowerCase();
    
    switch (statusLower) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200 ring-amber-500/20';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-200 ring-blue-500/20';
      case 'completed':
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 ring-emerald-500/20';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200 ring-rose-500/20';
      case 'overdue':
        return 'bg-orange-100 text-orange-800 border-orange-200 ring-orange-500/20';
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200 ring-green-500/20';
      case 'inactive':
        return 'bg-slate-100 text-slate-600 border-slate-200 ring-slate-500/20';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/20';
    }
  };

  const getDotColor = (statusName) => {
    const statusLower = (statusName || '').toLowerCase();
    switch (statusLower) {
      case 'pending': return 'bg-amber-500';
      case 'in progress': return 'bg-blue-500';
      case 'completed': case 'approved': case 'active': return 'bg-emerald-500';
      case 'rejected': return 'bg-rose-500';
      case 'overdue': return 'bg-orange-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-xs ring-1 ring-inset ${getBadgeStyle(status)}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor(status)} animate-pulse`} />
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
