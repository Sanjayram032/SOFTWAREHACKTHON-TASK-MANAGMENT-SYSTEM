import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Input, Select } from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';

const EditProfileModal = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    department: '',
    avatar: ''
  });
  const [previewAvatar, setPreviewAvatar] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        department: currentUser.department || '',
        avatar: currentUser.avatar || ''
      });
      setPreviewAvatar(currentUser.avatar || '');
    }
  }, [currentUser, isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, avatar: previewUrl }));
    setPreviewAvatar(previewUrl);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
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

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700">Profile Photo</label>
          <div className="flex items-center gap-4">
            <img
              src={previewAvatar}
              alt="Profile preview"
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=CBD5E1&color=1F2937&size=80`; }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-xs text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>
        </div>

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
