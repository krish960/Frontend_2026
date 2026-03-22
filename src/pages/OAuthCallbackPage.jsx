import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../utils/api';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function OAuthCallbackPage({ provider }) {
  const navigate    = useNavigate();
  const { oauthLogin } = useAuthStore();
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code   = params.get('code');

    if (!code) {
      setError('No authorization code received.');
      return;
    }

    const handle = async () => {
      try {
        let response;
        const redirectUri = `${window.location.origin}/oauth/${provider}`;

        if (provider === 'google') {
          response = await authApi.googleOAuth(code, redirectUri);
        } else if (provider === 'github') {
          response = await authApi.githubOAuth(code);
        } else if (provider === 'linkedin') {
          response = await authApi.linkedinOAuth(code, redirectUri);
        }

        oauthLogin(response.data.user, response.data.tokens);
        toast.success(`Signed in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}!`);
        navigate('/dashboard');
      } catch (err) {
        const msg = err.response?.data?.error || `${provider} login failed.`;
        setError(msg);
        toast.error(msg);
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-400 text-lg font-semibold mb-2">Login Failed</div>
            <p className="text-slate-400 text-sm">{error}</p>
            <p className="text-slate-600 text-xs mt-2">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-300 font-medium">
              Completing {provider} sign-in...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
