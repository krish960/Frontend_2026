import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Github, Linkedin, Twitter, Globe, Mail, MapPin, ExternalLink, Star, Send } from 'lucide-react';
import { portfolioApi, messagingApi } from '../utils/api';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// Shared: Contact Form
// ─────────────────────────────────────────────────────────────────────────────
function ContactForm({ slug, accent }) {
  const [form, setForm]     = useState({ sender_name:'', sender_email:'', subject:'', message:'' });
  const [sending, setSending] = useState(false);
  const [sent, setSent]     = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await messagingApi.send(slug, form);
      setSent(true);
    } catch {
      toast.error('Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const inp = {
    width:'100%', padding:'11px 16px', borderRadius:10, fontSize:14,
    background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.14)',
    color:'inherit', outline:'none', boxSizing:'border-box', fontFamily:'inherit',
  };

  if (sent) return (
    <div style={{ padding:28, borderRadius:16, textAlign:'center',
      background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.25)' }}>
      <div style={{ fontSize:36, marginBottom:10 }}>✅</div>
      <p style={{ fontWeight:600, fontSize:16, color:'#34d399' }}>Message sent!</p>
      <p style={{ fontSize:13, opacity:.55, marginTop:6 }}>I'll reply to you soon.</p>
      <button onClick={() => setSent(false)}
        style={{ marginTop:14, padding:'7px 20px', borderRadius:8, border:'none',
          background:'rgba(255,255,255,0.08)', color:'inherit', cursor:'pointer', fontSize:13 }}>
        Send another
      </button>
    </div>
  );

  return (
    <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <input required style={inp} placeholder="Your name *" value={form.sender_name}
          onChange={e => setForm({...form, sender_name:e.target.value})} />
        <input required type="email" style={inp} placeholder="Email address *" value={form.sender_email}
          onChange={e => setForm({...form, sender_email:e.target.value})} />
      </div>
      <input style={inp} placeholder="Subject" value={form.subject}
        onChange={e => setForm({...form, subject:e.target.value})} />
      <textarea required rows={4} style={{...inp, resize:'vertical'}} placeholder="Your message *"
        value={form.message} onChange={e => setForm({...form, message:e.target.value})} />
      <button type="submit" disabled={sending}
        style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 24px',
          borderRadius:10, border:'none', background:accent||'#6366f1', color:'#fff',
          fontWeight:600, fontSize:14, cursor:'pointer', opacity:sending?.7:1,
          alignSelf:'flex-start', fontFamily:'inherit' }}>
        <Send size={15} />{sending ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  );
}

// Shared: Skill bar
function SkillBar({ skill, accent }) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:5 }}>
        <span style={{ fontWeight:500 }}>{skill.name}</span>
        <span style={{ opacity:.45, fontFamily:'monospace' }}>{skill.level}%</span>
      </div>
      <div style={{ height:5, borderRadius:3, background:'rgba(255,255,255,0.1)' }}>
        <div style={{ height:'100%', borderRadius:3, background:accent, width:`${skill.level}%` }} />
      </div>
    </div>
  );
}

// Shared: Social links
function SocialLinks({ owner, color }) {
  const links = [
    { url: owner?.github_url,   icon: <Github size={16}/>,   label:'GitHub' },
    { url: owner?.linkedin_url, icon: <Linkedin size={16}/>, label:'LinkedIn' },
    { url: owner?.twitter_url,  icon: <Twitter size={16}/>,  label:'Twitter' },
    { url: owner?.website_url,  icon: <Globe size={16}/>,    label:'Website' },
    { url: owner?.email ? `mailto:${owner.email}` : null, icon: <Mail size={16}/>, label:'Email' },
  ].filter(l => l.url);
  return (
    <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
      {links.map(l => (
        <a key={l.label} href={l.url} target="_blank" rel="noreferrer"
          style={{ width:38, height:38, borderRadius:10, display:'flex', alignItems:'center',
            justifyContent:'center', background:'rgba(255,255,255,0.08)',
            border:'1px solid rgba(255,255,255,0.12)', color:color||'inherit',
            textDecoration:'none', transition:'opacity .15s' }}
          onMouseOver={e => e.currentTarget.style.opacity='.75'}
          onMouseOut={e => e.currentTarget.style.opacity='1'}>
          {l.icon}
        </a>
      ))}
    </div>
  );
}

// Avatar
function Avatar({ owner, size=80, radius=16 }) {
  const letter = (owner?.first_name?.[0] || owner?.username?.[0] || 'U').toUpperCase();
  return (
    <div style={{ width:size, height:size, borderRadius:radius, overflow:'hidden', flexShrink:0,
      display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg,#6366f1,#8b5cf6)', fontSize:size/2.5,
      fontWeight:700, color:'#fff' }}>
      {owner?.profile_photo
        ? <img src={owner.profile_photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        : letter}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 1 — PROFESSIONAL
// Clean, corporate, white bg with indigo accent strip
// ─────────────────────────────────────────────────────────────────────────────
function ProfessionalTemplate({ portfolio, slug }) {
  const { owner } = portfolio;
  const accent = portfolio.primary_color || '#4f46e5';
  const vis = new Set((portfolio.sections||[]).filter(s=>s.is_visible).map(s=>s.section_type));

  const sec = { marginBottom:52 };
  const h2  = { fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase',
                 color:accent, marginBottom:20, display:'flex', alignItems:'center', gap:10 };
  const h2line = { flex:1, height:1, background:`${accent}30` };

  return (
    <div style={{ fontFamily:'"Inter",system-ui,sans-serif', background:'#f9fafb', color:'#111827', minHeight:'100vh' }}>
      {/* Top accent bar */}
      <div style={{ height:4, background:`linear-gradient(90deg,${accent},${portfolio.secondary_color||'#8b5cf6'})` }} />

      {/* Header */}
      <header style={{ background:'#fff', borderBottom:'1px solid #e5e7eb', padding:'40px 0' }}>
        <div style={{ maxWidth:860, margin:'0 auto', padding:'0 40px', display:'flex', alignItems:'center', gap:32, flexWrap:'wrap' }}>
          <Avatar owner={owner} size={96} radius={20} />
          <div style={{ flex:1, minWidth:240 }}>
            <div style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.5px', color:'#111827' }}>
              {owner?.full_name || owner?.username}
            </div>
            <div style={{ fontSize:15, color:'#6b7280', marginTop:4, fontWeight:400 }}>{portfolio.tagline}</div>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginTop:14, flexWrap:'wrap' }}>
              {owner?.location && (
                <span style={{ fontSize:13, color:'#9ca3af', display:'flex', alignItems:'center', gap:5 }}>
                  <MapPin size={13}/>{owner.location}
                </span>
              )}
              <div style={{ display:'flex', gap:8 }}>
                {[{url:owner?.github_url,icon:<Github size={15}/>},{url:owner?.linkedin_url,icon:<Linkedin size={15}/>},
                  {url:owner?.website_url,icon:<Globe size={15}/>},{url:owner?.email?`mailto:${owner.email}`:null,icon:<Mail size={15}/>}]
                  .filter(l=>l.url).map((l,i) => (
                  <a key={i} href={l.url} target="_blank" rel="noreferrer"
                    style={{ width:32, height:32, borderRadius:8, border:'1px solid #e5e7eb', background:'#f9fafb',
                      display:'flex', alignItems:'center', justifyContent:'center', color:accent, textDecoration:'none' }}>
                    {l.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:860, margin:'0 auto', padding:'48px 40px' }}>
        {vis.has('about') && owner?.bio && (
          <section style={sec}>
            <h2 style={h2}><span>About</span><span style={h2line}/></h2>
            <p style={{ lineHeight:1.85, color:'#374151', fontSize:15 }}>{owner.bio}</p>
          </section>
        )}

        {vis.has('skills') && owner?.skills?.length > 0 && (
          <section style={sec}>
            <h2 style={h2}><span>Skills</span><span style={h2line}/></h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px 40px' }}>
              {owner.skills.map(s => (
                <div key={s.id}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:4 }}>
                    <span style={{ fontWeight:500, color:'#374151' }}>{s.name}</span>
                    <span style={{ color:'#9ca3af', fontFamily:'monospace', fontSize:12 }}>{s.level}%</span>
                  </div>
                  <div style={{ height:5, borderRadius:3, background:'#e5e7eb', marginBottom:12 }}>
                    <div style={{ height:'100%', borderRadius:3, background:accent, width:`${s.level}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {vis.has('experience') && portfolio.experiences?.length > 0 && (
          <section style={sec}>
            <h2 style={h2}><span>Experience</span><span style={h2line}/></h2>
            {portfolio.experiences.map(e => (
              <div key={e.id} style={{ display:'flex', gap:20, marginBottom:28 }}>
                <div style={{ width:2, background:`${accent}30`, flexShrink:0, borderRadius:2, marginTop:4 }} />
                <div>
                  <div style={{ fontWeight:600, fontSize:15, color:'#111827' }}>{e.position}</div>
                  <div style={{ color:accent, fontSize:14, fontWeight:500, marginTop:2 }}>{e.company}</div>
                  <div style={{ fontSize:12, color:'#9ca3af', marginTop:4 }}>
                    {e.start_date} — {e.is_current ? 'Present' : e.end_date}
                    {e.location && ` · ${e.location}`}
                  </div>
                  {e.description && <p style={{ fontSize:14, color:'#6b7280', marginTop:8, lineHeight:1.65 }}>{e.description}</p>}
                </div>
              </div>
            ))}
          </section>
        )}

        {vis.has('education') && portfolio.educations?.length > 0 && (
          <section style={sec}>
            <h2 style={h2}><span>Education</span><span style={h2line}/></h2>
            {portfolio.educations.map(e => (
              <div key={e.id} style={{ marginBottom:20, paddingBottom:20, borderBottom:'1px solid #f3f4f6' }}>
                <div style={{ fontWeight:600, fontSize:15, color:'#111827' }}>
                  {e.degree}{e.field_of_study && ` — ${e.field_of_study}`}
                </div>
                <div style={{ color:accent, fontSize:14, marginTop:3 }}>{e.institution}</div>
                <div style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>
                  {e.start_year} – {e.is_current ? 'Present' : e.end_year}
                </div>
              </div>
            ))}
          </section>
        )}

        {vis.has('projects') && portfolio.projects?.length > 0 && (
          <section style={sec}>
            <h2 style={h2}><span>Projects</span><span style={h2line}/></h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {portfolio.projects.map(p => (
                <div key={p.id} style={{ border:'1px solid #e5e7eb', borderRadius:14, padding:20,
                  background:'#fff', transition:'box-shadow .2s' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <div style={{ fontWeight:600, fontSize:15 }}>{p.title}</div>
                    <div style={{ display:'flex', gap:8 }}>
                      {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" style={{ color:accent }}><Github size={15}/></a>}
                      {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" style={{ color:accent }}><ExternalLink size={15}/></a>}
                    </div>
                  </div>
                  {p.description && <p style={{ fontSize:13, color:'#6b7280', lineHeight:1.6, marginBottom:12 }}>{p.description}</p>}
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {p.tech_stack?.map(t => <span key={t} style={{ fontSize:11, padding:'2px 9px', borderRadius:20, background:`${accent}12`, color:accent, fontWeight:600 }}>{t}</span>)}
                    {p.stars > 0 && <span style={{ fontSize:11, color:'#f59e0b', display:'flex', alignItems:'center', gap:3 }}><Star size={11}/>{p.stars}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {vis.has('contact') && (
          <section style={sec}>
            <h2 style={h2}><span>Get In Touch</span><span style={h2line}/></h2>
            <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:28 }}>
              <ContactForm slug={slug} accent={accent} />
            </div>
          </section>
        )}
      </main>
      <footer style={{ borderTop:'1px solid #e5e7eb', padding:'20px 40px', textAlign:'center', fontSize:12, color:'#9ca3af' }}>
        {owner?.full_name || owner?.username} · Built with PortfolioAI
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 2 — MODERN
// Dark, glassmorphism, gradient hero
// ─────────────────────────────────────────────────────────────────────────────
function ModernTemplate({ portfolio, slug }) {
  const { owner } = portfolio;
  const accent  = portfolio.primary_color || '#6366f1';
  const accent2 = portfolio.secondary_color || '#8b5cf6';
  const vis     = new Set((portfolio.sections||[]).filter(s=>s.is_visible).map(s=>s.section_type));

  return (
    <div style={{ fontFamily:'"Inter",system-ui,sans-serif', background:'#0a0f1e', color:'#f1f5f9', minHeight:'100vh' }}>
      {/* Hero */}
      <div style={{ position:'relative', padding:'80px 0 60px', overflow:'hidden',
        background:`radial-gradient(ellipse 80% 50% at 50% 0%, ${accent}22, transparent)` }}>
        <div style={{ position:'absolute', top:-80, right:'10%', width:400, height:400,
          background:accent2, borderRadius:'50%', opacity:.06, filter:'blur(80px)', pointerEvents:'none' }} />
        <div style={{ maxWidth:740, margin:'0 auto', padding:'0 40px', textAlign:'center', position:'relative' }}>
          <div style={{ display:'inline-block', marginBottom:20 }}>
            <Avatar owner={owner} size={100} radius={24} />
          </div>
          <h1 style={{ fontSize:48, fontWeight:800, letterSpacing:'-1.5px', lineHeight:1.1, marginBottom:10 }}>
            {owner?.full_name || owner?.username}
          </h1>
          <p style={{ fontSize:18, color:'rgba(241,245,249,.55)', marginBottom:24 }}>{portfolio.tagline}</p>
          {owner?.location && (
            <p style={{ fontSize:13, color:'rgba(255,255,255,.3)', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
              <MapPin size={13}/>{owner.location}
            </p>
          )}
          <SocialLinks owner={owner} color={accent} />
        </div>
      </div>

      <main style={{ maxWidth:740, margin:'0 auto', padding:'56px 40px' }}>
        {vis.has('about') && owner?.bio && (
          <section style={{ marginBottom:56 }}>
            <h2 style={{ fontSize:22, fontWeight:700, marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ width:3, height:22, background:`linear-gradient(${accent},${accent2})`, borderRadius:2, display:'inline-block' }} />
              About
            </h2>
            <p style={{ lineHeight:1.85, color:'rgba(241,245,249,.7)', fontSize:15 }}>{owner.bio}</p>
          </section>
        )}

        {vis.has('skills') && owner?.skills?.length > 0 && (
          <section style={{ marginBottom:56 }}>
            <h2 style={{ fontSize:22, fontWeight:700, marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ width:3, height:22, background:`linear-gradient(${accent},${accent2})`, borderRadius:2, display:'inline-block' }} />
              Skills
            </h2>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
              {owner.skills.map(s => (
                <div key={s.id} style={{ padding:'8px 18px', borderRadius:50, fontSize:13, fontWeight:600,
                  background:`${accent}18`, color:accent, border:`1px solid ${accent}35` }}>
                  {s.name}
                  <span style={{ marginLeft:8, fontSize:11, opacity:.6 }}>{s.level}%</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {vis.has('projects') && portfolio.projects?.length > 0 && (
          <section style={{ marginBottom:56 }}>
            <h2 style={{ fontSize:22, fontWeight:700, marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ width:3, height:22, background:`linear-gradient(${accent},${accent2})`, borderRadius:2, display:'inline-block' }} />
              Projects
            </h2>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {portfolio.projects.map(p => (
                <div key={p.id} style={{ padding:24, borderRadius:18, background:'rgba(255,255,255,0.04)',
                  border:'1px solid rgba(255,255,255,0.08)', transition:'border .2s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'}
                  onMouseOut={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                    <div style={{ fontWeight:700, fontSize:16 }}>{p.title}</div>
                    <div style={{ display:'flex', gap:12 }}>
                      {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" style={{ color:accent }}><Github size={17}/></a>}
                      {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" style={{ color:accent }}><ExternalLink size={17}/></a>}
                    </div>
                  </div>
                  {p.description && <p style={{ fontSize:14, color:'rgba(241,245,249,.55)', lineHeight:1.65, marginBottom:14 }}>{p.description}</p>}
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8, alignItems:'center' }}>
                    {p.tech_stack?.map(t => <span key={t} style={{ fontSize:12, padding:'3px 10px', borderRadius:6, background:'rgba(255,255,255,0.07)', fontFamily:'monospace' }}>{t}</span>)}
                    {p.stars > 0 && <span style={{ fontSize:12, color:'#fbbf24', display:'flex', alignItems:'center', gap:4, marginLeft:'auto' }}><Star size={12}/>{p.stars}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {vis.has('experience') && portfolio.experiences?.length > 0 && (
          <section style={{ marginBottom:56 }}>
            <h2 style={{ fontSize:22, fontWeight:700, marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ width:3, height:22, background:`linear-gradient(${accent},${accent2})`, borderRadius:2, display:'inline-block' }} />
              Experience
            </h2>
            {portfolio.experiences.map(e => (
              <div key={e.id} style={{ marginBottom:24, paddingLeft:20, borderLeft:`2px solid ${accent}35` }}>
                <div style={{ fontWeight:700, fontSize:15 }}>{e.position}</div>
                <div style={{ color:accent, fontSize:14, marginTop:2 }}>{e.company}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.35)', marginTop:3 }}>
                  {e.start_date} — {e.is_current ? 'Present' : e.end_date}
                  {e.location && ` · ${e.location}`}
                </div>
                {e.description && <p style={{ fontSize:14, color:'rgba(241,245,249,.55)', marginTop:8, lineHeight:1.65 }}>{e.description}</p>}
              </div>
            ))}
          </section>
        )}

        {vis.has('education') && portfolio.educations?.length > 0 && (
          <section style={{ marginBottom:56 }}>
            <h2 style={{ fontSize:22, fontWeight:700, marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ width:3, height:22, background:`linear-gradient(${accent},${accent2})`, borderRadius:2, display:'inline-block' }} />
              Education
            </h2>
            {portfolio.educations.map(e => (
              <div key={e.id} style={{ marginBottom:20 }}>
                <div style={{ fontWeight:700, fontSize:15 }}>{e.degree}{e.field_of_study && ` in ${e.field_of_study}`}</div>
                <div style={{ color:accent, fontSize:14, marginTop:2 }}>{e.institution}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.35)', marginTop:2 }}>
                  {e.start_year} – {e.is_current ? 'Present' : e.end_year}
                </div>
              </div>
            ))}
          </section>
        )}

        {vis.has('contact') && (
          <section style={{ marginBottom:56 }}>
            <h2 style={{ fontSize:22, fontWeight:700, marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ width:3, height:22, background:`linear-gradient(${accent},${accent2})`, borderRadius:2, display:'inline-block' }} />
              Contact
            </h2>
            <ContactForm slug={slug} accent={accent} />
          </section>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 3 — CREATIVE
// Bold, expressive, warm dark palette, large typography
// ─────────────────────────────────────────────────────────────────────────────
function CreativeTemplate({ portfolio, slug }) {
  const { owner } = portfolio;
  const accent = portfolio.primary_color || '#f43f5e';
  const vis    = new Set((portfolio.sections||[]).filter(s=>s.is_visible).map(s=>s.section_type));

  return (
    <div style={{ fontFamily:'"Inter",system-ui,sans-serif', background:'#0c0a09', color:'#fafaf9', minHeight:'100vh' }}>
      {/* Hero - asymmetric layout */}
      <header style={{ maxWidth:960, margin:'0 auto', padding:'70px 48px 56px', display:'grid', gridTemplateColumns:'1fr 280px', gap:40, alignItems:'center' }}>
        <div>
          <div style={{ fontSize:12, fontWeight:700, letterSpacing:'0.2em', color:accent, textTransform:'uppercase', marginBottom:16 }}>
            Portfolio
          </div>
          <h1 style={{ fontSize:54, fontWeight:900, letterSpacing:'-2px', lineHeight:1.0, marginBottom:14,
            background:`linear-gradient(135deg, #fafaf9 30%, ${accent})`,
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            {owner?.full_name || owner?.username}
          </h1>
          <p style={{ fontSize:17, color:'rgba(250,250,249,.5)', lineHeight:1.6, marginBottom:24 }}>{portfolio.tagline}</p>
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
            <SocialLinks owner={owner} color={accent} />
            {owner?.location && (
              <span style={{ fontSize:13, color:'rgba(255,255,255,.3)', display:'flex', alignItems:'center', gap:5, marginLeft:4 }}>
                <MapPin size={13}/>{owner.location}
              </span>
            )}
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <div style={{ position:'relative' }}>
            <div style={{ position:'absolute', inset:-6, borderRadius:28, background:`linear-gradient(135deg,${accent},transparent)`, opacity:.4 }} />
            <Avatar owner={owner} size={200} radius={24} />
          </div>
        </div>
      </header>

      <div style={{ height:1, background:`linear-gradient(90deg,${accent}60,transparent)`, maxWidth:960, margin:'0 auto 56px', marginLeft:48 }} />

      <main style={{ maxWidth:960, margin:'0 auto', padding:'0 48px 60px' }}>
        {vis.has('about') && owner?.bio && (
          <section style={{ marginBottom:56 }}>
            <p style={{ fontSize:18, lineHeight:1.85, color:'rgba(250,250,249,.65)',
              borderLeft:`3px solid ${accent}`, paddingLeft:20 }}>{owner.bio}</p>
          </section>
        )}

        {vis.has('skills') && owner?.skills?.length > 0 && (
          <section style={{ marginBottom:56 }}>
            <h2 style={{ fontSize:12, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:accent, marginBottom:20 }}>Skills</h2>
            <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
              {owner.skills.map(s => (
                <span key={s.id} style={{ padding:'10px 20px', borderRadius:50, fontSize:13, fontWeight:600,
                  border:`1px solid ${accent}50`, color:'rgba(250,250,249,.8)',
                  background:'rgba(255,255,255,0.04)' }}>{s.name}</span>
              ))}
            </div>
          </section>
        )}

        {vis.has('projects') && portfolio.projects?.length > 0 && (
          <section style={{ marginBottom:56 }}>
            <h2 style={{ fontSize:12, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:accent, marginBottom:20 }}>Selected Work</h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              {portfolio.projects.map((p, i) => (
                <div key={p.id} style={{ padding:28, borderRadius:20,
                  background: i % 2 === 0 ? 'rgba(255,255,255,0.04)' : `${accent}0a`,
                  border:`1px solid ${i % 2 === 0 ? 'rgba(255,255,255,0.08)' : `${accent}25`}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ fontWeight:700, fontSize:16 }}>{p.title}</span>
                    <div style={{ display:'flex', gap:10 }}>
                      {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" style={{ color:accent }}><ExternalLink size={14}/></a>}
                      {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" style={{ color:accent }}><Globe size={14}/></a>}
                    </div>
                  </div>
                  {p.description && <p style={{ fontSize:13, color:'rgba(250,250,249,.5)', lineHeight:1.6, marginBottom:12 }}>{p.description}</p>}
                  <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                    {p.tech_stack?.map(t => <span key={t} style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:`${accent}18`, color:accent, fontWeight:600 }}>{t}</span>)}
                    {p.stars > 0 && <span style={{ fontSize:11, color:'#fbbf24', display:'flex', alignItems:'center', gap:3, marginLeft:'auto' }}><Star size={11}/>{p.stars}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {vis.has('experience') && portfolio.experiences?.length > 0 && (
          <section style={{ marginBottom:56 }}>
            <h2 style={{ fontSize:12, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:accent, marginBottom:20 }}>Experience</h2>
            {portfolio.experiences.map(e => (
              <div key={e.id} style={{ display:'flex', gap:20, marginBottom:24 }}>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.3)', whiteSpace:'nowrap', paddingTop:3, minWidth:80 }}>
                  {e.start_date?.slice(0,7)}<br/>—<br/>{e.is_current ? 'now' : e.end_date?.slice(0,7)}
                </div>
                <div style={{ flex:1 }}>
                  <span style={{ fontWeight:700 }}>{e.position}</span>
                  <span style={{ color:accent }}> @ {e.company}</span>
                  {e.description && <p style={{ fontSize:13, color:'rgba(250,250,249,.5)', marginTop:6, lineHeight:1.6 }}>{e.description}</p>}
                </div>
              </div>
            ))}
          </section>
        )}

        {vis.has('contact') && (
          <section>
            <h2 style={{ fontSize:12, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:accent, marginBottom:20 }}>Say Hello</h2>
            <ContactForm slug={slug} accent={accent} />
          </section>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 4 — TECH
// Terminal / code-editor aesthetic, monospace, dark
// ─────────────────────────────────────────────────────────────────────────────
function TechTemplate({ portfolio, slug }) {
  const { owner } = portfolio;
  const accent = portfolio.primary_color || '#06b6d4';
  const vis    = new Set((portfolio.sections||[]).filter(s=>s.is_visible).map(s=>s.section_type));
  const muted  = 'rgba(226,232,240,.4)';

  return (
    <div style={{ fontFamily:'"JetBrains Mono","Fira Code",monospace', background:'#020617', color:'#e2e8f0', minHeight:'100vh' }}>
      {/* Top bar */}
      <div style={{ background:'#0f172a', borderBottom:'1px solid rgba(255,255,255,0.06)', padding:'12px 40px',
        display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:12, height:12, borderRadius:'50%', background:'#f87171' }} />
        <div style={{ width:12, height:12, borderRadius:'50%', background:'#fbbf24' }} />
        <div style={{ width:12, height:12, borderRadius:'50%', background:'#34d399' }} />
        <span style={{ marginLeft:12, fontSize:12, color:muted }}>{owner?.username}.portfolio</span>
      </div>

      <main style={{ maxWidth:860, margin:'0 auto', padding:'48px 40px' }}>
        {/* Prompt-style header */}
        <div style={{ marginBottom:48 }}>
          <div style={{ fontSize:13, color:muted, marginBottom:6 }}>
            <span style={{ color:accent }}>~</span> whoami
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:16 }}>
            <Avatar owner={owner} size={72} radius={12} />
            <div>
              <h1 style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.5px', color:'#f1f5f9' }}>
                {owner?.full_name || owner?.username}
              </h1>
              <div style={{ fontSize:14, color:accent, marginTop:3 }}>{portfolio.tagline}</div>
            </div>
          </div>
          <div style={{ fontSize:13, color:muted, marginBottom:16 }}>
            {owner?.location && <span style={{ marginRight:20 }}><span style={{ color:accent }}>loc:</span> {owner.location}</span>}
            {owner?.email && <span><span style={{ color:accent }}>mail:</span> {owner.email}</span>}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {[{url:owner?.github_url,label:'github'},{url:owner?.linkedin_url,label:'linkedin'},{url:owner?.website_url,label:'web'}]
              .filter(l=>l.url).map(l => (
              <a key={l.label} href={l.url} target="_blank" rel="noreferrer"
                style={{ fontSize:12, padding:'4px 12px', borderRadius:5, border:`1px solid ${accent}40`,
                  color:accent, textDecoration:'none', background:`${accent}0a` }}>
                ./{l.label}
              </a>
            ))}
          </div>
        </div>

        {vis.has('about') && owner?.bio && (
          <section style={{ marginBottom:40 }}>
            <div style={{ fontSize:12, color:muted, marginBottom:8 }}>
              <span style={{ color:accent }}>#</span> about
            </div>
            <p style={{ fontSize:13, lineHeight:1.9, color:'rgba(226,232,240,.65)', paddingLeft:16,
              borderLeft:`2px solid ${accent}30` }}>{owner.bio}</p>
          </section>
        )}

        {vis.has('skills') && owner?.skills?.length > 0 && (
          <section style={{ marginBottom:40 }}>
            <div style={{ fontSize:12, color:muted, marginBottom:12 }}>
              <span style={{ color:accent }}>#</span> stack
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {owner.skills.map(s => (
                <span key={s.id} style={{ fontSize:12, padding:'5px 12px', border:`1px solid ${accent}35`,
                  borderRadius:5, color:accent, background:`${accent}08` }}>
                  {s.name}<span style={{ color:muted, marginLeft:6 }}>{s.level}%</span>
                </span>
              ))}
            </div>
          </section>
        )}

        {vis.has('projects') && portfolio.projects?.length > 0 && (
          <section style={{ marginBottom:40 }}>
            <div style={{ fontSize:12, color:muted, marginBottom:14 }}>
              <span style={{ color:accent }}>#</span> projects ({portfolio.projects.length})
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {portfolio.projects.map(p => (
                <div key={p.id} style={{ padding:'16px 20px', borderRadius:10, background:'rgba(255,255,255,0.03)',
                  border:'1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
                    <span style={{ color:accent, fontWeight:700, fontSize:14 }}>{p.title}</span>
                    {p.language && <span style={{ fontSize:11, color:muted }}>· {p.language}</span>}
                    {p.stars > 0 && <span style={{ fontSize:11, color:'#fbbf24', marginLeft:'auto', display:'flex', alignItems:'center', gap:3 }}><Star size={11}/>{p.stars}</span>}
                    {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" style={{ color:muted, marginLeft:p.stars?0:'auto' }}><Github size={13}/></a>}
                    {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" style={{ color:muted }}><ExternalLink size={13}/></a>}
                  </div>
                  {p.description && <p style={{ fontSize:12, color:'rgba(226,232,240,.4)', lineHeight:1.65 }}>{p.description}</p>}
                  {p.tech_stack?.length > 0 && (
                    <div style={{ display:'flex', gap:6, marginTop:8 }}>
                      {p.tech_stack.map(t => <span key={t} style={{ fontSize:11, color:accent, opacity:.7 }}>[{t}]</span>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {vis.has('experience') && portfolio.experiences?.length > 0 && (
          <section style={{ marginBottom:40 }}>
            <div style={{ fontSize:12, color:muted, marginBottom:14 }}>
              <span style={{ color:accent }}>#</span> experience
            </div>
            {portfolio.experiences.map(e => (
              <div key={e.id} style={{ marginBottom:16, paddingLeft:16, borderLeft:`2px solid ${accent}30` }}>
                <span style={{ color:'#f1f5f9', fontWeight:600 }}>{e.position}</span>
                <span style={{ color:accent }}> @ {e.company}</span>
                <div style={{ fontSize:11, color:muted, marginTop:2 }}>
                  {e.start_date} → {e.is_current ? 'present' : e.end_date}
                </div>
                {e.description && <p style={{ fontSize:12, color:'rgba(226,232,240,.4)', marginTop:5, lineHeight:1.65 }}>{e.description}</p>}
              </div>
            ))}
          </section>
        )}

        {vis.has('contact') && (
          <section style={{ marginBottom:40 }}>
            <div style={{ fontSize:12, color:muted, marginBottom:14 }}>
              <span style={{ color:accent }}>#</span> contact
            </div>
            <ContactForm slug={slug} accent={accent} />
          </section>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 5 — MINIMAL
// Ultra-clean, serif typography, white space is king
// ─────────────────────────────────────────────────────────────────────────────
function MinimalTemplate({ portfolio, slug }) {
  const { owner } = portfolio;
  const accent = portfolio.primary_color || '#18181b';
  const vis    = new Set((portfolio.sections||[]).filter(s=>s.is_visible).map(s=>s.section_type));

  return (
    <div style={{ fontFamily:'"Georgia","Times New Roman",serif', background:'#fafafa', color:'#18181b', minHeight:'100vh' }}>
      <main style={{ maxWidth:640, margin:'0 auto', padding:'80px 40px' }}>
        {/* Header */}
        <div style={{ marginBottom:64 }}>
          <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:20 }}>
            <Avatar owner={owner} size={64} radius={50} />
            <div>
              <h1 style={{ fontSize:26, fontWeight:400, letterSpacing:'-0.5px', marginBottom:2 }}>
                {owner?.full_name || owner?.username}
              </h1>
              <p style={{ fontSize:15, color:'#71717a', fontStyle:'italic' }}>{portfolio.tagline}</p>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:20, color:'#a1a1aa', fontSize:13 }}>
            {owner?.location && <span style={{ display:'flex', alignItems:'center', gap:4 }}><MapPin size={12}/>{owner.location}</span>}
            {owner?.email && <a href={`mailto:${owner.email}`} style={{ color:'#a1a1aa', display:'flex', alignItems:'center', gap:4 }}><Mail size={12}/>{owner.email}</a>}
          </div>
          <div style={{ display:'flex', gap:20, marginTop:16, fontSize:13 }}>
            {owner?.github_url && <a href={owner.github_url} target="_blank" rel="noreferrer" style={{ color:'#71717a' }}>GitHub ↗</a>}
            {owner?.linkedin_url && <a href={owner.linkedin_url} target="_blank" rel="noreferrer" style={{ color:'#71717a' }}>LinkedIn ↗</a>}
            {owner?.website_url && <a href={owner.website_url} target="_blank" rel="noreferrer" style={{ color:'#71717a' }}>Website ↗</a>}
          </div>
        </div>

        {vis.has('about') && owner?.bio && (
          <section style={{ marginBottom:56 }}>
            <p style={{ fontSize:16, lineHeight:1.9, color:'#3f3f46' }}>{owner.bio}</p>
          </section>
        )}

        {vis.has('skills') && owner?.skills?.length > 0 && (
          <section style={{ marginBottom:56 }}>
            <h2 style={{ fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#a1a1aa', marginBottom:20 }}>Skills</h2>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {owner.skills.map(s => (
                <span key={s.id} style={{ fontSize:13, padding:'5px 14px', borderRadius:20,
                  background:'#f4f4f5', color:'#3f3f46', border:'1px solid #e4e4e7' }}>
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {vis.has('projects') && portfolio.projects?.length > 0 && (
          <section style={{ marginBottom:56 }}>
            <h2 style={{ fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#a1a1aa', marginBottom:20 }}>Projects</h2>
            {portfolio.projects.map((p, i) => (
              <div key={p.id} style={{ paddingTop:20, paddingBottom:20, borderTop: i===0?'1px solid #e4e4e7':'1px solid #e4e4e7', borderBottom: i===portfolio.projects.length-1?'1px solid #e4e4e7':'none' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                  <span style={{ fontWeight:600, fontSize:15 }}>{p.title}</span>
                  <div style={{ display:'flex', gap:14 }}>
                    {p.github_url && <a href={p.github_url} target="_blank" rel="noreferrer" style={{ fontSize:12, color:'#a1a1aa' }}>Code ↗</a>}
                    {p.live_url && <a href={p.live_url} target="_blank" rel="noreferrer" style={{ fontSize:12, color:'#a1a1aa' }}>Live ↗</a>}
                  </div>
                </div>
                {p.description && <p style={{ fontSize:14, color:'#71717a', lineHeight:1.7, marginBottom:8 }}>{p.description}</p>}
                {p.language && <span style={{ fontSize:12, color:'#a1a1aa' }}>{p.language}</span>}
              </div>
            ))}
          </section>
        )}

        {vis.has('experience') && portfolio.experiences?.length > 0 && (
          <section style={{ marginBottom:56 }}>
            <h2 style={{ fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#a1a1aa', marginBottom:20 }}>Experience</h2>
            {portfolio.experiences.map(e => (
              <div key={e.id} style={{ display:'grid', gridTemplateColumns:'100px 1fr', gap:16, marginBottom:24 }}>
                <div style={{ fontSize:12, color:'#a1a1aa', lineHeight:1.5, paddingTop:2 }}>
                  {e.start_date?.slice(0,7)}<br/>–<br/>{e.is_current?'present':e.end_date?.slice(0,7)}
                </div>
                <div>
                  <div style={{ fontWeight:600, fontSize:15 }}>{e.position}</div>
                  <div style={{ fontSize:14, color:'#71717a', marginTop:2 }}>{e.company}</div>
                  {e.description && <p style={{ fontSize:13, color:'#71717a', marginTop:6, lineHeight:1.65 }}>{e.description}</p>}
                </div>
              </div>
            ))}
          </section>
        )}

        {vis.has('education') && portfolio.educations?.length > 0 && (
          <section style={{ marginBottom:56 }}>
            <h2 style={{ fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#a1a1aa', marginBottom:20 }}>Education</h2>
            {portfolio.educations.map(e => (
              <div key={e.id} style={{ display:'grid', gridTemplateColumns:'100px 1fr', gap:16, marginBottom:20 }}>
                <div style={{ fontSize:12, color:'#a1a1aa' }}>{e.start_year}–{e.is_current?'present':e.end_year}</div>
                <div>
                  <div style={{ fontWeight:600, fontSize:15 }}>{e.degree}{e.field_of_study && ` in ${e.field_of_study}`}</div>
                  <div style={{ fontSize:14, color:'#71717a', marginTop:2 }}>{e.institution}</div>
                </div>
              </div>
            ))}
          </section>
        )}

        {vis.has('contact') && (
          <section>
            <h2 style={{ fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#a1a1aa', marginBottom:20 }}>Contact</h2>
            <div style={{ background:'#f4f4f5', border:'1px solid #e4e4e7', borderRadius:16, padding:28 }}>
              <ContactForm slug={slug} accent={accent} />
            </div>
          </section>
        )}
      </main>
      <footer style={{ borderTop:'1px solid #e4e4e7', padding:'20px 40px', textAlign:'center', fontSize:11, color:'#d4d4d8' }}>
        {owner?.full_name || owner?.username} · PortfolioAI
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main entry
// ─────────────────────────────────────────────────────────────────────────────
export default function PublicPortfolioPage() {
  const { slug } = useParams();
  const [portfolio, setPortfolio] = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [notFound,  setNotFound]  = useState(false);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    portfolioApi.getPublic(slug)
      .then(({ data }) => setPortfolio(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0f1e' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, border:'2px solid #6366f1', borderTopColor:'transparent',
          borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 16px' }} />
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:14, fontFamily:'Inter,sans-serif' }}>Loading portfolio…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', background:'#0a0f1e', color:'#f1f5f9', textAlign:'center', padding:40,
      fontFamily:'Inter,sans-serif' }}>
      <div style={{ fontSize:60, marginBottom:16 }}>🔍</div>
      <h1 style={{ fontSize:26, fontWeight:700, marginBottom:8 }}>Portfolio not found</h1>
      <p style={{ color:'rgba(255,255,255,.4)', fontSize:15 }}>This portfolio doesn't exist or isn't published yet.</p>
    </div>
  );

  const t = portfolio?.template;
  const props = { portfolio, slug };

  return (
    <>
      {t === 'professional' && <ProfessionalTemplate {...props} />}
      {t === 'modern'       && <ModernTemplate       {...props} />}
      {t === 'creative'     && <CreativeTemplate     {...props} />}
      {t === 'tech'         && <TechTemplate         {...props} />}
      {t === 'minimal'      && <MinimalTemplate      {...props} />}
      {!['professional','modern','creative','tech','minimal'].includes(t) && <ModernTemplate {...props} />}
    </>
  );
}
