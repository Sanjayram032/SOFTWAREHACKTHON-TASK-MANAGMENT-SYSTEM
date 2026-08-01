import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import StatusBadge from '../common/StatusBadge';
import { useTask } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { FileText, CheckCircle, XCircle, Download } from 'lucide-react';

const ReviewSubmissionModal = ({ isOpen, onClose, submission }) => {
  const { reviewSubmission, tasks, users } = useTask();
  const { currentUser, activeRole } = useAuth();
  const [remarks, setRemarks] = useState('');

  if (!submission) return null;

  const task = tasks.find((t) => t.id === submission.task_id || t._id === submission.task_id);
  const creator = users.find((u) => u.id === task?.created_by || u._id === task?.created_by || u.id === task?.createdBy || u._id === task?.createdBy);
  const assignedStudentTask = task && (
    task.assigned_to_role === 'student' ||
    task.assignedToRole === 'student' ||
    task.assigned_to === submission.submitted_by ||
    task.assignedTo === submission.submitted_by
  );
  const isStaffAssignedStudentTask = assignedStudentTask && creator?.role === 'staff';
  const canReview = activeRole === 'staff' || (activeRole === 'admin' && !isStaffAssignedStudentTask);

  const handleApprove = async () => {
    try {
      await reviewSubmission(submission.id, 'Approved', remarks || 'Verified and approved.', currentUser);
      onClose();
      setRemarks('');
    } catch (error) {
      alert(error.message || 'Unable to approve submission.');
    }
  };

  const handleReject = async () => {
    try {
      await reviewSubmission(submission.id, 'Rejected', remarks || 'Needs correction and resubmission.', currentUser);
      onClose();
      setRemarks('');
    } catch (error) {
      alert(error.message || 'Unable to reject submission.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review Student Submission"
      subtitle={`Submitted by ${submission.submitted_by_name} for "${submission.task_title}"`}
    >
      <div className="space-y-4">
        {/* File Preview Card */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{submission.file_name}</p>
              <p className="text-[11px] text-slate-500">Size: {submission.file_size} • Submitted: {submission.submitted_at}</p>
            </div>
          </div>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); alert(`Simulated file download for ${submission.file_name}`); }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </a>
        </div>

        {/* Current Status */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600">Current Status:</span>
          <StatusBadge status={submission.status} />
        </div>

        {/* Previous Remarks if any */}
        {submission.review_remarks && (
          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900">
            <span className="font-bold">Existing Remarks ({submission.reviewed_by}): </span>
            {submission.review_remarks}
          </div>
        )}

        {/* Supervisor Remarks Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Supervisor Remarks / Review Comments</label>
          <textarea
            rows="3"
            placeholder="Add review feedback or reason for approval/rejection..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-hidden"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>

          {canReview ? (
            <div className="flex items-center gap-2">
              <Button 
                variant="danger" 
                icon={XCircle} 
                onClick={handleReject}
              >
                Reject Submission
              </Button>
              <Button 
                variant="success" 
                icon={CheckCircle} 
                onClick={handleApprove}
              >
                Approve Submission
              </Button>
            </div>
          ) : (
            <div className="text-sm text-slate-500">
              Only staff and admin can approve or reject submissions.
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ReviewSubmissionModal;
