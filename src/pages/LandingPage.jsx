import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Globe, Zap, Palette, Github, BarChart2, Shield } from 'lucide-react';

const FEATURES = [
  { icon: Globe, title: 'Instant Publishing', desc: 'Your portfolio goes live at /p/yourname with one click. No domain setup needed.' },
  { icon: Zap, title: '5 Pro Templates', desc: 'Choose from Professional, Modern, Creative, Tech, or Minimal designs.' },
  { icon: Github, title: 'GitHub Sync', desc: 'Auto-import your repositories and showcase your best open-source work.' },
  { icon: Palette, title: 'Full Customization', desc: 'Tweak colors, fonts, section order, dark mode — all without touching code.' },
  { icon: BarChart2, title: 'Live Analytics', desc: 'See who views your portfolio, track growth, and measure performance.' },
  { icon: Shield, title: 'JWT + OAuth', desc: 'Sign in securely with Google, GitHub, or LinkedIn. Enterprise-grade auth.' },
];

const TEMPLATES = [
  { name: 'Professional', color: 'from-slate-600 to-slate-800', accent: '#64748b' },
  { name: 'Modern', color: 'from-brand-600 to-violet-700', accent: '#6366f1' },
  { name: 'Creative', color: 'from-rose-500 to-orange-500', accent: '#f43f5e' },
  { name: 'Tech', color: 'from-cyan-600 to-blue-700', accent: '#06b6d4' },
  { name: 'Minimal', color: 'from-zinc-600 to-zinc-800', accent: '#71717a' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-surface-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-slate-100">PortfolioAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-sm mb-8">
            <Sparkles size={14} />
            Build your dev portfolio in minutes
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold text-slate-100 leading-tight mb-6">
            Your career,
            <span className="block gradient-text">beautifully packaged</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Create a stunning, recruiter-ready portfolio without writing a single line of code.
            Connect GitHub, import projects, and publish in under 5 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-3.5 flex items-center gap-2">
              Start Building Free <ArrowRight size={18} />
            </Link>
            <Link to="/p/demo" className="btn-secondary text-base px-8 py-3.5">
              View Demo Portfolio
            </Link>
          </div>

          <p className="text-sm text-slate-600 mt-6">No credit card required · Free forever plan</p>
        </div>
      </section>

      {/* Templates showcase */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-100 mb-4">
              5 stunning templates
            </h2>
            <p className="text-slate-400 text-lg">Each fully customizable to match your personal brand</p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {TEMPLATES.map((t) => (
              <div key={t.name} className="flex-shrink-0 w-64 group cursor-pointer">
                <div className={`h-44 rounded-2xl bg-gradient-to-br ${t.color} mb-3 relative overflow-hidden border border-white/10 group-hover:border-white/20 transition-all duration-300 group-hover:-translate-y-1`}>
                  {/* Mock UI elements */}
                  <div className="absolute inset-3 bg-black/20 rounded-xl p-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 mb-2" />
                    <div className="h-2 w-20 bg-white/50 rounded mb-1.5" />
                    <div className="h-1.5 w-14 bg-white/15 rounded mb-3" />
                    <div className="flex gap-1.5">
                      {[3, 5, 4].map((w, i) => (
                        <div key={i} className="h-1 bg-white/20 rounded" style={{ width: `${w * 8}px` }} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-300 text-center">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-surface-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-100 mb-4">
              Everything you need
            </h2>
            <p className="text-slate-400 text-lg">A complete platform built for developers and students</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card group hover:border-brand-500/20 transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors">
                  <Icon size={20} className="text-brand-400" />
                </div>
                <h3 className="font-semibold text-slate-100 mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-display font-bold text-slate-100 mb-6">
            Ready to stand out?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Join thousands of developers who've landed their dream job with a PortfolioAI portfolio.
          </p>
          <Link to="/register" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2">
            Create Your Portfolio <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
            <span className="text-sm font-medium text-slate-400">PortfolioAI</span>
          </div>
          <p className="text-sm text-slate-600">© 2025 PortfolioAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
