import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Eye, Users, Activity } from 'lucide-react';
import DashboardLayout from '../components/shared/DashboardLayout';
import { analyticsApi } from '../utils/api';
import { format, subDays } from 'date-fns';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass border border-white/10 rounded-xl px-3 py-2 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-brand-300 font-semibold">{payload[0].value} views</p>
    </div>
  );
};

function fillData(raw = []) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = format(subDays(new Date(), 6 - i), 'MMM d');
    const match = raw.find((r) => format(new Date(r.date), 'MMM d') === d);
    return { date: d, views: match?.count || 0 };
  });
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.dashboard()
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const chartData = data ? fillData(data.daily_views) : [];
  const growth = data?.weekly_growth ?? 0;

  return (
    <DashboardLayout title="Analytics">
      <div className="mb-6">
        <h2 className="text-2xl font-display font-bold text-slate-100">Analytics Overview</h2>
        <p className="text-slate-400 mt-1">Track how your portfolios are performing.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Eye, label: 'Total Views', value: data?.total_views ?? 0, color: 'text-brand-400 bg-brand-500/10' },
          { icon: TrendingUp, label: 'This Week', value: data?.this_week_views ?? 0, color: 'text-emerald-400 bg-emerald-500/10' },
          { icon: Users, label: 'Last Week', value: data?.last_week_views ?? 0, color: 'text-amber-400 bg-amber-500/10' },
          {
            icon: Activity,
            label: 'Growth',
            value: `${growth > 0 ? '+' : ''}${growth}%`,
            color: growth >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass-card">
            <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={16} />
            </div>
            <p className="text-2xl font-display font-bold text-slate-100">
              {loading ? '—' : value?.toLocaleString?.() ?? value}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card">
          <h3 className="font-semibold text-slate-200 mb-1">Daily Views (7 days)</h3>
          <p className="text-xs text-slate-500 mb-5">Across all published portfolios</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2} fill="url(#grad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card">
          <h3 className="font-semibold text-slate-200 mb-1">Views by Day (bar)</h3>
          <p className="text-xs text-slate-500 mb-5">Comparison view</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="views" fill="#6366f1" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top portfolio */}
      {data?.top_portfolio && (
        <div className="glass-card mt-6">
          <h3 className="font-semibold text-slate-200 mb-4">Top Performing Portfolio</h3>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="font-medium text-slate-100">{data.top_portfolio.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{data.top_portfolio.public_url}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-display font-bold text-brand-400">
                {data.top_portfolio.views.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500">total views</p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
