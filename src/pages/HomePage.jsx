import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import { 
  CheckSquare, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  UserCheck, 
  GraduationCap 
} from 'lucide-react';

const HomePage = () => {
  const { tasks } = useTask();
  const { activeRole } = useAuth();
  const navigate = useNavigate();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
  const overdueTasks = tasks.filter(t => t.status === 'Overdue').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl blue-gradient-bg p-8 sm:p-10 text-white shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="inline-block px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-blue-100 border border-white/20">
            Institutional Workflow Automation
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Role-Based Task Management System
          </h1>
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
            Digitizing task assignment, delegation, and completion verification across Administrators, Faculty Staff, and Students with deadline warnings and proof review channels.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button 
              variant="secondary" 
              icon={ArrowRight} 
              iconPosition="right"
              onClick={() => {
                if (activeRole === 'admin') navigate('/admin/dashboard');
                else if (activeRole === 'staff') navigate('/staff/dashboard');
                else navigate('/student/dashboard');
              }}
            >
              Enter My {activeRole.toUpperCase()} Dashboard
            </Button>
            <Link to="/tasks">
              <Button variant="outline" className="text-white border-white/40 hover:bg-white/10 hover:text-white">
                View Task Repository
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card hover={true} className="border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Tasks</p>
              <h3 className="text-3xl font-black text-slate-900 mt-1">{totalTasks}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Across all departments & roles</p>
        </Card>

        <Card hover={true} className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Completed Tasks</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">{completedTasks}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Proof approved by supervisor</p>
        </Card>

        <Card hover={true} className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Tasks</p>
              <h3 className="text-3xl font-black text-amber-600 mt-1">{pendingTasks}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Active or under student review</p>
        </Card>

        <Card hover={true} className="border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Overdue Tasks</p>
              <h3 className="text-3xl font-black text-orange-600 mt-1">{overdueTasks}</h3>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">Requires immediate attention</p>
        </Card>
      </div>

      {/* Role Navigation Cards */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Explore System Roles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:border-blue-300">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Administrator Tier</h3>
            <p className="text-xs text-slate-500 mt-2 mb-4 leading-relaxed">
              Full system access. Create top-level tasks for Staff, manage user accounts, inspect audit trails, and export analytical reports.
            </p>
            <Link to="/admin/dashboard">
              <Button variant="outline" size="sm" className="w-full">Open Admin View</Button>
            </Link>
          </Card>

          <Card className="hover:border-blue-300">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-4">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Faculty Staff Tier</h3>
            <p className="text-xs text-slate-500 mt-2 mb-4 leading-relaxed">
              Receive Admin tasks, break down into student sub-tasks, review student proof submissions, and raise query escalations.
            </p>
            <Link to="/staff/dashboard">
              <Button variant="outline" size="sm" className="w-full">Open Staff View</Button>
            </Link>
          </Card>

          <Card className="hover:border-blue-300">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Student Tier</h3>
            <p className="text-xs text-slate-500 mt-2 mb-4 leading-relaxed">
              View assigned tasks, monitor deadlines, upload certificates/proof files, and track submission approval remarks.
            </p>
            <Link to="/student/dashboard">
              <Button variant="outline" size="sm" className="w-full">Open Student View</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
