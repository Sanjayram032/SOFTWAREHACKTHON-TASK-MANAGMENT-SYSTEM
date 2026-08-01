import React from 'react';
import { useTask } from '../context/TaskContext';
import Card from '../components/common/Card';
import CompletionRateChart from '../components/charts/CompletionRateChart';
import StaffPerformanceBar from '../components/charts/StaffPerformanceBar';
import { BarChart3, TrendingUp, AlertTriangle, Clock, CheckCircle2, RefreshCw } from 'lucide-react';

const ReportsPage = () => {
  const { tasks, submissions } = useTask();

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Completed').length;
  const pending = tasks.filter(t => t.status === 'Pending').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const overdue = tasks.filter(t => t.status === 'Overdue').length;
  const rejected = tasks.filter(t => t.status === 'Rejected').length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const approvedSubs = submissions.filter(s => s.status === 'Approved').length;
  const rejectedSubs = submissions.filter(s => s.status === 'Rejected').length;
  const pendingSubs = submissions.filter(s => s.status === 'Pending').length;

  const statusData = [
    { label: 'Completed', count: completed, color: 'bg-emerald-500', textColor: 'text-emerald-700', pct: total > 0 ? Math.round((completed/total)*100) : 0 },
    { label: 'In Progress', count: inProgress, color: 'bg-blue-500', textColor: 'text-blue-700', pct: total > 0 ? Math.round((inProgress/total)*100) : 0 },
    { label: 'Pending', count: pending, color: 'bg-amber-400', textColor: 'text-amber-700', pct: total > 0 ? Math.round((pending/total)*100) : 0 },
    { label: 'Overdue', count: overdue, color: 'bg-orange-500', textColor: 'text-orange-700', pct: total > 0 ? Math.round((overdue/total)*100) : 0 },
    { label: 'Rejected', count: rejected, color: 'bg-rose-500', textColor: 'text-rose-700', pct: total > 0 ? Math.round((rejected/total)*100) : 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900">Reports & Analytics</h1>
        <p className="text-xs text-slate-500 mt-0.5">Institutional task performance insights, staff analytics, and submission statistics.</p>
      </div>

      {/* Summary Metric Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total', value: total, icon: BarChart3, color: 'text-blue-600 bg-blue-50' },
          { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'In Progress', value: inProgress, icon: RefreshCw, color: 'text-blue-500 bg-blue-50' },
          { label: 'Pending', value: pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Overdue', value: overdue, icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
          { label: 'Completion Rate', value: `${rate}%`, icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50' },
        ].map((m, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm card-hover">
            <div className={`p-2 rounded-xl w-fit mb-2 ${m.color}`}>
              <m.icon className="w-4 h-4" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">{m.value}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Rate Ring */}
        <Card title="Overall Completion Rate" subtitle="Task completion tracking across all departments" icon={TrendingUp}>
          <CompletionRateChart rate={rate} completed={completed} inProgress={inProgress} overdue={overdue} />
        </Card>

        {/* Task Status Distribution Bar */}
        <Card title="Task Status Distribution" subtitle="Breakdown of all institutional task statuses">
          <div className="space-y-3 py-2">
            {statusData.map((s, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className={s.textColor}>{s.label}</span>
                  <span className="text-slate-600">{s.count} tasks ({s.pct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.color} rounded-full transition-all duration-700`}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Staff Performance + Submission Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Staff Performance" subtitle="Task completion rate per faculty member" icon={BarChart3}>
          <StaffPerformanceBar />
        </Card>

        <Card title="Submission Overview" subtitle="Proof document submission review status">
          <div className="space-y-4 py-2">
            {[
              { label: 'Total Submissions', value: submissions.length, color: 'bg-slate-200' },
              { label: 'Approved', value: approvedSubs, color: 'bg-emerald-500', pct: submissions.length > 0 ? Math.round((approvedSubs/submissions.length)*100) : 0 },
              { label: 'Pending Review', value: pendingSubs, color: 'bg-amber-400', pct: submissions.length > 0 ? Math.round((pendingSubs/submissions.length)*100) : 0 },
              { label: 'Rejected / Revision', value: rejectedSubs, color: 'bg-rose-500', pct: submissions.length > 0 ? Math.round((rejectedSubs/submissions.length)*100) : 0 },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-900">{item.value}</span>
                  {item.pct !== undefined && (
                    <span className="text-[10px] text-slate-400 ml-1">({item.pct}%)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
