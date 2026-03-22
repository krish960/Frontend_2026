import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import DashboardLayout from '../components/shared/DashboardLayout';
import { portfolioApi } from '../utils/api';
import toast from 'react-hot-toast';

const TEMPLATES = [
  {
    id: 'professional',
    name: 'Professional',
    desc: 'Clean and corporate — ideal for job applications',
    gradient: 'from-slate-700 to-slate-900',
    accent: '#6366f1',
    preview: { bg: '#1e293b', nav: '#334155', card: '#475569' },
  },
  {
    id: 'modern',
    name: 'Modern',
    desc: 'Bold typography and gradient accents',
    gradient: 'from-brand-600 to-violet-700',
    accent: '#8b5cf6',
    preview: { bg: '#0f172a', nav: '#1e1b4b', card: '#312e81' },
  },
  {
    id: 'creative',
    name: 'Creative',
    desc: 'Expressive layout for designers and artists',
    gradient: 'from-rose-500 to-orange-500',
    accent: '#f43f5e',
    preview: { bg: '#1c0a09', nav: '#3b0a0a', card: '#7f1d1d' },
  },
  {
    id: 'tech',
    name: 'Tech',
    desc: 'Terminal-inspired dark theme for engineers',
    gradient: 'from-cyan-600 to-blue-700',
    accent: '#06b6d4',
    preview: { bg: '#020617', nav: '#0c1a2e', card: '#0e2746' },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    desc: 'Understated elegance — lets your work speak',
    gradient: 'from-zinc-500 to-zinc-700',
    accent: '#a1a1aa',
    preview: { bg: '#fafafa', nav: '#f1f1f1', card: '#e5e5e5' },
  },
];

function TemplatePreview({ template, selected, onClick }) {
  const { preview } = template;
  return (
    <div
      onClick={onClick}
      className={`template-card ${selected ? 'selected' : 'border-white/10'}`}
    >
      {/* Mock portfolio preview */}
      <div className="h-52 relative overflow-hidden" style={{ background: preview.bg }}>
        {/* Nav bar */}
        <div className="h-8 flex items-center px-4 gap-2" style={{ background: preview.nav }}>
          <div className="w-4 h-4 rounded-full" style={{ background: template.accent, opacity: 0.8 }} />
          <div className="h-1.5 w-16 rounded-full bg-white/20" />
          <div className="ml-auto flex gap-1.5">
            {[10, 8, 10].map((w, i) => (
              <div key={i} className="h-1.5 rounded-full bg-white/20" style={{ width: `${w * 2}px` }} />
            ))}
          </div>
        </div>

        {/* Hero section */}
        <div className="px-6 pt-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full" style={{ background: template.accent, opacity: 0.7 }} />
            <div>
              <div className="h-2 w-24 rounded-full bg-white/40 mb-1.5" />
              <div className="h-1.5 w-16 rounded-full bg-white/20" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-2 w-full rounded-full bg-white/20" />
            <div className="h-2 w-4/5 rounded-full bg-white/15" />
            <div className="h-2 w-3/5 rounded-full bg-white/10" />
          </div>
          {/* Skill bars */}
          <div className="mt-4 space-y-1.5">
            {[85, 70, 92].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-1.5 w-14 rounded-full bg-white/20" />
                <div className="flex-1 h-1.5 rounded-full bg-white/10">
                  <div className="h-full rounded-full" style={{ width: `${w}%`, background: template.accent, opacity: 0.7 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 bg-surface-900">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-slate-100">{template.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{template.desc}</p>
          </div>
          {selected && (
            <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 ml-2">
              <Check size={13} className="text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState('professional');
  const [form, setForm] = useState({ title: '', tagline: '' });
  const [loading, setLoading] = useState(false);

  const template = TEMPLATES.find((t) => t.id === selected);

  const handleCreate = async () => {
    if (!form.title.trim()) {
      toast.error('Please enter a portfolio title');
      return;
    }
    setLoading(true);
    try {
      const { data } = await portfolioApi.create({
        title: form.title,
        tagline: form.tagline,
        template: selected,
        primary_color: template.accent,
      });
      toast.success('Portfolio created!');
      navigate(`/portfolios/${data.id}/edit`);
    } catch (err) {
      toast.error('Failed to create portfolio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Choose a Template">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold text-slate-100 mb-1">Pick your style</h2>
          <p className="text-slate-400">You can switch templates at any time after creation.</p>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {TEMPLATES.map((t) => (
            <TemplatePreview
              key={t.id}
              template={t}
              selected={selected === t.id}
              onClick={() => setSelected(t.id)}
            />
          ))}
        </div>

        {/* Portfolio details */}
        <div className="glass-card max-w-lg">
          <h3 className="font-semibold text-slate-100 mb-4">Portfolio details</h3>
          <div className="space-y-4">
            <div className="form-group">
              <label className="label">Portfolio title *</label>
              <input
                type="text" className="input"
                placeholder="e.g. My Developer Portfolio"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="label">Tagline <span className="text-slate-600">(optional)</span></label>
              <input
                type="text" className="input"
                placeholder="e.g. Full-Stack Developer & Open Source Enthusiast"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-slate-500">Selected template:</span>
              <span className="badge-info">{template?.name}</span>
            </div>
            <button
              onClick={handleCreate} disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {loading ? 'Creating…' : 'Create Portfolio'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
