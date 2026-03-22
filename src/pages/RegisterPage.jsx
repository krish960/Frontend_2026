import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, CheckCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate   = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm]     = useState({
    email: '', username: '', first_name: '', last_name: '',
    password: '', password2: '',
  });

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const pwStrength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8)  s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const strength = pwStrength(form.password);
  const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-yellow-400', 'bg-emerald-500'][strength];
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (form.password !== form.password2) {
      setErrors({ password2: ['Passwords do not match.'] });
      return;
    }
    const result = await register(form);
    if (result.success) {
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } else {
      setErrors(result.error || {});
      const first = Object.values(result.error || {})[0];
      toast.error(Array.isArray(first) ? first[0] : 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-content-center shadow-lg shadow-brand-500/30 flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-xl text-slate-100">PortfolioAI</span>
          </Link>
          <h1 className="text-2xl font-display font-bold text-slate-100">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">Start building your portfolio today</p>
        </div>

        <div className="glass-card border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="form-group">
                <label className="label">First name</label>
                <input type="text" className="input" placeholder="Jane" value={form.first_name} onChange={f('first_name')} />
              </div>
              <div className="form-group">
                <label className="label">Last name</label>
                <input type="text" className="input" placeholder="Doe" value={form.last_name} onChange={f('last_name')} />
              </div>
            </div>

            <div className="form-group">
              <label className="label">
                Username
                <span className="text-slate-600 font-normal ml-1">· your public URL</span>
              </label>
              <input type="text" required className={`input ${errors.username ? 'border-red-500/50' : ''}`}
                placeholder="janedoe" value={form.username} onChange={f('username')} />
              {errors.username
                ? <p className="text-red-400 text-xs mt-1">{errors.username[0]}</p>
                : form.username && <p className="text-slate-500 text-xs mt-1">portfolioai.app/p/{form.username}</p>
              }
            </div>

            <div className="form-group">
              <label className="label">Email address</label>
              <input type="email" required className={`input ${errors.email ? 'border-red-500/50' : ''}`}
                placeholder="you@example.com" value={form.email} onChange={f('email')} />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email[0]}</p>}
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required minLength={8}
                  className={`input pr-11 ${errors.password ? 'border-red-500/50' : ''}`}
                  placeholder="min. 8 characters" value={form.password} onChange={f('password')} />
                <button type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColor : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{strengthLabel} password</p>
                </div>
              )}
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password[0]}</p>}
            </div>

            <div className="form-group">
              <label className="label">Confirm password</label>
              <div className="relative">
                <input type="password" required className={`input pr-9 ${errors.password2 ? 'border-red-500/50' : ''}`}
                  placeholder="••••••••" value={form.password2} onChange={f('password2')} />
                {form.password2 && form.password === form.password2 && (
                  <CheckCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400" />
                )}
              </div>
              {errors.password2 && <p className="text-red-400 text-xs mt-1">{errors.password2[0]}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 mt-1">
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
