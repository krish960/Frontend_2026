import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Edit3, Trash2, Globe, EyeOff, Eye,
  ExternalLink, MoreVertical, Briefcase
} from 'lucide-react';
import DashboardLayout from '../components/shared/DashboardLayout';
import { portfolioApi } from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const TEMPLATE_COLORS = {
  professional: 'from-slate-600 to-slate-800',
  modern: 'from-brand-600 to-violet-700',
  creative: 'from-rose-500 to-orange-500',
  tech: 'from-cyan-600 to-blue-700',
  minimal: 'from-zinc-500 to-zinc-700',
};

function PortfolioCard({ portfolio, onDelete, onTogglePublish }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const gradient = TEMPLATE_COLORS[portfolio.template] || TEMPLATE_COLORS.modern;

  return (
    <div className="card overflow-hidden hover:border-white/15 transition-all duration-300 group">
      {/* Preview banner */}
      <div className={`h-28 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
          <div>
            <div className="h-2 w-20 bg-white/40 rounded-full mb-1.5" />
            <div className="h-1.5 w-14 bg-white/25 rounded-full" />
          </div>
          <div
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{ background: portfolio.primary_color + '40', color: portfolio.primary_color, border: `1px solid ${portfolio.primary_color}50` }}
          >
            {portfolio.template}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-100 truncate">{portfolio.title}</h3>
            {portfolio.tagline && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{portfolio.tagline}</p>
            )}
          </div>
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 z-20 w-44 glass border border-white/10 rounded-xl py-1 shadow-2xl">
                  <Link
                    to={`/portfolios/${portfolio.id}/edit`}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Edit3 size={14} /> Edit
                  </Link>
                  <button
                    onClick={() => { onTogglePublish(portfolio.id); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-colors"
                  >
                    {portfolio.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                    {portfolio.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  {portfolio.is_published && (
                    <a
                      href={portfolio.public_url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <ExternalLink size={14} /> View Live
                    </a>
                  )}
                  <div className="h-px bg-white/10 my-1" />
                  <button
                    onClick={() => { onDelete(portfolio.id); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            {portfolio.is_published ? (
              <span className="badge-success"><Globe size={10} /> Live</span>
            ) : (
              <span className="badge bg-slate-700/50 text-slate-400 border border-white/10">
                <EyeOff size={10} /> Draft
              </span>
            )}
            <span className="text-xs text-slate-600">
              {format(new Date(portfolio.updated_at), 'MMM d')}
            </span>
          </div>
          <Link
            to={`/portfolios/${portfolio.id}/edit`}
            className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors flex items-center gap-1"
          >
            Edit <Edit3 size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioListPage() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPortfolios = () => {
    portfolioApi.list()
      .then(({ data }) => setPortfolios(data))
      .catch(() => toast.error('Failed to load portfolios'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPortfolios(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this portfolio? This cannot be undone.')) return;
    try {
      await portfolioApi.delete(id);
      setPortfolios((prev) => prev.filter((p) => p.id !== id));
      toast.success('Portfolio deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const { data } = await portfolioApi.togglePublish(id);
      setPortfolios((prev) => prev.map((p) =>
        p.id === id ? { ...p, is_published: data.is_published } : p
      ));
      toast.success(data.message);
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <DashboardLayout title="My Portfolios">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-100">My Portfolios</h2>
          <p className="text-slate-400 mt-1">{portfolios.length} portfolio{portfolios.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/portfolios/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Portfolio
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="h-28 bg-white/5" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-2/3 bg-white/5 rounded-lg" />
                <div className="h-3 w-1/2 bg-white/5 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : portfolios.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4">
            <Briefcase size={28} className="text-brand-400" />
          </div>
          <h3 className="font-semibold text-slate-200 mb-2">No portfolios yet</h3>
          <p className="text-slate-500 text-sm mb-6">Create your first portfolio and start impressing recruiters.</p>
          <Link to="/portfolios/new" className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Create Portfolio
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {portfolios.map((p) => (
            <PortfolioCard
              key={p.id}
              portfolio={p}
              onDelete={handleDelete}
              onTogglePublish={handleTogglePublish}
            />
          ))}
          {/* Add new card */}
          <Link
            to="/portfolios/new"
            className="card border-dashed hover:border-brand-500/40 hover:bg-brand-500/5 transition-all duration-300 flex flex-col items-center justify-center p-8 text-center min-h-[200px]"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center mb-3">
              <Plus size={20} className="text-brand-400" />
            </div>
            <p className="text-sm font-medium text-slate-400">Add new portfolio</p>
          </Link>
        </div>
      )}
    </DashboardLayout>
  );
}
