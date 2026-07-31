import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import UploadProofModal from '../components/modals/UploadProofModal';
import { 
  Clock, 
  CheckCircle2, 
  CalendarClock, 
  UploadCloud,
  AlertTriangle
} from 'lucide-react';

const StudentDashboard = () => {
  const { tasks, submissions } = useTask();
  const { currentUser } = useAuth();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // Filter tasks for this student
  const myTasks = tasks.filter(t => t.assigned_to === currentUser.id || t.assigned_to_role === 'student');
  const pendingTasks = myTasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
  const completedTasks = myTasks.filter(t => t.status === 'Completed').length;
  const upcomingDeadlines = myTasks.filter(t => {
    const diff = (new Date(t.deadline) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7 && t.status !== 'Completed';
  }).length;

  const today = new Date();
  const getDaysLeft = (deadline) => {
    const diff = Math.ceil((new Date(deadline) - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            Student Workspace
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">My Task Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track your assignments and monitor submission status.</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card hover={true}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Tasks</p>
              <h3 className="text-3xl font-black text-amber-600 mt-1">{pendingTasks}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Awaiting upload or in review</p>
        </Card>

        <Card hover={true}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Tasks</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">{completedTasks}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Proof approved by supervisor</p>
        </Card>

        <Card hover={true}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Deadlines</p>
              <h3 className="text-3xl font-black text-rose-600 mt-1">{upcomingDeadlines}</h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <CalendarClock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Due within next 7 days</p>
        </Card>
      </div>

      {/* Task List */}
      <Card title="My Assigned Tasks" subtitle="All tasks delegated by your supervising faculty staff">
        <div className="space-y-3">
          {myTasks.length > 0 ? myTasks.map((task) => {
            const daysLeft = getDaysLeft(task.deadline);
            const submission = submissions.find(s => s.task_id === task.id);
            return (
              <div key={task.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{task.title}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        task.priority === 'High' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{task.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[11px] text-slate-500">📅 Deadline: <strong className="text-slate-700">{task.deadline}</strong></span>
                      {daysLeft < 0 ? (
                        <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Overdue</span>
                      ) : daysLeft <= 3 ? (
                        <span className="text-[11px] font-bold text-orange-600">{daysLeft}d remaining</span>
                      ) : (
                        <span className="text-[11px] text-slate-500">{daysLeft}d left</span>
                      )}
                    </div>
                    {submission && (
                      <p className="text-[11px] text-blue-600 font-semibold mt-1">
                        📎 Submitted: {submission.file_name} — <StatusBadge status={submission.status} />
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={task.status} />
                    {task.status !== 'Completed' && (
                      <Button
                        size="sm"
                        variant="primary"
                        icon={UploadCloud}
                        onClick={() => { setSelectedTaskId(task.id); setUploadOpen(true); }}
                      >
                        Upload Proof
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : (
            <p className="text-sm text-slate-500 text-center py-8">No tasks assigned yet. Check back later!</p>
          )}
        </div>
      </Card>

      <UploadProofModal isOpen={uploadOpen} onClose={() => setUploadOpen(false)} defaultTaskId={selectedTaskId} />
    </div>
  );
};

export default StudentDashboard;
