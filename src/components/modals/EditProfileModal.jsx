import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Input, Select } from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';

const EditProfileModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    phone: currentUser.phone || '',
    department: currentUser.department || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    Object.assign(currentUser, formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile Information"
      subtitle="Update your personal details and contact preferences"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <Input
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
