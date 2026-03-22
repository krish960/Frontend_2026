import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Github, Linkedin, Sparkles } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Inbox } from "lucide-react";

const GOOGLE_CLIENT_ID  = process.env.REACT_APP_GOOGLE_CLIENT_ID  || '';
const GITHUB_CLIENT_ID  = process.env.REACT_APP_GITHUB_CLIENT_ID  || '';
const LINKEDIN_CLIENT_ID = process.env.REACT_APP_LINKEDIN_CLIENT_ID || '';

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18L12.048 13.56C11.243 14.1 10.212 14.42 9 14.42c-2.392 0-4.417-1.615-5.142-3.788H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
      <path d="M3.858 10.632c-.183-.55-.288-1.137-.288-1.732s.105-1.182.288-1.732V4.836H.957C.347 6.053 0 7.441 0 8.9s.347 2.847.957 4.064l2.901-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.836l2.901 2.332C4.583 5.195 6.608 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function AuthCard({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-100">PortfolioAI</span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-slate-100">{title}</h1>
          <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
        </div>
        <div className="glass-card border border-white/10">{children}</div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const navigate   = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const [form, setForm]     = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      const err = result.error;
      if (err?.non_field_errors) {
        toast.error(err.non_field_errors[0]);
      } else {
        setErrors(err || {});
        toast.error('Login failed. Check your credentials.');
      }
    }
  };

  const handleOAuth = (provider) => {
    const origin = window.location.origin;
    if (provider === 'github') {
      window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user:email,repo&redirect_uri=${origin}/oauth/github`;
    } else if (provider === 'google') {
      const params = new URLSearchParams({
        client_id:     GOOGLE_CLIENT_ID,
        redirect_uri:  `${origin}/oauth/google`,
        response_type: 'code',
        scope:         'openid email profile',
      });
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    } else if (provider === 'linkedin') {
      const params = new URLSearchParams({
        response_type: 'code',
        client_id:     LINKEDIN_CLIENT_ID,
        redirect_uri:  `${origin}/oauth/linkedin`,
        scope:         'r_liteprofile r_emailaddress',
      });
      window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* OAuth */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { p: 'google',   icon: <GoogleIcon />,           label: 'Google' },
            { p: 'github',   icon: <Github size={15} />,     label: 'GitHub' },
            { p: 'linkedin', icon: <Linkedin size={15} />,   label: 'LinkedIn' },
          ].map(({ p, icon, label }) => (
            <button key={p} type="button" onClick={() => handleOAuth(p)}
              className="btn-secondary flex items-center justify-center gap-1.5 text-xs py-2.5">
              {icon} {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-slate-600 text-xs">
          <div className="flex-1 h-px bg-white/10" />
          or continue with email
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="label">Email address</label>
          <input type="email" required autoComplete="email"
            className={`input ${errors.email ? 'border-red-500/50' : ''}`}
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email[0]}</p>}
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="label">Password</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} required autoComplete="current-password"
              className={`input pr-11 ${errors.password ? 'border-red-500/50' : ''}`}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              onClick={() => setShowPw(!showPw)}>
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password[0]}</p>}
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 mt-1">
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing in…
            </span>
          ) : 'Sign In'}
        </button>

        <p className="text-center text-sm text-slate-500">
          No account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
            Create one free
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
