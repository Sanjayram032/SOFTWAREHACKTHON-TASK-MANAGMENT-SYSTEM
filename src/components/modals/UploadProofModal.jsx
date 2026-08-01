import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Input, Select } from '../common/Input';
import Button from '../common/Button';
import { useTask } from '../../context/TaskContext';
import { useAuth } from '../../context/AuthContext';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

const UploadProofModal = ({ isOpen, onClose, defaultTaskId = null }) => {
  const { tasks, submitProof } = useTask();
  const { currentUser } = useAuth();
  const currentUserId = currentUser?._id || currentUser?.id;

  // Filter tasks assigned only to this student
  const studentTasks = tasks.filter(
    (t) => t.assigned_to === currentUserId || t.assignedTo === currentUserId
  );

  const [formData, setFormData] = useState({
    task_id: defaultTaskId || (studentTasks[0] ? studentTasks[0].id : ''),
    file_name: 'Assignment_Proof_Certificate.pdf',
    file_size: '2.5 MB',
    remarks: ''
  });

  const selectedTask = studentTasks.find(
    (t) => t.id === formData.task_id || t._id === formData.task_id
  );
  const proofFormat = selectedTask?.proof_format || 'Either';
  const acceptedFiles = proofFormat === 'Photo'
    ? '.png,.jpg,.jpeg'
    : proofFormat === 'Document'
      ? '.pdf,.docx'
      : '.pdf,.docx,.png,.jpg,.jpeg';

  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        file_name: file.name,
        file_size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.task_id) {
      setErrors({ task_id: 'Please select a task to upload proof for' });
      return;
    }

    submitProof(formData, currentUser);
    onClose();
    setSelectedFile(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Task Completion Proof"
      subtitle={`Submit ${proofFormat === 'Photo' ? 'a photo proof' : proofFormat === 'Document' ? 'a document proof' : 'proof document or photo'} based on task requirements`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select Task"
          value={formData.task_id}
          onChange={(e) => setFormData({ ...formData, task_id: e.target.value })}
          error={errors.task_id}
          options={studentTasks.map(t => ({
            label: `${t.title} (Deadline: ${t.deadline})`,
            value: t.id
          }))}
        />

        {/* Drag & Drop File Box */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Attach Document / Certificate (PDF, DOCX, PNG)</label>
          <div className="border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center bg-blue-50/40 hover:bg-blue-50 transition-colors relative cursor-pointer group">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
              accept={acceptedFiles}
            />
            <div className="flex flex-col items-center justify-center gap-2">
              {selectedFile ? (
                <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                  <CheckCircle2 className="w-6 h-6" />
                  <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-white rounded-full text-blue-600 shadow-xs group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Click or drag file to upload</p>
                    <p className="text-[11px] text-slate-500">Supports PDF, DOCX, PNG, JPG (Max 10MB)</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Notes / Remarks for Supervisor</label>
          <textarea
            rows="2"
            placeholder="Add optional completion comments..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-hidden"
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={UploadCloud}>
            Submit Proof
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UploadProofModal;
