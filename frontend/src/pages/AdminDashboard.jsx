import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import StatusBadge from '../components/common/StatusBadge';
import CreateTaskModal from '../components/modals/CreateTaskModal';
import AddUserModal from '../components/modals/AddUserModal';
import { 
  UserCheck, 
  GraduationCap, 
  CheckSquare, 
  CheckCircle2, 
  Plus, 
  UserPlus, 
  FileText, 
  AlertCircle, 
  Eye 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ReviewSubmissionModal from '../components/modals/ReviewSubmissionModal';

const AdminDashboard = () => {
  const { users, tasks, queries, submissions } = useTask();
  const { currentUser } = useAuth();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const totalStaff = users.filter(u => u.role === 'staff').length;
  const totalStudents = users.filter(u => u.role === 'student').length;
  const activeTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
  const pendingReviews = submissions.filter(s => s.status === 'Pending').length;
  const approvedReviews = submissions.filter(s => s.status === 'Approved').length;
  const rejectedReviews = submissions.filter(s => s.status === 'Rejected').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;

  const recentTasks = tasks;
  const studentSubmissionTasks = submissions.map((sub) => ({
    ...sub,
    task: tasks.find((task) => task.id === sub.task_id || task._id === sub.task_id)
  }));

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
            Administrator Workspace
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Welcome back, {currentUser.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">Overview of staff performance, active delegations, and escalations.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" icon={FileText} onClick={() => window.location.assign('/submissions')}>
            Review Submissions
          </Button>
          <Button variant="outline" icon={UserPlus} onClick={() => setAddUserOpen(true)}>
            Add User
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setCreateTaskOpen(true)}>
            Create Task
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card hover={true}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Staff</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{totalStaff}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Faculty supervisors & heads</p>
        </Card>

        <Card hover={true}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{totalStudents}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Enrolled active candidates</p>
        </Card>

        <Card hover={true}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Tasks</p>
              <h3 className="text-3xl font-black text-blue-600 mt-1">{activeTasks}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Pending or in progress</p>
        </Card>

        <Card hover={true}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Reviews</p>
              <h3 className="text-3xl font-black text-amber-600 mt-1">{pendingReviews}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Student proof awaiting review</p>
        </Card>

        <Card hover={true}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Reviews</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">{approvedReviews}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Submissions signed off</p>
        </Card>

        <Card hover={true}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rejected Reviews</p>
              <h3 className="text-3xl font-black text-rose-600 mt-1">{rejectedReviews}</h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Resubmissions required</p>
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
          <p className="text-[11px] text-slate-500 mt-3">Approved & closed directives</p>
        </Card>
      </div>

      {/* Recent Tasks Table */}
      <Card 
        title="All Institutional Tasks" 
        subtitle="Tasks currently assigned across staff and student workflows"
        action={
          <Link to="/tasks" className="text-xs font-bold text-blue-600 hover:underline">
            Open Task Management →
          </Link>
        }
      >
        <Table
          columns={[
            { header: 'Task Title' },
            { header: 'Category' },
            { header: 'Assigned To (Staff)' },
            { header: 'Deadline' },
            { header: 'Status' }
          ]}
          data={recentTasks}
          renderRow={(task) => (
            <>
              <td className="px-4 py-3.5">
                <div>
                  <p className="font-bold text-slate-900 text-xs">{task.title}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{task.description}</p>
                </div>
              </td>
              <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">{task.category}</td>
              <td className="px-4 py-3.5 text-xs text-slate-800 font-semibold">{task.assigned_to_name}</td>
              <td className="px-4 py-3.5 text-xs text-slate-600">{task.deadline}</td>
              <td className="px-4 py-3.5">
                <StatusBadge status={task.status} />
              </td>
            </>
          )}
        />
      </Card>

      {/* Review Submissions Section */}
      <Card 
        title="Review Student Submissions" 
        subtitle="Approve or reject proof uploads from students"
        action={
          <Link to="/submissions" className="text-xs font-bold text-blue-600 hover:underline">
            Open Full Review Page →
          </Link>
        }
      >
        <Table
          columns={[
            { header: 'Task Title' },
            { header: 'Submitted By' },
            { header: 'Deadline' },
            { header: 'Status' },
            { header: 'Actions' }
          ]}
          data={studentSubmissionTasks}
          emptyText="No student submissions available."
          renderRow={(item) => {
            const creator = users.find((u) => u.id === item.task?.created_by || u._id === item.task?.created_by || u.id === item.task?.createdBy || u._id === item.task?.createdBy);
            const assignedStudentTask = item.task && ((item.task.assigned_to_role === 'student' || item.task.assignedToRole === 'student') || (item.task.assigned_to === item.submitted_by || item.task.assignedTo === item.submitted_by));
            const isStaffAssignedStudentTask = assignedStudentTask && creator?.role === 'staff';
            const canReview = !isStaffAssignedStudentTask;

            return (
              <>
                <td className="px-4 py-3.5 font-bold text-slate-900 text-xs max-w-52">
                  <span className="line-clamp-2">{item.task?.title || item.task_title}</span>
                </td>
                <td className="px-4 py-3.5 text-xs text-slate-800 font-semibold">{item.submitted_by_name}</td>
                <td className="px-4 py-3.5 text-xs text-slate-600">{item.task?.deadline || item.submitted_at}</td>
                <td className="px-4 py-3.5 whitespace-nowrap"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-3.5">
                  {canReview ? (
                    <Button
                      size="sm"
                      variant={item.status === 'Rejected' ? 'danger' : 'outline'}
                      icon={Eye}
                      onClick={() => setSelectedSubmission(item)}
                    >
                      Review Proof
                    </Button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedSubmission(item)}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      View Status
                    </button>
                  )}
                </td>
              </>
            );
          }}
        />
      </Card>

      {/* Staff Escalations / Query Queue Box */}
      <Card 
        title="Staff Query & Escalation Queue" 
        subtitle="Unresolved queries raised by department staff"
        action={
          <Link to="/settings" className="text-xs font-bold text-blue-600 hover:underline">
            Manage Queries →
          </Link>
        }
      >
        <div className="space-y-3">
          {queries.length > 0 ? (
            queries.map((q) => (
              <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl mt-0.5">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">From: {q.raised_by_name}</span>
                    <h4 className="text-xs font-bold text-slate-900">{q.subject}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{q.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <StatusBadge status={q.status} />
                  <Link to="/settings">
                    <Button size="sm" variant="outline">Respond</Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 text-center py-4">No open queries in escalation queue.</p>
          )}
        </div>
      </Card>

      {/* Modals */}
      <CreateTaskModal isOpen={createTaskOpen} onClose={() => setCreateTaskOpen(false)} />
      <AddUserModal isOpen={addUserOpen} onClose={() => setAddUserOpen(false)} />
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

export default AdminDashboard;
