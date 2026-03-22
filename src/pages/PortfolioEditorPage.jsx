import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Globe, Settings, Layout, Briefcase,
  GraduationCap, Code, Palette, Plus, Trash2, GripVertical,
  ExternalLink, ChevronLeft, Check,
} from 'lucide-react';
import DashboardLayout from '../components/shared/DashboardLayout';
import { portfolioApi } from '../utils/api';
import toast from 'react-hot-toast';
import { Save, EyeOff } from "lucide-react";

const TABS = [
  { id: 'sections',   label: 'Sections',   icon: Layout },
  { id: 'projects',   label: 'Projects',   icon: Code },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education',  label: 'Education',  icon: GraduationCap },
  { id: 'theme',      label: 'Theme',      icon: Palette },
  { id: 'settings',   label: 'Settings',   icon: Settings },
];

const SECTION_LABELS = {
  about:'About Me', skills:'Skills', projects:'Projects',
  education:'Education', experience:'Experience', contact:'Contact', social:'Social Links',
};

// ── Section toggle row ────────────────────────────────────────────────────────
function SectionRow({ section, onToggle }) {
  return (
    <div className="flex items-center gap-3 p-3.5 glass rounded-xl group">
      <GripVertical size={15} className="text-slate-600 cursor-grab" />
      <span className="flex-1 text-sm font-medium text-slate-200">
        {section.title || SECTION_LABELS[section.section_type] || section.section_type}
      </span>
      <span className="text-xs text-slate-600 mr-2">
        {section.is_visible ? 'Visible' : 'Hidden'}
      </span>
      <button onClick={() => onToggle(section)}
        className={`w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${section.is_visible ? 'bg-indigo-500' : 'bg-white/10'}`}
        style={{position:'relative'}}>
        <span className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
          style={{left: section.is_visible ? '24px' : '2px', position:'absolute'}} />
      </button>
    </div>
  );
}

// ── Projects Tab ──────────────────────────────────────────────────────────────
function ProjectsTab({ portfolioId }) {
  const [projects, setProjects] = useState([]);
  const [adding,   setAdding]   = useState(false);
  const [form, setForm] = useState({ title:'', description:'', github_url:'', live_url:'', language:'', tech_stack:'' });

  useEffect(() => {
    portfolioApi.listProjects(portfolioId).then(({ data }) => setProjects(data));
  }, [portfolioId]);

  const add = async () => {
    if (!form.title.trim()) { toast.error('Title is required.'); return; }
    try {
      const { data } = await portfolioApi.createProject(portfolioId, {
        ...form,
        tech_stack: form.tech_stack ? form.tech_stack.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
      setProjects([...projects, data]);
      setForm({ title:'', description:'', github_url:'', live_url:'', language:'', tech_stack:'' });
      setAdding(false);
      toast.success('Project added!');
    } catch { toast.error('Failed to add project.'); }
  };

  const remove = async (id) => {
    try {
      await portfolioApi.deleteProject(portfolioId, id);
      setProjects(projects.filter(p => p.id !== id));
      toast.success('Deleted.');
    } catch { toast.error('Failed to delete.'); }
  };

  const f = k => e => setForm({...form, [k]: e.target.value});

  return (
    <div className="space-y-3">
      {projects.length === 0 && !adding && (
        <div className="text-center py-8 text-slate-500 text-sm">No projects yet. Add your first one!</div>
      )}
      {projects.map(p => (
        <div key={p.id} className="glass rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-semibold text-slate-100 truncate">{p.title}</h4>
                {p.language && <span className="badge-brand text-xs">{p.language}</span>}
                {p.stars > 0 && <span className="text-xs text-amber-400">★ {p.stars}</span>}
              </div>
              {p.description && <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>}
              <div className="flex items-center gap-3 mt-2">
                {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"><ExternalLink size={11}/>GitHub</a>}
                {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"><Globe size={11}/>Live</a>}
              </div>
            </div>
            <button onClick={() => remove(p.id)} className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0 p-1">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}

      {adding ? (
        <div className="glass rounded-xl p-5 border border-indigo-500/20 space-y-3">
          <p className="text-sm font-semibold text-slate-200 mb-1">New Project</p>
          <input className="input text-sm" placeholder="Project title *" value={form.title} onChange={f('title')} />
          <textarea className="input text-sm resize-none" rows={2} placeholder="Description" value={form.description} onChange={f('description')} />
          <div className="grid grid-cols-2 gap-2">
            <input className="input text-sm" placeholder="GitHub URL" value={form.github_url} onChange={f('github_url')} />
            <input className="input text-sm" placeholder="Live URL" value={form.live_url} onChange={f('live_url')} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className="input text-sm" placeholder="Language (e.g. Python)" value={form.language} onChange={f('language')} />
            <input className="input text-sm" placeholder="Tech (comma-separated)" value={form.tech_stack} onChange={f('tech_stack')} />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={add} className="btn-primary text-sm py-2">Add Project</button>
            <button onClick={() => setAdding(false)} className="btn-ghost text-sm py-2">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="w-full glass rounded-xl p-3.5 flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 border-dashed border-white/10 hover:border-indigo-500/30 transition-all">
          <Plus size={15} /> Add Project
        </button>
      )}
    </div>
  );
}

// ── Experience Tab ────────────────────────────────────────────────────────────
function ExperienceTab({ portfolioId }) {
  const [items, setItems] = useState([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ company:'', position:'', description:'', start_date:'', end_date:'', is_current:false, location:'' });

  useEffect(() => {
    portfolioApi.listExperience(portfolioId).then(({ data }) => setItems(data));
  }, [portfolioId]);

  const add = async () => {
    if (!form.company || !form.position || !form.start_date) { toast.error('Company, position, and start date required.'); return; }
    try {
      const { data } = await portfolioApi.createExperience(portfolioId, form);
      setItems([...items, data]);
      setForm({ company:'', position:'', description:'', start_date:'', end_date:'', is_current:false, location:'' });
      setAdding(false);
      toast.success('Experience added!');
    } catch { toast.error('Failed.'); }
  };

  const remove = async id => {
    try { await portfolioApi.deleteExperience(portfolioId, id); setItems(items.filter(i => i.id !== id)); }
    catch { toast.error('Failed.'); }
  };

  const f = k => e => setForm({...form, [k]: e.target.value});

  return (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.id} className="glass rounded-xl p-4 flex items-start gap-3">
          <div className="flex-1">
            <div className="font-semibold text-sm text-slate-100">{item.position}</div>
            <div className="text-indigo-400 text-xs font-medium mt-0.5">{item.company}</div>
            <div className="text-slate-500 text-xs mt-1">
              {item.start_date} — {item.is_current ? 'Present' : (item.end_date || '?')}
              {item.location && ` · ${item.location}`}
            </div>
            {item.description && <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">{item.description}</p>}
          </div>
          <button onClick={() => remove(item.id)} className="text-slate-600 hover:text-red-400 transition-colors p-1">
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      {adding ? (
        <div className="glass rounded-xl p-5 border border-indigo-500/20 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <input className="input text-sm" placeholder="Company *" value={form.company} onChange={f('company')} />
            <input className="input text-sm" placeholder="Position *" value={form.position} onChange={f('position')} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="label">Start date *</label><input type="date" className="input text-sm" value={form.start_date} onChange={f('start_date')} /></div>
            <div><label className="label">End date</label><input type="date" className="input text-sm" value={form.end_date} onChange={f('end_date')} disabled={form.is_current} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input type="checkbox" checked={form.is_current} onChange={e => setForm({...form, is_current:e.target.checked, end_date:''})} />
            Currently working here
          </label>
          <input className="input text-sm" placeholder="Location" value={form.location} onChange={f('location')} />
          <textarea className="input text-sm resize-none" rows={2} placeholder="Description" value={form.description} onChange={f('description')} />
          <div className="flex gap-2">
            <button onClick={add} className="btn-primary text-sm py-2">Add</button>
            <button onClick={() => setAdding(false)} className="btn-ghost text-sm py-2">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full glass rounded-xl p-3.5 flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 border-dashed border-white/10 hover:border-indigo-500/30 transition-all">
          <Plus size={15} /> Add Experience
        </button>
      )}
    </div>
  );
}

// ── Education Tab ─────────────────────────────────────────────────────────────
function EducationTab({ portfolioId }) {
  const [items, setItems] = useState([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ institution:'', degree:'', field_of_study:'', start_year:'', end_year:'', is_current:false });

  useEffect(() => {
    portfolioApi.listEducation(portfolioId).then(({ data }) => setItems(data));
  }, [portfolioId]);

  const add = async () => {
    if (!form.institution || !form.degree || !form.start_year) { toast.error('Institution, degree, and start year required.'); return; }
    try {
      const { data } = await portfolioApi.createEducation(portfolioId, form);
      setItems([...items, data]);
      setForm({ institution:'', degree:'', field_of_study:'', start_year:'', end_year:'', is_current:false });
      setAdding(false);
      toast.success('Education added!');
    } catch { toast.error('Failed.'); }
  };

  const f = k => e => setForm({...form, [k]: e.target.value});

  return (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.id} className="glass rounded-xl p-4">
          <div className="font-semibold text-sm text-slate-100">{item.degree}</div>
          <div className="text-indigo-400 text-xs font-medium mt-0.5">{item.institution}</div>
          {item.field_of_study && <div className="text-slate-500 text-xs">{item.field_of_study}</div>}
          <div className="text-slate-500 text-xs mt-0.5">{item.start_year} — {item.is_current ? 'Present' : (item.end_year || '?')}</div>
        </div>
      ))}
      {adding ? (
        <div className="glass rounded-xl p-5 border border-indigo-500/20 space-y-3">
          <input className="input text-sm" placeholder="Institution *" value={form.institution} onChange={f('institution')} />
          <input className="input text-sm" placeholder="Degree *" value={form.degree} onChange={f('degree')} />
          <input className="input text-sm" placeholder="Field of study" value={form.field_of_study} onChange={f('field_of_study')} />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" className="input text-sm" placeholder="Start year *" value={form.start_year} onChange={f('start_year')} />
            <input type="number" className="input text-sm" placeholder="End year" value={form.end_year} onChange={f('end_year')} disabled={form.is_current} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input type="checkbox" checked={form.is_current} onChange={e => setForm({...form, is_current:e.target.checked, end_year:''})} />
            Currently enrolled
          </label>
          <div className="flex gap-2">
            <button onClick={add} className="btn-primary text-sm py-2">Add</button>
            <button onClick={() => setAdding(false)} className="btn-ghost text-sm py-2">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full glass rounded-xl p-3.5 flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 border-dashed border-white/10 hover:border-indigo-500/30 transition-all">
          <Plus size={15} /> Add Education
        </button>
      )}
    </div>
  );
}

// ── Theme Tab ─────────────────────────────────────────────────────────────────
function ThemeTab({ portfolio, onSave }) {
  const [t, setT] = useState({
    primary_color: portfolio.primary_color,
    secondary_color: portfolio.secondary_color,
    font_family: portfolio.font_family,
    dark_mode: portfolio.dark_mode,
    template: portfolio.template,
  });
  const [saved, setSaved] = useState(false);

  const TEMPLATES = ['professional','modern','creative','tech','minimal'];
  const TEMPLATE_COLORS = { professional:'#6366f1', modern:'#8b5cf6', creative:'#f43f5e', tech:'#06b6d4', minimal:'#71717a' };
  const FONTS = [
    {v:'inter',label:'Inter'},{v:'playfair',label:'Playfair Display'},
    {v:'roboto',label:'Roboto'},{v:'poppins',label:'Poppins'},{v:'fira',label:'Fira Code'},
  ];

  const save = async () => {
    await onSave(t);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="label">Template</label>
        <div className="grid grid-cols-5 gap-2 mt-1">
          {TEMPLATES.map(tmpl => (
            <button key={tmpl} onClick={() => setT({...t, template:tmpl, primary_color: TEMPLATE_COLORS[tmpl]})}
              className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all
                ${t.template === tmpl ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300' : 'border-white/10 text-slate-400 hover:border-white/20'}`}>
              {tmpl}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[{label:'Primary Color',key:'primary_color'},{label:'Accent Color',key:'secondary_color'}].map(({label,key}) => (
          <div key={key}>
            <label className="label">{label}</label>
            <div className="flex items-center gap-2 mt-1">
              <input type="color" value={t[key]} onChange={e => setT({...t,[key]:e.target.value})}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border border-white/10 p-0.5 flex-shrink-0" />
              <input type="text" value={t[key]} onChange={e => setT({...t,[key]:e.target.value})}
                className="input text-sm font-mono flex-1" maxLength={7} />
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="label">Font Family</label>
        <select className="input mt-1" value={t.font_family} onChange={e => setT({...t, font_family:e.target.value})}>
          {FONTS.map(f => <option key={f.v} value={f.v}>{f.label}</option>)}
        </select>
      </div>

      <div className="flex items-center justify-between p-4 glass rounded-xl">
        <div>
          <div className="text-sm font-medium text-slate-200">Dark Mode</div>
          <div className="text-xs text-slate-500 mt-0.5">Use dark background on public portfolio</div>
        </div>
        <button onClick={() => setT({...t, dark_mode:!t.dark_mode})}
          className={`w-11 h-6 rounded-full transition-colors ${t.dark_mode ? 'bg-indigo-500' : 'bg-white/10'}`}
          style={{position:'relative'}}>
          <span className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
            style={{left: t.dark_mode ? '24px' : '2px', position:'absolute'}} />
        </button>
      </div>

      <button onClick={save} className="btn-primary w-full justify-center py-3 gap-2">
        {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Theme</>}
      </button>
    </div>
  );
}

// ── Settings Tab ──────────────────────────────────────────────────────────────
function SettingsTab({ portfolio, onSave, onTogglePublish }) {
  const [form, setForm] = useState({ title: portfolio.title, tagline: portfolio.tagline || '' });

  return (
    <div className="space-y-4">
      <div>
        <label className="label">Portfolio Title</label>
        <input className="input mt-1" value={form.title} onChange={e => setForm({...form,title:e.target.value})} />
      </div>
      <div>
        <label className="label">Tagline</label>
        <input className="input mt-1" placeholder="Your role or short pitch" value={form.tagline} onChange={e => setForm({...form,tagline:e.target.value})} />
      </div>
      <div>
        <label className="label">Public URL</label>
        <div className="input mt-1 flex items-center gap-2 text-slate-400">
          <Globe size={14} className="text-slate-500" />
          <span className="text-sm font-mono">localhost:3000{portfolio.public_url}</span>
        </div>
      </div>
      <button onClick={() => onSave(form)} className="btn-primary w-full justify-center py-3">
        <Save size={15} /> Save Changes
      </button>
      <div className="divider" />
      <div className="glass rounded-xl p-4 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-200">
            {portfolio.is_published ? '● Published' : '○ Draft'}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {portfolio.is_published ? 'Visible to everyone on the web' : 'Only you can see this'}
          </div>
        </div>
        <button onClick={onTogglePublish}
          className={portfolio.is_published ? 'btn-secondary gap-1.5' : 'btn-primary gap-1.5'}>
          {portfolio.is_published ? <><EyeOff size={14}/>Unpublish</> : <><Globe size={14}/>Publish</>}
        </button>
      </div>
    </div>
  );
}

// ── Main Editor ───────────────────────────────────────────────────────────────
export default function PortfolioEditorPage() {
  const { id } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('sections');
  const [saving,    setSaving]    = useState(false);

  const load = useCallback(() => {
    portfolioApi.get(id)
      .then(({ data }) => setPortfolio(data))
      .catch(() => toast.error('Failed to load portfolio.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      const { data: updated } = await portfolioApi.update(id, data);
      setPortfolio(updated);
      toast.success('Saved!');
    } catch { toast.error('Save failed.'); }
    finally { setSaving(false); }
  };

  const handleTogglePublish = async () => {
    try {
      const { data } = await portfolioApi.togglePublish(id);
      setPortfolio(prev => ({...prev, is_published: data.is_published}));
      toast.success(data.message);
    } catch { toast.error('Failed.'); }
  };

  const handleToggleSection = async (section) => {
    try {
      await portfolioApi.updateSection(id, section.id, { is_visible: !section.is_visible });
      load();
    } catch { toast.error('Failed.'); }
  };

  if (loading) return (
    <DashboardLayout title="Editor">
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  );

  if (!portfolio) return (
    <DashboardLayout title="Editor">
      <div className="text-center py-20 text-slate-400">Portfolio not found.</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title={`Editing: ${portfolio.title}`}>
      <div className="animate-fade-up">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link to="/portfolios" className="btn-ghost p-2"><ChevronLeft size={18} /></Link>
            <div>
              <h2 className="page-title">{portfolio.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                {portfolio.is_published
                  ? <span className="badge-green text-xs"><Globe size={10}/>Live</span>
                  : <span className="badge-slate text-xs"><EyeOff size={10}/>Draft</span>}
                <span className="text-xs text-slate-600">{portfolio.template}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {portfolio.is_published && (
              <a href={`http://localhost:3000${portfolio.public_url}`} target="_blank" rel="noreferrer"
                className="btn-secondary gap-1.5 text-sm">
                <ExternalLink size={14}/> Preview
              </a>
            )}
            <button onClick={handleTogglePublish}
              className={portfolio.is_published ? 'btn-secondary text-sm gap-1.5' : 'btn-primary text-sm gap-1.5'}>
              {portfolio.is_published ? <><EyeOff size={14}/>Unpublish</> : <><Globe size={14}/>Publish</>}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Tab sidebar */}
          <div className="lg:w-44 flex-shrink-0">
            <div className="glass rounded-2xl p-2 flex lg:flex-col gap-1">
              {TABS.map(({ id: tid, label, icon: Icon }) => (
                <button key={tid} onClick={() => setActiveTab(tid)}
                  className={`sidebar-link text-xs ${activeTab === tid ? 'active' : ''}`}>
                  <Icon size={15} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 glass-card min-h-[420px]">
            {activeTab === 'sections' && (
              <div className="space-y-2">
                <p className="text-muted mb-4 text-xs">Toggle sections on/off. Reorder coming soon.</p>
                {(portfolio.sections || []).map(s => (
                  <SectionRow key={s.id} section={s} onToggle={handleToggleSection} />
                ))}
              </div>
            )}
            {activeTab === 'projects'   && <ProjectsTab   portfolioId={portfolio.id} />}
            {activeTab === 'experience' && <ExperienceTab portfolioId={portfolio.id} />}
            {activeTab === 'education'  && <EducationTab  portfolioId={portfolio.id} />}
            {activeTab === 'theme'      && <ThemeTab      portfolio={portfolio} onSave={handleSave} />}
            {activeTab === 'settings'   && <SettingsTab   portfolio={portfolio} onSave={handleSave} onTogglePublish={handleTogglePublish} />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
