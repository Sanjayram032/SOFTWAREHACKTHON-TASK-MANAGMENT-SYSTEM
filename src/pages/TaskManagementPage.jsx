import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import StatusBadge from '../components/common/StatusBadge';
import CreateTaskModal from '../components/modals/CreateTaskModal';
import { Input, Select } from '../components/common/Input';
import { Plus, Search, Filter, Edit2, Trash2, Eye } from 'lucide-react';
import ReviewSubmissionModal from '../components/modals/ReviewSubmissionModal';

const CATEGORIES = ['All', 'Course Completion', 'Subject Assignment', 'Monthly Meeting', 'Event Attendance', 'Custom Category'];
const PRIORITIES = ['All', 'High', 'Medium', 'Low'];
const STATUSES = ['All', 'Pending', 'In Progress', 'Completed', 'Overdue', 'Rejected'];

const TaskManagementPage = () => {
  const { tasks, submissions } = useTask();
  const { currentUser, activeRole } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [taskSection, setTaskSection] = useState('admin');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const currentUserId = currentUser?._id || currentUser?.id;

  const adminAssignedTasks = tasks.filter((task) =>
    (task.assigned_to === currentUserId || task.assignedTo === currentUserId) &&
    (task.assigned_to_role === 'staff' || task.assignedToRole === 'staff')
  );
  const staffAssignedStudentTasks = tasks.filter((task) =>
    (task.created_by === currentUserId || task.createdBy === currentUserId) &&
    (task.assigned_to_role === 'student' || task.assignedToRole === 'student')
  );

  const visibleTasks = activeRole === 'student'
    ? tasks.filter((task) => task.assigned_to === currentUserId || task.assignedTo === currentUserId)
    : activeRole === 'staff'
      ? (taskSection === 'admin' ? adminAssignedTasks : staffAssignedStudentTasks)
      : tasks;
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const taskSubmissionMap = submissions.reduce((map, submission) => {
    map[submission.task_id || submission.taskId] = submission;
    return map;
  }, {});

  const filtered = visibleTasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                        t.assigned_to_name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === 'All' || t.category === filterCategory;
    const matchPri = filterPriority === 'All' || t.priority === filterPriority;
    const matchStat = filterStatus === 'All' || t.status === filterStatus;
    return matchSearch && matchCat && matchPri && matchStat;
  });

  const priorityColors = {
    High: 'bg-rose-100 text-rose-700 border-rose-200',
    Medium: 'bg-amber-100 text-amber-700 border-amber-200',
    Low: 'bg-slate-100 text-slate-600 border-slate-200'
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Task Repository</h1>
          <p className="text-xs text-slate-500 mt-0.5">View, filter, and manage all institutional tasks across roles.</p>
        </div>
        {(activeRole === 'admin' || activeRole === 'staff') && (
          <Button variant="primary" icon={Plus} onClick={() => setCreateOpen(true)}>
            Create New Task
          </Button>
        )}
      </div>

      {/* Task Section Tabs for Staff */}
      {activeRole === 'staff' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setTaskSection('admin')}
              className={`px-4 py-2 rounded-2xl text-sm font-semibold ${taskSection === 'admin' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Admin Assigned Tasks
            </button>
            <button
              type="button"
              onClick={() => setTaskSection('student')}
              className={`px-4 py-2 rounded-2xl text-sm font-semibold ${taskSection === 'student' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Student Assignments
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title or assignee..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
              />
            </div>
          </div>
          <div className="w-44">
            <Select
              label="Category"
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              options={CATEGORIES}
            />
          </div>
          <div className="w-36">
            <Select
              label="Priority"
              value={filterPriority}
              onChange={e => setFilterPriority(e.target.value)}
              options={PRIORITIES}
            />
          </div>
          <div className="w-40">
            <Select
              label="Status"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              options={STATUSES}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => { setSearch(''); setFilterCategory('All'); setFilterPriority('All'); setFilterStatus('All'); }}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Filter className="w-4 h-4" />
        Showing <span className="text-blue-600 font-bold">{filtered.length}</span> of {visibleTasks.length} tasks
      </div>

      {/* Tasks Table */}
      <Table
        columns={[
          { header: 'Task Title' },
          { header: 'Category' },
          { header: 'Priority' },
          { header: 'Deadline' },
          { header: 'Assigned To' },
          { header: 'Status' },
          { header: 'Actions' }
        ]}
        data={filtered}
        emptyText="No tasks match your filters."
        renderRow={(task) => (
          <>
            <td className="px-4 py-3.5">
              <div>
                <p className="font-bold text-slate-900 text-xs">{task.title}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs line-clamp-1">{task.description}</p>
              </div>
            </td>
            <td className="px-4 py-3.5 text-xs text-slate-600 font-medium whitespace-nowrap">{task.category}</td>
            <td className="px-4 py-3.5">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${priorityColors[task.priority] || 'bg-slate-100 text-slate-600'}`}>
                {task.priority}
              </span>
            </td>
            <td className="px-4 py-3.5 text-xs text-slate-600 whitespace-nowrap">{task.deadline}</td>
            <td className="px-4 py-3.5">
              <div>
                <p className="text-xs font-bold text-slate-900">{task.assigned_to_name}</p>
                <p className="text-[11px] text-slate-400 capitalize">{task.assigned_to_role}</p>
              </div>
            </td>
            <td className="px-4 py-3.5 whitespace-nowrap">
              <StatusBadge status={task.status} />
            </td>
            <td className="px-4 py-3.5">
              <div className="flex flex-wrap items-center gap-2">
                {activeRole === 'staff' && taskSubmissionMap[task.id] && (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Eye}
                    onClick={() => setSelectedSubmission(taskSubmissionMap[task.id])}
                  >
                    Review Proof
                  </Button>
                )}
                {activeRole !== 'staff' && activeRole !== 'student' && (
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Task">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {activeRole === 'admin' && (
                      <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete Task">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
                {activeRole === 'student' && (
                  <span className="text-[11px] text-slate-400 italic">View only</span>
                )}
              </div>
            </td>
          </>
        )}
      />

      <CreateTaskModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
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

export default TaskManagementPage;
