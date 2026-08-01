import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import Button from '../components/common/Button';
import ForgotPasswordModal from '../components/modals/ForgotPasswordModal';
import RoleSelectionModal from '../components/modals/RoleSelectionModal';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { signInWithRedirect, getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import { auth, provider } from '../firebaseConfig';

const LoginPage = () => {
  const { login, googleSignIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [forgotOpen, setForgotOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleSelectionMode, setRoleSelectionMode] = useState('');
  const [pendingGoogleToken, setPendingGoogleToken] = useState('');
  const [googleCandidateEmail, setGoogleCandidateEmail] = useState('');
  const [isRedirectProcessing, setIsRedirectProcessing] = useState(false);
  const GOOGLE_ROLE_KEY = 'tms_google_role';

  useEffect(() => {
    const cleanup = onAuthStateChanged(auth, async (user) => {
      if (!user || isRedirectProcessing) return;

      try {
        setIsRedirectProcessing(true);
        const result = await getRedirectResult(auth);
        const redirectUser = result?.user || user;
        if (!redirectUser) return;

        const idToken = await redirectUser.getIdToken();
        const preferredRole = localStorage.getItem(GOOGLE_ROLE_KEY) || undefined;
        if (preferredRole) {
          localStorage.removeItem(GOOGLE_ROLE_KEY);
        }

        const response = await googleSignIn(idToken, preferredRole);

        if (response.needsRole) {
          setPendingGoogleToken(idToken);
          setGoogleCandidateEmail(response.email || '');
          setRoleSelectionMode('postSignIn');
          setRoleModalOpen(true);
          return;
        }

        if (!response.success) {
          setGoogleError(response.message || 'Google sign-in failed.');
          return;
        }

        const role = response.user?.role || 'student';
        if (role === 'student') {
          navigate('/student/dashboard');
        } else if (role === 'staff') {
          navigate('/staff/dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      } catch (error) {
        setGoogleError(error.message || 'Google sign-in failed.');
      } finally {
        setIsRedirectProcessing(false);
      }
    });

    return () => cleanup();
  }, [googleSignIn, navigate, isRedirectProcessing]);

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleError('');
    setRoleSelectionMode('preSignIn');
    setRoleModalOpen(true);
  };

  const handleRoleModalClose = () => {
    setRoleModalOpen(false);
    setRoleSelectionMode('');
    if (roleSelectionMode === 'preSignIn') {
      localStorage.removeItem(GOOGLE_ROLE_KEY);
    }
    setPendingGoogleToken('');
    setGoogleCandidateEmail('');
  };

  const handleRoleConfirm = async (role) => {
    setGoogleError('');
    setError('');

    if (roleSelectionMode === 'preSignIn') {
      localStorage.setItem(GOOGLE_ROLE_KEY, role);
      setRoleModalOpen(false);
      setRoleSelectionMode('');

      try {
        await signInWithRedirect(auth, provider);
      } catch (error) {
        setGoogleError(error.message || 'Google sign-in failed.');
      }
      return;
    }

    if (!pendingGoogleToken) {
      setGoogleError('Unable to complete Google login. Please try again.');
      return;
    }

    const result = await googleSignIn(pendingGoogleToken, role);
    if (!result.success) {
      setGoogleError(result.message || 'Google sign-in failed.');
      return;
    }

    setRoleModalOpen(false);
    setPendingGoogleToken('');
    setRoleSelectionMode('');

    if (result.user?.role === 'student') {
      navigate('/student/dashboard');
    } else if (result.user?.role === 'staff') {
      navigate('/staff/dashboard');
    } else {
      navigate('/admin/dashboard');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (!result.success) {
      setError(result.message || 'Authentication failed. Please use a registered institutional email.');
      return;
    }

    const normalizedEmail = (result.user?.email || email).toLowerCase();
    if (normalizedEmail.includes('@student.edu')) {
      navigate('/student/dashboard');
    } else if (normalizedEmail.includes('@university.edu')) {
      if ((result.user?.role || 'admin') === 'staff') {
        navigate('/staff/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-145">
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
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleGoogleSignIn}
              >
                Sign in with Google
              </Button>
              {googleError && <p className="text-sm text-rose-600 mt-2">{googleError}</p>}
            </div>
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
      <RoleSelectionModal
        isOpen={roleModalOpen}
        onClose={handleRoleModalClose}
        onConfirm={handleRoleConfirm}
        email={googleCandidateEmail}
      />
    </div>
  );
};

export default LoginPage;
