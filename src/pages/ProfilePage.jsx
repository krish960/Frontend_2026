import React, { useState, useRef, useEffect } from 'react';
import { Camera, Plus, X, Upload, Save, Trash2 } from 'lucide-react';
import DashboardLayout from '../components/shared/DashboardLayout';
import { authApi } from '../utils/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuthStore();
  const photoRef  = useRef();
  const resumeRef = useRef();

  const [form, setForm] = useState({
    first_name: '', last_name: '', bio: '', location: '',
    phone: '', github_url: '', linkedin_url: '', twitter_url: '', website_url: '',
  });
  const [skills,         setSkills]         = useState([]);
  const [newSkill,       setNewSkill]       = useState({ name: '', level: 80 });
  const [hasResume,      setHasResume]      = useState(false);
  const [resumeName,     setResumeName]     = useState('');
  const [saving,         setSaving]         = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume,setUploadingResume]= useState(false);

  // Sync form from store
  useEffect(() => {
    if (!user) return;
    setForm({
      first_name:   user.first_name  || '',
      last_name:    user.last_name   || '',
      bio:          user.bio         || '',
      location:     user.location    || '',
      phone:        user.phone       || '',
      github_url:   user.github_url  || '',
      linkedin_url: user.linkedin_url|| '',
      twitter_url:  user.twitter_url || '',
      website_url:  user.website_url || '',
    });
    setSkills(user.skills || []);
    setHasResume(user.has_resume || false);
    // Check actual resume
    if (user.has_resume) {
      authApi.getResume()
        .then(({ data }) => setResumeName(data.original_filename))
        .catch(() => {});
    }
  }, [user]);

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      await authApi.updateProfile(form);
      await refreshProfile();
      toast.success('Profile saved!');
    } catch {
      toast.error('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      await authApi.uploadPhoto(file);
      await refreshProfile();
      toast.success('Photo updated!');
    } catch {
      toast.error('Failed to upload photo.');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files are accepted.');
      return;
    }
    setUploadingResume(true);
    try {
      const { data } = await authApi.uploadResume(file);
      setHasResume(true);
      setResumeName(data.original_filename);
      toast.success('Resume uploaded!');
    } catch {
      toast.error('Failed to upload resume.');
    } finally {
      setUploadingResume(false);
      e.target.value = '';
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Delete your resume?')) return;
    try {
      await authApi.deleteResume();
      setHasResume(false);
      setResumeName('');
      toast.success('Resume deleted.');
    } catch {
      toast.error('Failed to delete.');
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.name.trim()) return;
    try {
      const { data } = await authApi.addSkill(newSkill);
      setSkills([...skills, data]);
      setNewSkill({ name: '', level: 80 });
      toast.success('Skill added.');
    } catch { toast.error('Failed to add skill.'); }
  };

  const handleDeleteSkill = async (id) => {
    try {
      await authApi.deleteSkill(id);
      setSkills(skills.filter((s) => s.id !== id));
    } catch { toast.error('Failed to remove.'); }
  };

  const avatarLetter = (user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase();

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-2xl mx-auto space-y-5 pb-10">

        {/* Photo */}
        <div className="glass-card">
          <h3 className="section-title mb-5">Profile Photo</h3>
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 overflow-hidden">
                {user?.profile_photo
                  ? <img src={user.profile_photo} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">{avatarLetter}</div>
                }
              </div>
              <button onClick={() => photoRef.current?.click()} disabled={uploadingPhoto}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-500 hover:bg-brand-600 rounded-lg flex items-center justify-center shadow-lg transition-colors">
                <Camera size={13} className="text-white" />
              </button>
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
            <div>
              <p className="font-semibold text-slate-200">{user?.full_name || user?.username}</p>
              <p className="text-sm text-slate-500">@{user?.username}</p>
              <button onClick={() => photoRef.current?.click()}
                className="text-xs text-brand-400 hover:text-brand-300 mt-2 transition-colors">
                {uploadingPhoto ? 'Uploading...' : 'Change photo'}
              </button>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="glass-card">
          <h3 className="section-title mb-5">Basic Information</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="form-group">
              <label className="label">First name</label>
              <input className="input" value={form.first_name} onChange={f('first_name')} placeholder="Jane" />
            </div>
            <div className="form-group">
              <label className="label">Last name</label>
              <input className="input" value={form.last_name} onChange={f('last_name')} placeholder="Doe" />
            </div>
          </div>
          <div className="form-group mb-3">
            <label className="label">Bio</label>
            <textarea rows={3} className="input resize-none"
              placeholder="Tell your story in a few sentences..."
              value={form.bio} onChange={f('bio')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="form-group">
              <label className="label">Location</label>
              <input className="input" value={form.location} onChange={f('location')} placeholder="San Francisco, CA" />
            </div>
            <div className="form-group">
              <label className="label">Phone</label>
              <input className="input" value={form.phone} onChange={f('phone')} placeholder="+1 (555) 000-0000" />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="glass-card">
          <h3 className="section-title mb-5">Social Links</h3>
          <div className="space-y-3">
            {[
              { k: 'github_url',   label: 'GitHub',           ph: 'https://github.com/username' },
              { k: 'linkedin_url', label: 'LinkedIn',         ph: 'https://linkedin.com/in/username' },
              { k: 'twitter_url',  label: 'Twitter / X',      ph: 'https://x.com/username' },
              { k: 'website_url',  label: 'Personal Website', ph: 'https://yourwebsite.com' },
            ].map(({ k, label, ph }) => (
              <div key={k} className="form-group">
                <label className="label">{label}</label>
                <input type="url" className="input" placeholder={ph} value={form[k]} onChange={f(k)} />
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="glass-card">
          <h3 className="section-title mb-4">Skills</h3>
          <div className="space-y-2 mb-4">
            {skills.length === 0 && (
              <p className="text-sm text-slate-500 py-2">No skills added yet.</p>
            )}
            {skills.map((s) => (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl group">
                <span className="text-sm font-medium text-slate-200 w-28 flex-shrink-0 truncate">{s.name}</span>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${s.level}%` }} />
                </div>
                <span className="text-xs text-slate-500 w-8 text-right flex-shrink-0">{s.level}%</span>
                <button onClick={() => handleDeleteSkill(s.id)}
                  className="text-slate-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input type="text" className="input flex-1 text-sm"
              placeholder="Skill (e.g. React)"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()} />
            <div className="flex items-center gap-2 flex-shrink-0">
              <input type="range" min={10} max={100} step={5}
                value={newSkill.level}
                onChange={(e) => setNewSkill({ ...newSkill, level: Number(e.target.value) })}
                className="w-20" />
              <span className="text-xs text-slate-400 w-8">{newSkill.level}%</span>
            </div>
            <button onClick={handleAddSkill} className="btn-primary p-2.5 flex-shrink-0">
              <Plus size={15} />
            </button>
          </div>
        </div>

        {/* Resume */}
        <div className="glass-card">
          <h3 className="section-title mb-1">Resume</h3>
          <p className="text-sm text-slate-400 mb-4">PDF only. Visitors can download it from your portfolio.</p>
          {hasResume ? (
            <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500/15 border border-red-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-red-400 text-xs font-bold">PDF</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{resumeName || 'resume.pdf'}</p>
                  <p className="text-xs text-slate-500">Uploaded</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => resumeRef.current?.click()} className="btn-secondary text-xs py-1.5 px-3">
                  Replace
                </button>
                <button onClick={handleDeleteResume} className="btn-danger text-xs py-1.5 px-2">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ) : (
            <div onClick={() => resumeRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-brand-500/30 hover:bg-brand-500/3 transition-all cursor-pointer">
              <Upload size={22} className="text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-300">
                {uploadingResume ? 'Uploading...' : 'Click to upload PDF'}
              </p>
              <p className="text-xs text-slate-600 mt-1">PDF only · Max 10MB</p>
            </div>
          )}
          <input ref={resumeRef} type="file" accept=".pdf" className="hidden" onChange={handleResumeUpload} />
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="btn-primary flex items-center gap-2 px-8 py-3">
            {saving
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
              : <><Save size={15} />Save Profile</>
            }
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
