import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { WatchPlayer } from './WatchPlayer';
import { PaywallGate } from './PaywallGate';
import { PaymentProcessingGate } from './PaymentProcessingGate';
import { api, auth } from '../../lib/supabase';
import { Button } from '../ui/Button';



interface WatchPageProps {
  slug?: string;
}

interface FilmData {
  id: string;
  slug: string;
  title: string;
  priceCents: number;
  trailerUrl?: string;
  muxPlaybackId?: string;
}

export const WatchPage: React.FC<WatchPageProps> = ({ slug = 'episode-one' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [film, setFilm] = useState<FilmData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [purchasedAt, setPurchasedAt] = useState<string | null>(null);

  // Track if we just returned from checkout
  const [justPurchased, setJustPurchased] = useState(false);

  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  useEffect(() => {
    // If we have a success=1 parameter, immediately show the processing gate.
    // We do NOT want to fetch normal entitlements yet because it causes a flash of the paywall
    // before the webhook finishes.
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === '1') {
      setIsCheckingPayment(true);
      setLoading(false);
      return;
    }

    const checkAccess = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if user is logged in
        const { session } = await auth.getSession();
        setIsLoggedIn(!!session);

        // The payment processing gate handles the success redirect now.
        // We only fall through to this logic if there is no success parameter.

        if (!session) {
          // Not logged in - show paywall with default film info
          setHasAccess(false);
          setFilm({
            id: 'default',
            slug,
            title: 'T.O.N.Y. - Top of New York',
            priceCents: 499,
            trailerUrl: 'https://www.youtube.com/embed/F1wtn1g_SZI',
          });
          setLoading(false);
          return;
        }

        // Now check entitlement
        try {
          const data = await api.checkEntitlement(slug);
          setHasAccess(data.hasAccess);
          setFilm(data.film);
          if (data.entitlement?.purchasedAt) {
            setPurchasedAt(data.entitlement.purchasedAt);
          }
        } catch (err: any) {
          // Entitlement check failed — deny access, show paywall
          console.warn('Entitlement check failed:', err.message);
          setHasAccess(false);
          setFilm({
            id: 'default',
            slug,
            title: 'T.O.N.Y. - Top of New York',
            priceCents: 499,
            trailerUrl: 'https://www.youtube.com/embed/F1wtn1g_SZI',
          });
        }
      } catch (err: any) {
        console.error('Error checking access:', err);
        setError(err.message || 'Failed to check access');
        // Still show paywall on error
        setHasAccess(false);
        setFilm({
          id: 'default',
          slug,
          title: 'T.O.N.Y. - Top of New York',
          priceCents: 499,
          trailerUrl: 'https://www.youtube.com/embed/F1wtn1g_SZI',
        });
      } finally {
        setLoading(false);
      }
    };

    checkAccess();

    // Subscribe to auth changes
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      if (event === 'SIGNED_IN') {
        checkAccess();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bg flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-primary-main animate-spin mx-auto mb-4" />
          <p className="text-neutral-textSecondary">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (isCheckingPayment) {
    return (
      <div className="min-h-screen bg-neutral-bg">
        <header className="sticky top-0 z-40 bg-neutral-bg/80 backdrop-blur-xl border-b border-neutral-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 text-neutral-textSecondary hover:text-neutral-text transition-colors">
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to T.O.N.Y.</span>
            </a>
          </div>
        </header>

        <PaymentProcessingGate 
          slug={slug}
          onSuccess={() => {
            // Remove success param so we don't infinitely process on refresh
            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
            
            setIsCheckingPayment(false); // Let the normal checkAccess flow run
            setShowSuccessMessage(true);
            setLoading(true); // Restart the loading flow to fetch the video
            
            // Re-mount the checker logic by fetching entitlement
            api.checkEntitlement(slug).then(data => {
               setHasAccess(data.hasAccess);
               setFilm(data.film);
               setLoading(false);
            }).catch(err => {
               setError(err.message);
               setLoading(false);
            });
          }}
          onTimeout={() => {
            // Fallback to normal view on timeout to let them retry or see error
            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
            setIsCheckingPayment(false); 
          }}
        />
        
        <footer className="border-t border-neutral-border mt-auto">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-neutral-textSecondary">
            <p>&copy; {new Date().getFullYear()} T.O.N.Y. - Top of New York. All rights reserved.</p>
          </div>
        </footer>
      </div>
    );
  }

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
                onClick={() => {
                  const returnUrl = encodeURIComponent(window.location.pathname);
                  window.location.href = `/auth/login?returnTo=${returnUrl}`;
                }}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
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
              Purchase successful! You now have full access.
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        {error && !film && (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-primary-main mb-4" />
            <h2 className="text-xl font-bold text-neutral-text mb-2">
              Something went wrong
            </h2>
            <p className="text-neutral-textSecondary mb-6">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {film && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            {hasAccess ? (
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <h3 className="text-green-400 font-bold">Unlocked in your Library</h3>
                      {purchasedAt && (
                        <p className="text-xs text-green-400/70">
                          Purchased on {new Date(purchasedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <a 
                    href="/purchases" 
                    className="text-xs font-bold uppercase tracking-wider bg-green-500/20 text-green-400 px-4 py-2 rounded hover:bg-green-500/30 transition-colors whitespace-nowrap"
                  >
                    View All Purchases
                  </a>
                </div>
                <WatchPlayer
                  slug={film.slug}
                  title={film.title}
                  playbackId={film.muxPlaybackId}
                />
              </div>
            ) : (
              <PaywallGate
                slug={film.slug}
                title={film.title}
                tagline="In the unforgiving streets of the Bronx, power is earned, loyalty is tested, and survival comes at a cost."
                priceCents={film.priceCents}
                trailerUrl={film.trailerUrl}
                isLoggedIn={isLoggedIn}
                onPurchaseComplete={() => {
                  setShowSuccessMessage(true);
                  setHasAccess(true);
                }}
              />
            )}
          </motion.div>
        )}
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
