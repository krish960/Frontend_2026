import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../utils/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user:            null,
      accessToken:     null,
      refreshToken:    null,
      isAuthenticated: false,
      isLoading:       false,

      setTokens: (access, refresh) => {
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        set({ accessToken: access, refreshToken: refresh, isAuthenticated: true });
      },

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login({ email, password });
          get().setTokens(data.tokens.access, data.tokens.refresh);
          set({ user: data.user, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, error: err.response?.data || {} };
        }
      },

      register: async (formData) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.register(formData);
          get().setTokens(data.tokens.access, data.tokens.refresh);
          set({ user: data.user, isLoading: false });
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, error: err.response?.data || {} };
        }
      },

      oauthLogin: (user, tokens) => {
        get().setTokens(tokens.access, tokens.refresh);
        set({ user, isAuthenticated: true });
      },

      logout: async () => {
        try {
          const refresh = localStorage.getItem('refresh_token');
          if (refresh) await authApi.logout(refresh);
        } catch { /* ignore */ }
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('portfolio-ai-auth');
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      // Silently refresh user data — never throws, never loops
      refreshProfile: async () => {
        if (!localStorage.getItem('access_token')) return;
        try {
          const { data } = await authApi.getProfile();
          set({ user: data });
        } catch {
          // 401 is handled by api.js which redirects to /login
          // Nothing needed here
        }
      },
    }),
    {
      name: 'portfolio-ai-auth',
      partialize: (s) => ({
        user:            s.user,
        accessToken:     s.accessToken,
        refreshToken:    s.refreshToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
