import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import ReviewSubmissionModal from '../components/modals/ReviewSubmissionModal';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import { Eye, FileText } from 'lucide-react';

const TABS = ['All', 'Pending', 'Approved', 'Rejected'];

const SubmissionsPage = () => {
  const { submissions, tasks, users } = useTask();
  const { activeRole } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [adminViewMode, setAdminViewMode] = useState('student');
  const [selectedSub, setSelectedSub] = useState(null);

  const isAdminStudentTask = (sub) => {
    const task = tasks.find((t) => t.id === sub.task_id || t._id === sub.task_id);
    if (!task) return false;
    return task.assigned_to_role === 'student' || task.assignedToRole === 'student' || task.assigned_to === sub.submitted_by || task.assignedTo === sub.submitted_by;
  };

  const isAdminStaffTask = (sub) => {
    const task = tasks.find((t) => t.id === sub.task_id || t._id === sub.task_id);
    if (!task) return false;
    return task.assigned_to_role === 'staff' || task.assignedToRole === 'staff';
  };

  const viewSubmissions = activeRole === 'admin'
    ? submissions.filter((sub) => adminViewMode === 'student' ? isAdminStudentTask(sub) : isAdminStaffTask(sub))
    : submissions;

  const pendingCount = viewSubmissions.filter(s => s.status === 'Pending').length;
  const approvedCount = viewSubmissions.filter(s => s.status === 'Approved').length;
  const rejectedCount = viewSubmissions.filter(s => s.status === 'Rejected').length;

  const filtered = viewSubmissions.filter(s => activeTab === 'All' || s.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <h1 className="text-2xl font-black text-slate-900">Proof Submissions</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {activeRole === 'student'
            ? 'Track your uploaded proof documents and review results.'
            : 'Review and approve/reject student uploaded proof documents.'}
        </p>
      </div>

      {/* Submission Summary */}
      {activeRole === 'admin' && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAdminViewMode('student')}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold ${adminViewMode === 'student' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            Student Task Submissions
          </button>
          <button
            type="button"
            onClick={() => setAdminViewMode('staff')}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold ${adminViewMode === 'staff' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            Staff Task Submissions
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card title="Pending Reviews" subtitle="Awaiting staff/admin action">
          <p className="text-3xl font-black text-amber-600">{pendingCount}</p>
        </Card>
        <Card title="Approved" subtitle="Verified student submissions">
          <p className="text-3xl font-black text-emerald-600">{approvedCount}</p>
        </Card>
        <Card title="Rejected" subtitle="Needs resubmission">
          <p className="text-3xl font-black text-rose-600">{rejectedCount}</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === tab
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
            <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
              activeTab === tab ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'
            }`}>
              {submissions.filter(s => tab === 'All' || s.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Submissions Table */}
      <Table
        columns={[
          { header: 'Task Title' },
          { header: 'Submitted By' },
          { header: 'Document' },
          { header: 'Submitted At' },
          { header: 'Status' },
          { header: 'Reviewed By' },
          { header: 'Actions' }
        ]}
        data={filtered}
        emptyText="No submissions found in this category."
        renderRow={(sub) => (
          <>
            <td className="px-4 py-3.5 font-bold text-slate-900 text-xs max-w-52">
              <span className="line-clamp-2">{sub.task_title}</span>
            </td>
            <td className="px-4 py-3.5 text-xs text-slate-800 font-semibold">{sub.submitted_by_name}</td>
            <td className="px-4 py-3.5">
              <div className="flex items-center gap-1.5 text-xs text-blue-600">
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="font-medium truncate max-w-32">{sub.file_name}</span>
                <span className="text-[10px] text-slate-400">({sub.file_size})</span>
              </div>
            </td>
            <td className="px-4 py-3.5 text-[11px] text-slate-600 whitespace-nowrap">{sub.submitted_at}</td>
            <td className="px-4 py-3.5 whitespace-nowrap">
              <StatusBadge status={sub.status} />
            </td>
            <td className="px-4 py-3.5 text-xs text-slate-600">
              {sub.reviewed_by ? (
                <div>
                  <p className="font-semibold text-slate-800">{sub.reviewed_by}</p>
                  <p className="text-[10px] text-slate-400">{sub.reviewed_at}</p>
                </div>
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </td>
            <td className="px-4 py-3.5">
              {(() => {
                const task = tasks.find((t) => t.id === sub.task_id || t._id === sub.task_id);
                const creator = users.find((u) => u.id === task?.created_by || u._id === task?.created_by || u.id === task?.createdBy || u._id === task?.createdBy);
                const assignedStudentTask = task && ((task.assigned_to_role === 'student' || task.assignedToRole === 'student') || (task.assigned_to === sub.submitted_by || task.assignedTo === sub.submitted_by));
                const canReviewAction = activeRole === 'staff' || (activeRole === 'admin' && adminViewMode === 'staff');

                if (activeRole === 'student') {
                  return sub.review_remarks ? (
                    <button
                      onClick={() => setSelectedSub(sub)}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      View Remarks
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">Awaiting review</span>
                  );
                }

                if (canReviewAction) {
                  return (
                    <Button
                      size="sm"
                      variant="outline"
                      icon={Eye}
                      onClick={() => setSelectedSub(sub)}
                    >
                      Review
                    </Button>
                  );
                }

                return (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Eye}
                    disabled
                    className="opacity-50 cursor-not-allowed"
                  >
                    View Only
                  </Button>
                );
              })()}
            </td>
          </>
        )}
      />

      {selectedSub && (
        <ReviewSubmissionModal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          submission={selectedSub}
        />
      )}
    </div>
  );
};

export default SubmissionsPage;
