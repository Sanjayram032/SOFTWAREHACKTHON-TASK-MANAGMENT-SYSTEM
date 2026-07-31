import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import StatusBadge from '../components/common/StatusBadge';
import CreateTaskModal from '../components/modals/CreateTaskModal';
import ReviewSubmissionModal from '../components/modals/ReviewSubmissionModal';
import { 
  CheckSquare, 
  FileCheck, 
  GraduationCap, 
  CheckCircle2, 
  Plus, 
  Eye, 
  HelpCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StaffDashboard = () => {
  const { tasks, users, submissions } = useTask();
  const { currentUser } = useAuth();

  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Staff metrics
  const assignedTasksCount = tasks.filter(t => t.assigned_to === currentUser.id || t.created_by === currentUser.id).length;
  const pendingReviewsCount = submissions.filter(s => s.status === 'Pending').length;
  const managedStudentsCount = users.filter(u => u.role === 'student' && u.supervisor_id === currentUser.id).length || 3;
  const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;

  const studentTasks = tasks.filter(t => t.assigned_to_role === 'student' || t.created_by === currentUser.id);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            Faculty Staff Workspace
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Welcome, {currentUser.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">Delegate directives to students and review submitted proof documents.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/settings">
            <Button variant="outline" icon={HelpCircle}>
              Raise Query to Admin
            </Button>
          </Link>
          <Button variant="primary" icon={Plus} onClick={() => setCreateTaskOpen(true)}>
            Assign Task to Student
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card hover={true}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Tasks</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{assignedTasksCount}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">From Admin & self-delegated</p>
        </Card>

        <Card hover={true}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Reviews</p>
              <h3 className="text-3xl font-black text-amber-600 mt-1">{pendingReviewsCount}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Awaiting proof approval</p>
        </Card>

        <Card hover={true}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Managed Students</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{managedStudentsCount}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Under your direct supervision</p>
        </Card>

        <Card hover={true}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Tasks</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">{completedTasksCount}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Approved student submissions</p>
        </Card>
      </div>

      {/* Student Task List Table */}
      <Card 
        title="Student Task Tracking List" 
        subtitle="Active breakdown tasks assigned to undergraduate & postgraduate students"
        action={
          <Link to="/submissions" className="text-xs font-bold text-blue-600 hover:underline">
            Review Submissions ({pendingReviewsCount}) →
          </Link>
        }
      >
        <Table
          columns={[
            { header: 'Task Title' },
            { header: 'Assigned Student' },
            { header: 'Priority' },
            { header: 'Deadline' },
            { header: 'Status' },
            { header: 'Actions' }
          ]}
          data={studentTasks}
          renderRow={(task) => {
            const relatedSubmission = submissions.find(s => s.task_id === task.id);
            return (
              <>
                <td className="px-4 py-3.5 font-bold text-slate-900 text-xs">{task.title}</td>
                <td className="px-4 py-3.5 text-xs text-slate-800 font-semibold">{task.assigned_to_name}</td>
                <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">{task.priority}</td>
                <td className="px-4 py-3.5 text-xs text-slate-600">{task.deadline}</td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={task.status} />
                </td>
                <td className="px-4 py-3.5">
                  {relatedSubmission ? (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      icon={Eye} 
                      onClick={() => setSelectedSubmission(relatedSubmission)}
                    >
                      Review Proof
                    </Button>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium">Awaiting Upload</span>
                  )}
                </td>
              </>
            );
          }}
        />
      </Card>

      {/* Modals */}
      <CreateTaskModal isOpen={createTaskOpen} onClose={() => setCreateTaskOpen(false)} />
      {selectedSubmission && (
        <ReviewSubmissionModal
          isOpen={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          submission={selectedSubmission}
        />
      )}
    </div>
  );
};

export default StaffDashboard;
