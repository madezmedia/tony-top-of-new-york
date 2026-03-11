import React, { useState, useEffect } from 'react';
import { api, auth } from '../../lib/supabase';
import { Button } from '../ui/Button';

export const ActivatePage: React.FC = () => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in
    auth.getSession().then(({ session }) => {
      if (!session) {
        // Redirect to auth pane if not logged in
        window.location.href = `/auth?returnTo=${encodeURIComponent('/activate')}`;
      } else {
        setUserEmail(session.user.email ?? null);
      }
    });
  }, []);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setStatus('error');
      setMessage('Code must be exactly 6 characters.');
      return;
    }

    try {
      setStatus('loading');
      setMessage('');
      
      const response = await api.linkDeviceCode(code);
      if (response && response.success) {
        setStatus('success');
        setMessage(response.message || 'TV Linked Successfully!');
      } else {
        throw new Error(response?.error || 'Failed to link TV');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Invalid or expired code.');
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-uppercase and strip spaces
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setCode(val);
    setStatus('idle');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-tony-black flex items-center justify-center p-4 pt-20">
      <div className="max-w-md w-full bg-tony-black/80 p-8 rounded-lg border border-tony-gold/30 shadow-2xl backdrop-blur-md">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-tony-gold mb-2 font-display tracking-wider">
            ACTIVATE TV
          </h1>
          <p className="text-gray-400 text-sm">
            Enter the 6-digit code shown on your Roku screen to link your account.
          </p>
          {userEmail && (
            <p className="text-xs text-gray-500 mt-2">
              Linking to: <span className="text-gray-300">{userEmail}</span>
            </p>
          )}
        </div>

        {status === 'success' ? (
          <div className="bg-green-500/20 text-green-400 p-6 rounded text-center border border-green-500/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold mb-2">Success!</h2>
            <p className="text-sm">Your TV is now linked. It will update automatically in a few seconds.</p>
          </div>
        ) : (
          <form onSubmit={handleLink} className="space-y-6">
            <div>
              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                placeholder="ABC-123"
                className="w-full bg-black/50 border-2 border-tony-gold/50 rounded-lg p-4 text-center text-4xl font-mono text-white tracking-widest focus:border-tony-gold focus:outline-none focus:ring-1 focus:ring-tony-gold uppercase transition-all"
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                maxLength={6}
              />
            </div>

            {status === 'error' && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded">
                {message}
              </div>
            )}

            <Button
              variant="primary"
              className="w-full text-lg py-4 tracking-widest"
              disabled={code.length !== 6 || status === 'loading'}
            >
              {status === 'loading' ? 'LINKING...' : 'ACTIVATE'}
            </Button>
            
            <p className="text-xs text-center text-gray-500 mt-6">
              Don't have a code? Download the T.O.N.Y. app on your Roku device and click "Log In".
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
