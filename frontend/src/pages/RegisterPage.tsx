import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, AlertCircle, ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { authService } from '../services';
import { useAuthStore } from '../store/authStore';

const getRegistrationErrorMessage = (err: unknown): string => {
  const fallback = 'Registration failed. Please try again.';
  if (typeof err !== 'object' || err === null) return fallback;
  const apiError = err as {
    response?: { data?: { message?: string; error?: string; details?: Record<string, string> } };
    code?: string;
  };
  if (apiError.code === 'ERR_NETWORK') return 'Cannot connect to server. Please try again later.';
  const details = apiError.response?.data?.details;
  if (details && typeof details === 'object') {
    const firstDetail = Object.values(details).find((v) => typeof v === 'string' && v.trim());
    if (firstDetail) return firstDetail;
  }
  return apiError.response?.data?.message || apiError.response?.data?.error || fallback;
};

/* ── Password strength helper ── */
const getPasswordStrength = (pw: string): { label: string; color: string; width: string; score: number } => {
  if (!pw) return { label: '', color: '', width: '0%', score: 0 };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '20%', score };
  if (score <= 2) return { label: 'Fair', color: 'bg-orange-500', width: '40%', score };
  if (score <= 3) return { label: 'Good', color: 'bg-yellow-500', width: '60%', score };
  if (score <= 4) return { label: 'Strong', color: 'bg-green-500', width: '80%', score };
  return { label: 'Very Strong', color: 'bg-emerald-400', width: '100%', score };
};

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setTokens } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'GUEST' as 'GUEST' | 'OWNER',
  });

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  /* ── Client‑side validation ── */
  const validate = (): string | null => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) return 'First name and last name are required.';
    if (!formData.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email address.';
    if (!formData.username.trim()) return 'Username is required.';
    if (formData.username.length < 3) return 'Username must be at least 3 characters.';
    if (!/^[a-zA-Z0-9]+$/.test(formData.username)) return 'Username can only contain letters and numbers.';
    if (formData.password.length < 8) return 'Password must be at least 8 characters long.';
    if (formData.password !== confirmPassword) return 'Passwords do not match.';
    if (formData.phone && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(formData.phone))
      return 'Please enter a valid phone number.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      // Send only the fields the backend expects (exclude confirmPassword)
      const { ...payload } = formData;
      if (!payload.phone) delete (payload as Record<string, unknown>).phone;

      const response = await authService.register(payload);
      const { accessToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      setTokens(accessToken, '');
      setUser(user);

      setSuccess('Account created successfully! Redirecting…');
      setTimeout(() => navigate(formData.role === 'OWNER' ? '/dashboard' : '/'), 1000);
    } catch (err: unknown) {
      setError(getRegistrationErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-[#E50914]/60 focus:ring-1 focus:ring-[#E50914]/30 transition-all text-sm';
  const inputWithIconClass =
    'w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-[#E50914]/60 focus:ring-1 focus:ring-[#E50914]/30 transition-all text-sm';

  return (
    <div className="min-h-screen bg-[#141414] relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&h=1080&fit=crop&q=60"
          alt=""
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-[#141414]/60" />
      </div>

      {/* Back button */}
      <div className="relative z-10 px-4 sm:px-8 pt-6">
        <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      {/* Form */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-60px)] px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-2xl w-full max-w-md p-8"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <span className="text-2xl font-black text-[#E50914]">STAYEASE</span>
            <h2 className="text-2xl font-bold text-white mt-3">Create Account</h2>
            <p className="text-white/40 text-sm mt-1">Join the world's best homestay platform</p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 bg-[#E50914]/10 border border-[#E50914]/20 rounded-lg flex items-center gap-3 text-[#E50914] text-sm"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Success message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-400 text-sm"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {success}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First / Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required
                  autoComplete="given-name" className={inputClass} placeholder="John" />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/50 mb-1.5">Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required
                  autoComplete="family-name" className={inputClass} placeholder="Doe" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} required
                  autoComplete="email" className={inputWithIconClass} placeholder="john@example.com" />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                <input type="text" name="username" value={formData.username} onChange={handleChange} required
                  autoComplete="username" className={inputWithIconClass} placeholder="johndoe" />
              </div>
              {formData.username && formData.username.length < 3 && (
                <p className="text-xs text-orange-400 mt-1">Min 3 characters, letters & numbers only</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="new-password"
                  className={inputWithIconClass + ' !pr-10'}
                  placeholder="Min 8 characters"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-white/30 hover:text-white/60 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength bar */}
              {formData.password && (
                <div className="mt-1.5">
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${passwordStrength.color} rounded-full transition-all duration-300`}
                      style={{ width: passwordStrength.width }} />
                  </div>
                  <p className={`text-xs mt-0.5 ${
                    passwordStrength.score <= 1 ? 'text-red-400' :
                    passwordStrength.score <= 2 ? 'text-orange-400' :
                    passwordStrength.score <= 3 ? 'text-yellow-400' : 'text-green-400'
                  }`}>{passwordStrength.label}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(''); }}
                  required
                  autoComplete="new-password"
                  className={inputWithIconClass + ' !pr-10'}
                  placeholder="Re-enter your password"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-3 text-white/30 hover:text-white/60 transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && formData.password !== confirmPassword && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
              {confirmPassword && formData.password && formData.password === confirmPassword && (
                <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                  autoComplete="tel" className={inputWithIconClass} placeholder="+91 84319 56616" />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Account Type</label>
              <select name="role" value={formData.role} onChange={handleChange}
                className={inputClass + ' appearance-none'}>
                <option value="GUEST" className="bg-[#232323]">Guest — I want to book stays</option>
                <option value="OWNER" className="bg-[#232323]">Owner — I want to list properties</option>
              </select>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading || !!success}
              className="w-full btn-netflix !rounded-lg !py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : (
                'Sign Up'
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-white/40 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-white hover:text-[#E50914] font-medium transition-colors">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
