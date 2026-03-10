import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { WatchPlayer } from './WatchPlayer';
import { PaywallGate } from './PaywallGate';
import { api, auth } from '../../lib/supabase';
import { Button } from '../ui/Button';

// Public Mux playback ID — no tokens or auth required
const PUBLIC_PLAYBACK_ID = 'GCrZV02lhiXHvASjK24E00JFBruFw4uJKT7RAtBRvCdko';

interface WatchPageProps {
  slug?: string;
}

interface FilmData {
  id: string;
  slug: string;
  title: string;
  priceCents: number;
  trailerUrl?: string;
}

export const WatchPage: React.FC<WatchPageProps> = ({ slug = 'episode-one' }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const film: FilmData = {
    id: 'episode-one',
    slug: slug,
    title: 'T.O.N.Y. - Top of New York',
    priceCents: 0, // Free for public stream
    trailerUrl: 'https://www.youtube.com/embed/F1wtn1g_SZI',
  };

  useEffect(() => {
    // Check URL for success parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === '1') {
      setShowSuccessMessage(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { session } = await auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();

    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-neutral-bg/80 backdrop-blur-xl border-b border-neutral-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2 text-neutral-textSecondary hover:text-neutral-text transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back to T.O.N.Y.</span>
          </a>

          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-textSecondary">
                Signed in
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await auth.signOut();
                  window.location.reload();
                }}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const returnUrl = encodeURIComponent(window.location.pathname);
                  window.location.href = `/auth/login?returnTo=${returnUrl}`;
                }}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const returnUrl = encodeURIComponent(window.location.pathname);
                  window.location.href = `/auth/signup?returnTo=${returnUrl}`;
                }}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-green-500/10 border-b border-green-500/30"
        >
          <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-400">
              Welcome to T.O.N.Y. — enjoy the stream!
            </span>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="ml-4 text-green-400/70 hover:text-green-400"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Content — Always show the player for public content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <WatchPlayer
            slug={film.slug}
            title={film.title}
            playbackId={PUBLIC_PLAYBACK_ID}
          />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-border mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-neutral-textSecondary">
          <p>&copy; {new Date().getFullYear()} T.O.N.Y. - Top of New York. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
