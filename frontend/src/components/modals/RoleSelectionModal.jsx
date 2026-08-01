import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const RoleSelectionModal = ({ isOpen, onClose, onConfirm, email }) => {
  const [selectedRole, setSelectedRole] = useState('student');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(selectedRole);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose Your Role"
      subtitle="Select the role you will use in the system. This choice is saved and cannot be changed later."
      maxWidth="max-w-md"
    >
      <div className="space-y-5">
        <p className="text-sm text-slate-600">
          Signing in with <span className="font-semibold text-slate-900">{email || 'your Google account'}</span>. Please choose your institutional role.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {['admin', 'staff', 'student'].map((role) => (
              <label key={role} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 hover:border-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value={role}
                  checked={selectedRole === role}
                  onChange={() => setSelectedRole(role)}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <div>
                  <p className="font-semibold capitalize text-slate-900">{role}</p>
                  <p className="text-xs text-slate-500">
                    {role === 'admin' ? 'Administrator access to manage staff and system settings.' : role === 'staff' ? 'Faculty or staff access to assign students tasks.' : 'Student access to view and complete assigned tasks.'}
                  </p>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Confirm Role
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default RoleSelectionModal;
