import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Lock, CreditCard, Loader2, CheckCircle, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { api, auth } from '../../lib/supabase';
import { buildImageUrl } from '../../lib/media';

interface PaywallGateProps {
  slug: string;
  title: string;
  tagline?: string;
  priceCents: number;
  trailerUrl?: string;
  onPurchaseComplete?: () => void;
}

export const PaywallGate: React.FC<PaywallGateProps> = ({
  slug,
  title,
  tagline,
  priceCents,
  trailerUrl,
  onPurchaseComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  const priceDisplay = `$${(priceCents / 100).toFixed(2)}`;

  const handlePurchase = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is logged in
      const { session } = await auth.getSession();

      if (!session) {
        // Redirect to login with return URL
        const returnUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `/auth/login?returnTo=${returnUrl}`;
        return;
      }

      // Create checkout session
      const data = await api.createCheckout(slug);

      // Redirect to Square checkout
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error('Error creating checkout:', err);
      setError(err.message || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {/* Background Image with Overlay */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden">
        <img
          src={buildImageUrl('promotional', 'hero-background', 'hero')}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-bg via-neutral-bg/80 to-neutral-bg/40" />

        {/* Trailer Modal */}
        {showTrailer && trailerUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/95 flex items-center justify-center z-20"
          >
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              Close
            </button>
            <div className="w-full max-w-4xl px-4">
              <div className="relative pt-[56.25%]">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={`${trailerUrl}?autoplay=1`}
                  title={`${title} Trailer`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Lock Icon Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-20 h-20 rounded-full bg-neutral-bg/80 backdrop-blur flex items-center justify-center mb-4"
          >
            <Lock className="w-10 h-10 text-primary-main" />
          </motion.div>

          {trailerUrl && (
            <Button
              variant="outline"
              onClick={() => setShowTrailer(true)}
              className="mt-4"
            >
              <Play size={18} fill="currentColor" /> Watch Trailer
            </Button>
          )}
        </div>
      </div>

      {/* Purchase Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 bg-neutral-surface/60 backdrop-blur-xl border border-neutral-border rounded-2xl p-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Info */}
          <div className="flex-1">
            <h2 className="text-3xl font-display font-bold text-neutral-text mb-2">
              {title}
            </h2>
            {tagline && (
              <p className="text-neutral-textSecondary mb-4">{tagline}</p>
            )}

            {/* Features */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 text-neutral-textSecondary">
                <CheckCircle className="w-4 h-4 text-primary-main" />
                Stream anywhere
              </div>
              <div className="flex items-center gap-2 text-neutral-textSecondary">
                <Download className="w-4 h-4 text-primary-main" />
                Download to own
              </div>
              <div className="flex items-center gap-2 text-neutral-textSecondary">
                <CheckCircle className="w-4 h-4 text-primary-main" />
                4K available
              </div>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <div className="text-4xl font-bold text-neutral-text">
              {priceDisplay}
            </div>
            <p className="text-xs text-neutral-textSecondary">
              One-time purchase
            </p>

            <Button
              variant="primary"
              size="lg"
              onClick={handlePurchase}
              disabled={loading}
              className="w-full md:w-auto min-w-[200px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  Buy Now
                </>
              )}
            </Button>

            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}

            <p className="text-xs text-neutral-muted text-center md:text-right max-w-xs">
              Secure payment powered by Square. Instant access after purchase.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
