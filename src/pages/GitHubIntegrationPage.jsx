import React, { useEffect, useState, useCallback } from 'react';
import { Github, Star, GitFork, Code, ExternalLink, RefreshCw, Check, Import, AlertCircle } from 'lucide-react';
import DashboardLayout from '../components/shared/DashboardLayout';
import { integrationApi, portfolioApi } from '../utils/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const LANG_COLORS = {
  JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3776ab',
  Rust: '#dea584', Go: '#00add8', Java: '#b07219', 'C++': '#f34b7d',
  Ruby: '#701516', PHP: '#4f5d95', Swift: '#f05138', Kotlin: '#7f52ff',
  Dart: '#00b4ab', 'C#': '#178600', Shell: '#89e051', HTML: '#e34c26',
  CSS: '#563d7c', Vue: '#41b883', Svelte: '#ff3e00',
};

export default function GitHubIntegrationPage() {
  const { user } = useAuthStore();
  const [repos,      setRepos]      = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [selected,   setSelected]   = useState(new Set());
  const [targetPid,  setTargetPid]  = useState('');
  const [loading,    setLoading]    = useState(false);
  const [importing,  setImporting]  = useState(false);
  const [error,      setError]      = useState('');
  const [filter,     setFilter]     = useState('');
  const [langFilter, setLangFilter] = useState('all');
  const [showForks,  setShowForks]  = useState(false);

  const isConnected = !!user?.github_id;

  const loadRepos = useCallback(() => {
    if (!isConnected) return;
    setLoading(true); setError('');
    integrationApi.getGithubRepos()
      .then(({ data }) => setRepos(data.repos || []))
      .catch((err) => {
        const msg = err.response?.data?.error || 'Failed to load repositories.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [isConnected]);

  useEffect(() => {
    portfolioApi.list().then(({ data }) => {
      setPortfolios(data);
      if (data.length > 0) setTargetPid(data[0].id);
    });
    loadRepos();
  }, [loadRepos]);

  const connectGitHub = () => {
    const id = process.env.REACT_APP_GITHUB_CLIENT_ID;
    if (!id) { toast.error('REACT_APP_GITHUB_CLIENT_ID not set in .env'); return; }
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${id}&scope=user:email,repo&redirect_uri=${window.location.origin}/oauth/github`;
  };

  const toggleRepo = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const visible = filtered.map(r => r.id);
    const allSelected = visible.every(id => selected.has(id));
    setSelected(prev => {
      const next = new Set(prev);
      if (allSelected) visible.forEach(id => next.delete(id));
      else visible.forEach(id => next.add(id));
      return next;
    });
  };

  const handleImport = async () => {
    if (!targetPid) { toast.error('Select a portfolio first.'); return; }
    if (selected.size === 0) { toast.error('Select at least one repo.'); return; }
    setImporting(true);
    try {
      const toImport = repos.filter(r => selected.has(r.id));
      const { data } = await integrationApi.importRepos(targetPid, toImport);
      toast.success(`${data.imported} repo(s) imported as projects!`);
      setSelected(new Set());
    } catch { toast.error('Import failed.'); }
    finally { setImporting(false); }
  };

  // Unique languages for filter
  const langs = ['all', ...Array.from(new Set(repos.map(r => r.language).filter(Boolean))).sort()];

  const filtered = repos.filter(r => {
    if (!showForks && r.is_fork) return false;
    if (langFilter !== 'all' && r.language !== langFilter) return false;
    if (filter && !r.name.toLowerCase().includes(filter.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout title="GitHub Integration">
      <div className="animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="page-title">GitHub Repos</h2>
            <p className="text-muted mt-1">Import your repositories as portfolio projects</p>
          </div>
          {isConnected && (
            <button onClick={loadRepos} disabled={loading}
              className="btn-secondary gap-2 text-xs">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          )}
        </div>

        {!isConnected ? (
          /* Not connected */
          <div className="glass-card max-w-lg mx-auto text-center py-14">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5">
              <Github size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-display font-bold text-slate-100 mb-2">Connect GitHub</h3>
            <p className="text-muted mb-6 max-w-xs mx-auto">
              Link your GitHub account to browse all your repositories and import them directly into any portfolio.
            </p>
            <button onClick={connectGitHub} className="btn-primary gap-2">
              <Github size={16} /> Connect GitHub Account
            </button>
          </div>
        ) : (
          <>
            {/* Connected status */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 mb-5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Github size={18} className="text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-300">GitHub Connected</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {repos.length} repositories loaded · @{user?.username}
                </p>
              </div>
              <span className="badge-green">● Connected</span>
            </div>

            {/* Import controls */}
            <div className="glass-card mb-5">
              <div className="flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1">
                  <label className="label">Import to portfolio</label>
                  <select className="input" value={targetPid} onChange={e => setTargetPid(e.target.value)}>
                    <option value="">— choose portfolio —</option>
                    {portfolios.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="label">Search repos</label>
                  <input className="input" placeholder="Filter by name…"
                    value={filter} onChange={e => setFilter(e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="label">Language</label>
                  <select className="input" value={langFilter} onChange={e => setLangFilter(e.target.value)}>
                    {langs.map(l => <option key={l} value={l}>{l === 'all' ? 'All languages' : l}</option>)}
                  </select>
                </div>
                <button onClick={handleImport}
                  disabled={importing || selected.size === 0 || !targetPid}
                  className="btn-primary self-end">
                  {importing
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Importing…</>
                    : <><Import size={15} />Import {selected.size > 0 ? `(${selected.size})` : ''}</>
                  }
                </button>
              </div>

              {/* Filters row */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <button onClick={() => setShowForks(!showForks)}
                    className={`w-9 h-5 rounded-full transition-colors ${showForks ? 'bg-indigo-500' : 'bg-white/10'}`}
                    style={{position:'relative'}}>
                    <span className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                      style={{left: showForks ? '20px' : '2px', position:'absolute'}} />
                  </button>
                  <span className="text-xs text-slate-400">Show forks</span>
                </label>
                <button onClick={toggleAll} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors ml-auto">
                  {filtered.every(r => selected.has(r.id)) ? 'Deselect all' : 'Select all'}
                </button>
                <span className="text-xs text-slate-500">{filtered.length} repos shown</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-5">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Repos grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({length:9}).map((_,i) => (
                  <div key={i} className="card p-4 animate-pulse space-y-3">
                    <div className="h-4 w-2/3 bg-white/5 rounded-lg" />
                    <div className="h-3 w-full bg-white/5 rounded-lg" />
                    <div className="h-3 w-1/2 bg-white/5 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <Code size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No repositories match your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
                {filtered.map(repo => {
                  const isSel = selected.has(repo.id);
                  return (
                    <div key={repo.id} onClick={() => toggleRepo(repo.id)}
                      className={`card p-4 cursor-pointer transition-all duration-200 relative
                        ${isSel ? 'border-indigo-500/60 bg-indigo-500/8 shadow-lg shadow-indigo-500/10' : 'hover:border-white/15 hover:-translate-y-0.5'}`}>
                      {isSel && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                          <Check size={11} className="text-white" />
                        </div>
                      )}
                      <div className="flex items-start gap-2.5 mb-2 pr-6">
                        <Code size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-100 truncate">{repo.name}</h4>
                          {repo.is_fork && <span className="text-xs text-slate-600">fork</span>}
                          {repo.is_private && <span className="text-xs text-amber-600 ml-1">private</span>}
                        </div>
                      </div>
                      {repo.description && (
                        <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">{repo.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3">
                          {repo.language && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{background: LANG_COLORS[repo.language] || '#64748b'}} />
                              <span className="text-xs text-slate-500">{repo.language}</span>
                            </div>
                          )}
                          {repo.stars > 0 && (
                            <div className="flex items-center gap-1">
                              <Star size={11} className="text-amber-400" />
                              <span className="text-xs text-slate-500">{repo.stars}</span>
                            </div>
                          )}
                          {repo.forks > 0 && (
                            <div className="flex items-center gap-1">
                              <GitFork size={11} className="text-slate-500" />
                              <span className="text-xs text-slate-500">{repo.forks}</span>
                            </div>
                          )}
                        </div>
                        <a href={repo.html_url} target="_blank" rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-slate-600 hover:text-indigo-400 transition-colors">
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
