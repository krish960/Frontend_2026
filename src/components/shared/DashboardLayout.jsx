import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, User, Inbox, BarChart2,
  Github, LogOut, Menu, Plus, Sparkles, ChevronRight, X,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { label: 'Dashboard',   icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Portfolios',  icon: Briefcase,        href: '/portfolios' },
  { label: 'Analytics',  icon: BarChart2,         href: '/analytics' },
  { label: 'Inbox',      icon: Inbox,             href: '/inbox' },
  { label: 'Profile',    icon: User,              href: '/profile' },
  { label: 'GitHub',     icon: Github,            href: '/integrations/github' },
];

function SidebarContent({ onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  const avatarLetter = (user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center shadow-md shadow-brand-500/25 flex-shrink-0">
            <Sparkles size={15} className="text-white" />
          </div>
          <span className="font-display font-bold text-slate-100 tracking-tight">PortfolioAI</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 md:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* New Portfolio button */}
      <div className="px-4 py-4">
        <Link to="/portfolios/new" onClick={onClose}
          className="btn-primary text-sm w-full flex items-center justify-center gap-2">
          <Plus size={15} />
          New Portfolio
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const active = location.pathname === href ||
            (href !== '/dashboard' && location.pathname.startsWith(href));
          return (
            <Link key={href} to={href} onClick={onClose}
              className={`sidebar-link ${active ? 'active' : ''}`}>
              <Icon size={17} />
              <span>{label}</span>
              {active && <ChevronRight size={13} className="ml-auto text-brand-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user?.profile_photo
              ? <img src={user.profile_photo} alt="" className="w-full h-full object-cover" />
              : <span className="text-white text-sm font-bold">{avatarLetter}</span>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">
              {user?.full_name || user?.username}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button onClick={handleLogout}
            className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-400/10"
            title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-surface-900 border-r border-white/10 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-10 w-60 bg-surface-900 border-r border-white/10 animate-slide-in">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 border-b border-white/10 flex items-center justify-between px-5 bg-surface-900/50 backdrop-blur-xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-slate-400 hover:text-slate-200 transition-colors"
              onClick={() => setSidebarOpen(true)}>
              <Menu size={21} />
            </button>
            {title && <h1 className="text-[15px] font-semibold text-slate-100">{title}</h1>}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 md:p-6 animate-fade-in max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
