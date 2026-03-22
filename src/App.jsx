import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

import LandingPage           from './pages/LandingPage';
import LoginPage             from './pages/LoginPage';
import RegisterPage          from './pages/RegisterPage';
import DashboardPage         from './pages/DashboardPage';
import PortfolioListPage     from './pages/PortfolioListPage';
import PortfolioEditorPage   from './pages/PortfolioEditorPage';
import ProfilePage           from './pages/ProfilePage';
import TemplatesPage         from './pages/TemplatesPage';
import PublicPortfolioPage   from './pages/PublicPortfolioPage';
import InboxPage             from './pages/InboxPage';
import AnalyticsPage         from './pages/AnalyticsPage';
import GitHubIntegrationPage from './pages/GitHubIntegrationPage';
import OAuthCallbackPage     from './pages/OAuthCallbackPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, accessToken } = useAuthStore();
  if (!isAuthenticated || !accessToken) return <Navigate to="/login" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, accessToken } = useAuthStore();
  if (isAuthenticated && accessToken) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const { isAuthenticated, accessToken, refreshProfile } = useAuthStore();

  useEffect(() => {
    // Only fetch profile if we have BOTH flags — avoids triggering 401 loop
    if (isAuthenticated && accessToken) {
      refreshProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#34d399', secondary: '#1e293b' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#1e293b' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/"        element={<LandingPage />} />
        <Route path="/p/:slug" element={<PublicPortfolioPage />} />

        {/* OAuth callbacks */}
        <Route path="/oauth/google"   element={<OAuthCallbackPage provider="google" />} />
        <Route path="/oauth/github"   element={<OAuthCallbackPage provider="github" />} />
        <Route path="/oauth/linkedin" element={<OAuthCallbackPage provider="linkedin" />} />

        {/* Guest only */}
        <Route path="/login"    element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

        {/* Protected */}
        <Route path="/dashboard"           element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/portfolios"          element={<ProtectedRoute><PortfolioListPage /></ProtectedRoute>} />
        <Route path="/portfolios/new"      element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
        <Route path="/portfolios/:id/edit" element={<ProtectedRoute><PortfolioEditorPage /></ProtectedRoute>} />
        <Route path="/profile"             element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/inbox"               element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
        <Route path="/analytics"           element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/integrations/github" element={<ProtectedRoute><GitHubIntegrationPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
