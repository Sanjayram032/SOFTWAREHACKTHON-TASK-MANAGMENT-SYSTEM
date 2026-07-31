import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Input, Select } from '../common/Input';
import Button from '../common/Button';
import { useTask } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';

const CreateTaskModal = ({ isOpen, onClose }) => {
  const { users, createTask } = useTask();
  const { currentUser, activeRole } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Subject Assignment',
    priority: 'Medium',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assigned_to: '',
    parent_task_id: ''
  });

  const [errors, setErrors] = useState({});

  // Populate eligible assignees:
  // Admin assigns to Staff
  // Staff assigns to Students
  const eligibleAssignees = users.filter(u => {
    if (activeRole === 'admin') return u.role === 'staff';
    if (activeRole === 'staff') return u.role === 'student';
    return u.role !== 'admin';
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Task title is required';
    if (!formData.assigned_to) newErrors.assigned_to = 'Please assign task to a user';
    if (!formData.deadline) newErrors.deadline = 'Deadline is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createTask(formData, currentUser);
    onClose();
    // Reset form
    setFormData({
      title: '',
      description: '',
      category: 'Subject Assignment',
      priority: 'Medium',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assigned_to: '',
      parent_task_id: ''
    });
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      subtitle={activeRole === 'admin' ? "Assign new institutional directive to Staff" : "Assign breakdown task to Students"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Task Title"
          placeholder="e.g. NAAC Criteria Audit Report"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={errors.title}
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Description</label>
          <textarea
            rows="3"
            placeholder="Detailed task instructions and expectations..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-hidden"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            options={[
              'Course Completion',
              'Subject Assignment',
              'Monthly Meeting',
              'Event Attendance',
              'Custom Category'
            ]}
          />

          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            options={['Low', 'Medium', 'High']}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Deadline Date"
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            error={errors.deadline}
          />

          <Select
            label={`Assign To (${activeRole === 'admin' ? 'Staff Only' : 'Students Only'})`}
            value={formData.assigned_to}
            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
            error={errors.assigned_to}
            options={[
              { label: '-- Select Assignee --', value: '' },
              ...eligibleAssignees.map(u => ({
                label: `${u.name} (${u.department})`,
                value: u.id
              }))
            ]}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
