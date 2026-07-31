import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import Button from '../components/common/Button';
import ForgotPasswordModal from '../components/modals/ForgotPasswordModal';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, GraduationCap } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('arthur.p@university.edu');
  const [password, setPassword] = useState('password123');
  const [rolePreset, setRolePreset] = useState('admin');
  const [error, setError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);

  const handleRolePresetSelect = (role) => {
    setRolePreset(role);
    if (role === 'admin') {
      setEmail('arthur.p@university.edu');
      setPassword('password123');
    } else if (role === 'staff') {
      setEmail('sarah.j@university.edu');
      setPassword('password123');
    } else {
      setEmail('alex.rivera@student.edu');
      setPassword('password123');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const success = login(email, password);
    if (!success) {
      setError('Authentication failed. Please use a registered institutional email.');
      return;
    }

    setError('');
    const normalizedEmail = email.toLowerCase();
    if (normalizedEmail.includes('@student.edu')) {
      navigate('/student/dashboard');
    } else if (normalizedEmail.includes('@university.edu')) {
      const staffEmails = ['sarah.j@university.edu', 'robert.c@university.edu', 'elena.r@university.edu', 'maya.s@university.edu'];
      if (staffEmails.includes(normalizedEmail)) {
        navigate('/staff/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
      {/* Left Form Section */}
      <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
        <div>
          {/* Institutional Header & Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl blue-gradient-bg flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-500/20">
              🎓
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 text-xl tracking-tight">University Academic Portal</h1>
              <p className="text-xs font-semibold text-blue-600">Role-Based Task Management System</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900">System Sign In</h2>
            <p className="text-xs text-slate-500 mt-1">Access your role dashboard (Administrator, Staff, or Student)</p>
          </div>

          {/* Quick Preset Selector for Easy Testing */}
          <div className="mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Select Quick Test Persona:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRolePresetSelect('admin')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  rolePreset === 'admin' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleRolePresetSelect('staff')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  rolePreset === 'staff' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Staff</span>
              </button>

              <button
                type="button"
                onClick={() => handleRolePresetSelect('student')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  rolePreset === 'student' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Input
              label="Institutional Email"
              type="email"
              icon={Mail}
              placeholder="user@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div>
              <Input
                label="Password"
                type="password"
                icon={Lock}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              icon={ArrowRight}
              iconPosition="right"
            >
              Sign In to Dashboard
            </Button>
            {error && (
              <p className="text-sm text-rose-600 mt-2">{error}</p>
            )}
          </form>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
          🔒 Secure Role-Based Access Control • Institutional SSO Compatible
        </div>
      </div>

      {/* Right Hero Section */}
      <div className="lg:col-span-5 blue-gradient-bg p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-blue-100 border border-white/20 mb-6">
            Institutional Workflow
          </span>
          <h3 className="text-3xl font-extrabold leading-tight mb-4">
            Digitized Task Delegation & Monitoring
          </h3>
          <p className="text-sm text-blue-100 leading-relaxed mb-6">
            Streamlining the workflow chain from Administrators to Department Staff and Students with automated deadline enforcement and proof verification.
          </p>
        </div>

        {/* Workflow Diagram Card */}
        <div className="relative z-10 space-y-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">1</div>
            <p className="text-xs font-medium">Admin issues institutional task to Staff</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">2</div>
            <p className="text-xs font-medium">Staff delegates sub-tasks to Students</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">3</div>
            <p className="text-xs font-medium">Students upload proof for review & closure</p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal isOpen={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  );
};

export default LoginPage;
