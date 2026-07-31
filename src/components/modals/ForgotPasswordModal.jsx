import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Input } from '../common/Input';
import Button from '../common/Button';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSent(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { setSent(false); onClose(); }}
      title="Reset Password"
      subtitle="Enter your institutional email address to receive password reset instructions"
    >
      {sent ? (
        <div className="py-6 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl">
            ✉️
          </div>
          <h4 className="font-bold text-slate-800 text-base">Reset Link Dispatched</h4>
          <p className="text-xs text-slate-600">
            Instructions have been sent to <span className="font-semibold text-blue-600">{email}</span>. Please check your institutional mailbox.
          </p>
          <Button variant="primary" onClick={() => { setSent(false); onClose(); }}>
            Back to Login
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Institutional Email"
            type="email"
            placeholder="username@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Send Reset Link
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ForgotPasswordModal;
