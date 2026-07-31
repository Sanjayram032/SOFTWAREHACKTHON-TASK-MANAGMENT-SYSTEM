import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Input, Select } from '../common/Input';
import Button from '../common/Button';
import { useTask } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';

const AddUserModal = ({ isOpen, onClose }) => {
  const { addUser, users } = useTask();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    department: 'Computer Science',
    phone: '',
    supervisor_id: 'u-2'
  });

  const [errors, setErrors] = useState({});

  const staffList = users.filter(u => u.role === 'staff');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email address is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addUser(formData, currentUser);
    onClose();
    setFormData({
      name: '',
      email: '',
      role: 'student',
      department: 'Computer Science',
      phone: '',
      supervisor_id: 'u-2'
    });
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New User Account"
      subtitle="Onboard new Staff or Student into the institutional system"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="e.g. Dr. Jane Doe"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
        />

        <Input
          label="Institutional Email"
          type="email"
          placeholder="jane.doe@university.edu"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="User Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={[
              { label: 'Student', value: 'student' },
              { label: 'Staff (Faculty)', value: 'staff' },
              { label: 'Administrator', value: 'admin' }
            ]}
          />

          <Select
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            options={[
              'Computer Science',
              'Data Science & AI',
              'Electrical Engineering',
              'Mechanical Engineering',
              'Administration & Academic Affairs'
            ]}
          />
        </div>

        {formData.role === 'student' && (
          <Select
            label="Assigned Staff Supervisor"
            value={formData.supervisor_id}
            onChange={(e) => setFormData({ ...formData, supervisor_id: e.target.value })}
            options={staffList.map(s => ({
              label: `${s.name} (${s.department})`,
              value: s.id
            }))}
          />
        )}

        <Input
          label="Contact Phone"
          placeholder="+1 (555) 019-8800"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Create User Account
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddUserModal;
