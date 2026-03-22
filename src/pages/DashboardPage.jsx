import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Eye, TrendingUp, Briefcase, Star, ArrowUpRight, Globe, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardLayout from '../components/shared/DashboardLayout';
import { PageLoader } from '../components/shared/LoadingSpinner';
import useAuthStore from '../store/authStore';
import { analyticsApi } from '../utils/api';
import { format, subDays } from 'date-fns';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass border border-white/10 rounded-xl px-3 py-2 text-xs">
      <p className="text-slate-400 mb-0.5">{label}</p>
      <p className="text-brand-300 font-semibold">{payload[0].value} views</p>
    </div>
  );
};

function fillWeek(raw = []) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = format(subDays(new Date(), 6 - i), 'MMM d');
    const m = raw.find((r) => {
      try { return format(new Date(r.date), 'MMM d') === d; } catch { return false; }
    });
    return { date: d, views: m?.count || 0 };
  });
}

function StatCard({ icon: Icon, label, value, badge, color = 'brand' }) {
  const colors = {
    brand:   'text-brand-400 bg-brand-500/10 border-brand-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber:   'text-amber-400 bg-amber-500/10 border-amber-500/20',
    violet:  'text-violet-400 bg-violet-500/10 border-violet-500/20',
  };
  return (
    <div className="glass-card hover:border-white/20 transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colors[color]}`}>
          <Icon size={18} />
        </div>
        {badge && (
          <span className={`text-xs font-semibold ${badge.startsWith('+') ? 'text-emerald-400' : 'text-slate-500'}`}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-slate-100 leading-tight">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    let cancelled = false;
    analyticsApi.dashboard()
      .then(({ data }) => { if (!cancelled) setAnalytics(data); })
      .catch(() => { /* 401 handled by interceptor, just stop loading */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const growth    = analytics?.weekly_growth ?? 0;
  const growthStr = growth > 0 ? `+${growth}%` : `${growth}%`;
  const chartData = fillWeek(analytics?.daily_views);

  if (loading) return (
    <DashboardLayout title="Dashboard">
      <PageLoader text="Loading analytics..." />
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-100">
            Hey, {user?.first_name || user?.username} 👋
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Here's what's happening with your portfolios.
          </p>
        </div>
        <Link to="/portfolios/new" className="btn-primary flex items-center gap-2 self-start sm:self-auto text-sm">
          <Plus size={15} /> New Portfolio
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatCard icon={Eye}      label="Total Views"   value={(analytics?.total_views ?? 0).toLocaleString()} badge={growthStr} color="brand" />
        <StatCard icon={TrendingUp} label="This Week"  value={(analytics?.this_week_views ?? 0).toLocaleString()} color="emerald" />
        <StatCard icon={Briefcase} label="Portfolios"  value={analytics?.total_portfolios ?? 0} badge={`${analytics?.published_portfolios ?? 0} live`} color="violet" />
        <StatCard icon={Activity}  label="Growth"      value={growthStr} color="amber" />
      </div>

      {/* Chart + Side panel */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 glass-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-slate-100">Portfolio Views</h3>
              <p className="text-xs text-slate-500 mt-0.5">Last 7 days</p>
            </div>
            <span className="badge-info text-xs"><Activity size={11} /> Live</span>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -22 }}>
              <defs>
                <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2} fill="url(#vg)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          {/* Top portfolio */}
          {analytics?.top_portfolio && (
            <div className="glass-card">
              <div className="flex items-center gap-2 mb-3">
                <Star size={15} className="text-amber-400" />
                <span className="text-sm font-semibold text-slate-200">Top Portfolio</span>
              </div>
              <p className="font-display font-semibold text-slate-100">{analytics.top_portfolio.title}</p>
              <p className="text-2xl font-bold text-brand-400 leading-tight mt-1">
                {analytics.top_portfolio.views.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">total views</p>
              {analytics.top_portfolio.is_published && (
                <a href={analytics.top_portfolio.public_url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 mt-3 transition-colors">
                  <Globe size={11} /> View live <ArrowUpRight size={11} />
                </a>
              )}
            </div>
          )}

          {/* Quick actions */}
          <div className="glass-card">
            <h3 className="text-sm font-semibold text-slate-200 mb-3">Quick Actions</h3>
            <div className="space-y-0.5">
              {[
                { label: 'Create Portfolio', href: '/portfolios/new', icon: Plus },
                { label: 'My Portfolios',   href: '/portfolios',     icon: Briefcase },
                { label: 'View Analytics',  href: '/analytics',      icon: TrendingUp },
                { label: 'Edit Profile',    href: '/profile',        icon: Activity },
              ].map(({ label, href, icon: Icon }) => (
                <Link key={href} to={href}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors text-sm text-slate-400 hover:text-slate-200 group">
                  <Icon size={14} className="text-slate-600 group-hover:text-slate-400" />
                  {label}
                  <ArrowUpRight size={11} className="ml-auto text-slate-700 group-hover:text-slate-500" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
