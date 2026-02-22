import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services';
import { useAuthStore } from '../store/authStore';

const getLoginErrorMessage = (err: unknown): string => {
  const fallback = 'Login failed. Please try again.';
  if (typeof err !== 'object' || err === null) return fallback;
  const apiError = err as {
    response?: { data?: { message?: string; error?: string } };
    code?: string;
  };
  if (apiError.code === 'ERR_NETWORK') return 'Cannot connect to server. Please try again later.';
  return apiError.response?.data?.message || apiError.response?.data?.error || fallback;
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setTokens } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(formData);
      const { accessToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      setTokens(accessToken, '');
      setUser(user);

      navigate(user.role === 'OWNER' ? '/dashboard' : '/');
    } catch (err: unknown) {
      setError(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const inputWithIconClass =
    'w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/30 outline-none focus:border-[#E50914]/60 focus:ring-1 focus:ring-[#E50914]/30 transition-all text-sm';

  return (
    <div className="min-h-screen bg-[#141414] relative overflow-hidden">
      {/* Background */}
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
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
        >
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
            <h2 className="text-2xl font-bold text-white mt-3">Welcome Back</h2>
            <p className="text-white/40 text-sm mt-1">Sign in to your account</p>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  className={inputWithIconClass}
                  placeholder="john@example.com"
                />
              </div>
            </div>

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
                  autoComplete="current-password"
                  className={inputWithIconClass + ' !pr-10'}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full btn-netflix !rounded-lg !py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-white/40 text-sm">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="text-white hover:text-[#E50914] font-medium transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
