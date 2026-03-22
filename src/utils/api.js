import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// ── Base instance ─────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach token to every request ────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Refresh lock state (module-level, not inside interceptor) ────────────────
let refreshing = false;
let waitQueue  = [];   // [{resolve, reject}]

function drainQueue(err, token) {
  waitQueue.forEach(p => err ? p.reject(err) : p.resolve(token));
  waitQueue = [];
}

function wipeAuth() {
  ['access_token', 'refresh_token', 'portfolio-ai-auth'].forEach(k =>
    localStorage.removeItem(k)
  );
  if (!window.location.pathname.startsWith('/login')) {
    window.location.replace('/login');
  }
}

// ── Response interceptor — handle 401 once, never loop ───────────────────────
api.interceptors.response.use(
  (res) => res,                          // 2xx → pass through
  async (err) => {
    const status  = err.response?.status;
    const cfg     = err.config;

    // ── Not a 401, or already retried, or it's the refresh call itself ───────
    if (
      status !== 401 ||
      cfg._retry ||
      cfg.url?.includes('/auth/token/refresh/')
    ) {
      return Promise.reject(err);
    }

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      wipeAuth();
      return Promise.reject(err);
    }

    // ── Another request is already refreshing — queue this one ───────────────
    if (refreshing) {
      return new Promise((resolve, reject) => {
        waitQueue.push({
          resolve: (token) => {
            cfg.headers.Authorization = `Bearer ${token}`;
            resolve(api(cfg));
          },
          reject,
        });
      });
    }

    // ── This request will do the refresh ─────────────────────────────────────
    cfg._retry = true;
    refreshing = true;

    try {
      // Use a fresh axios instance so this call bypasses our interceptor
      const { data } = await axios.post(
        `${API_BASE}/auth/token/refresh/`,
        { refresh: refreshToken },
        { timeout: 6000 }
      );

      const newAccess = data.access;
      localStorage.setItem('access_token', newAccess);
      api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;

      drainQueue(null, newAccess);          // unblock queued requests
      cfg.headers.Authorization = `Bearer ${newAccess}`;
      return api(cfg);                      // retry original

    } catch (refreshErr) {
      drainQueue(refreshErr, null);
      wipeAuth();
      return Promise.reject(refreshErr);

    } finally {
      refreshing = false;
    }
  }
);

export default api;

// ─────────────────────────────────────────────────────────────────────────────
// API helpers
// ─────────────────────────────────────────────────────────────────────────────

export const authApi = {
  register:       (d)    => api.post('/auth/register/', d),
  login:          (d)    => api.post('/auth/login/', d),
  logout:         (ref)  => api.post('/auth/logout/', { refresh: ref }),
  getProfile:     ()     => api.get('/auth/profile/'),
  updateProfile:  (d)    => api.patch('/auth/profile/', d),
  changePassword: (d)    => api.post('/auth/profile/password/', d),
  uploadPhoto: (file) => {
    const fd = new FormData();
    fd.append('photo', file);
    return api.post('/auth/profile/photo/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getSkills:    () => api.get('/auth/skills/'),
  addSkill:     (d)      => api.post('/auth/skills/', d),
  updateSkill:  (id, d)  => api.patch(`/auth/skills/${id}/`, d),
  deleteSkill:  (id)     => api.delete(`/auth/skills/${id}/`),
  getResume:    ()       => api.get('/auth/resume/'),
  deleteResume: ()       => api.delete('/auth/resume/'),
  uploadResume: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/auth/resume/', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  googleOAuth:   (code, ru) => api.post('/auth/oauth/google/',   { code, redirect_uri: ru }),
  githubOAuth:   (code)     => api.post('/auth/oauth/github/',   { code }),
  linkedinOAuth: (code, ru) => api.post('/auth/oauth/linkedin/', { code, redirect_uri: ru }),
};

export const portfolioApi = {
  list:          ()        => api.get('/portfolios/'),
  create:        (d)       => api.post('/portfolios/', d),
  get:           (id)      => api.get(`/portfolios/${id}/`),
  update:        (id, d)   => api.patch(`/portfolios/${id}/`, d),
  delete:        (id)      => api.delete(`/portfolios/${id}/`),
  togglePublish: (id)      => api.post(`/portfolios/${id}/publish/`),
  getPublic:     (slug)    => api.get(`/portfolios/public/${slug}/`),
  updateSection:   (pid, sid, d) => api.patch(`/portfolios/${pid}/sections/${sid}/`, d),
  reorderSections: (pid, sections) => api.post(`/portfolios/${pid}/sections/reorder/`, { sections }),
  listProjects:    (pid)        => api.get(`/portfolios/${pid}/projects/`),
  createProject:   (pid, d)     => api.post(`/portfolios/${pid}/projects/`, d),
  updateProject:   (pid, id, d) => api.patch(`/portfolios/${pid}/projects/${id}/`, d),
  deleteProject:   (pid, id)    => api.delete(`/portfolios/${pid}/projects/${id}/`),
  listExperience:   (pid)        => api.get(`/portfolios/${pid}/experience/`),
  createExperience: (pid, d)     => api.post(`/portfolios/${pid}/experience/`, d),
  updateExperience: (pid, id, d) => api.patch(`/portfolios/${pid}/experience/${id}/`, d),
  deleteExperience: (pid, id)    => api.delete(`/portfolios/${pid}/experience/${id}/`),
  listEducation:   (pid)        => api.get(`/portfolios/${pid}/education/`),
  createEducation: (pid, d)     => api.post(`/portfolios/${pid}/education/`, d),
  deleteEducation: (pid, id)    => api.delete(`/portfolios/${pid}/education/${id}/`),
};

export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard/'),
  portfolio: (id) => api.get(`/analytics/portfolio/${id}/`),
};

export const messagingApi = {
  send:     (slug, d) => api.post(`/messages/send/${slug}/`, d),
  inbox:    ()        => api.get('/messages/inbox/'),
  markRead: (id)      => api.patch(`/messages/${id}/`),
  delete:   (id)      => api.delete(`/messages/${id}/`),
};

export const integrationApi = {
  getGithubRepos:     ()         => api.get('/integrations/github/repos/'),
  importRepos:        (pid, repos) => api.post(`/integrations/github/import/${pid}/`, { repos }),
  getLinkedInProfile: ()         => api.get('/integrations/linkedin/profile/'),
  linkedinAutoFill:   ()         => api.post('/integrations/linkedin/autofill/'),
};
