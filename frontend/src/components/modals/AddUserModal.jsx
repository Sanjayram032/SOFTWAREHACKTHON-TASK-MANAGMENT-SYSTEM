import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Input, Select } from '../common/Input';
import Button from '../common/Button';
import { useTask } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';

const AddUserModal = ({ isOpen, onClose, defaultRole = '', hideRole = false }) => {
  const { addUser, departments, users, addDepartment } = useTask();
  const { currentUser } = useAuth();

  const initialRole = defaultRole || 'student';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: initialRole,
    department: 'Computer Science',
    customDepartment: '',
    phone: '',
    supervisor_id: 'u-2'
  });

  useEffect(() => {
    if (departments.length > 0) {
      setFormData((prev) => ({
        ...prev,
        department: prev.department || departments[0] || 'Computer Science'
      }));
    }
  }, [departments]);

  useEffect(() => {
    if (defaultRole) {
      setFormData((prev) => ({ ...prev, role: defaultRole }));
    }
  }, [defaultRole]);

  const [errors, setErrors] = useState({});

  const staffList = users.filter(u => u.role === 'staff');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email address is required';

    if (formData.customDepartment.trim() && !departments.includes(formData.customDepartment.trim())) {
      formData.department = formData.customDepartment.trim();
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (formData.customDepartment.trim()) {
        await addDepartment(formData.customDepartment.trim());
      }
      await addUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        phone: formData.phone,
        supervisorId: formData.supervisor_id
      });
      onClose();
      setFormData({
        name: '',
        email: '',
        role: 'student',
        department: departments[0] || 'Computer Science',
        customDepartment: '',
        phone: '',
        supervisor_id: 'u-2'
      });
      setErrors({});
    } catch (error) {
      setErrors({ form: error.message });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={defaultRole === 'student' ? 'Add New Student' : 'Add New User Account'}
      subtitle={defaultRole === 'student'
        ? 'Enter student name, email, and mobile number to onboard a new student.'
        : 'Onboard new Staff or Student into the institutional system'}
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
          {!hideRole && (
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
          )}

          <Select
            label="Department"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            options={departments.length > 0 ? departments : ['Computer Science', 'Data Science & AI', 'Electrical Engineering', 'Mechanical Engineering', 'Administration & Academic Affairs']}
            helpText="Select an existing department or add a new one below."
          />
        </div>

        <Input
          label="New Department (optional)"
          placeholder="Add a new department if not listed"
          value={formData.customDepartment}
          onChange={(e) => setFormData({ ...formData, customDepartment: e.target.value })}
          helpText="Enter a department name to add it dynamically to the dropdown."
        />

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
          label="Mobile Number"
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
