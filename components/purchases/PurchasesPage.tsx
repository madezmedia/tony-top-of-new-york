import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, PlayCircle, Film } from 'lucide-react';
import { api, auth } from '../../lib/supabase';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { Button } from '../ui/Button';

interface Purchase {
  entitlementId: string;
  purchasedAt: string;
  film: {
    id: string;
    slug: string;
    title: string;
    muxPlaybackId: string;
  };
}

export const PurchasesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setLoading(true);
        setError(null);

        const { session } = await auth.getSession();
        
        if (!session) {
          setIsLoggedIn(false);
          setLoading(false);
          // Redirect to login if user arrived here without session
          window.location.href = `/auth/login?returnTo=/purchases`;
          return;
        }
        
        setIsLoggedIn(true);

        const data = await api.getPurchases();
        setPurchases(data.purchases || []);

      } catch (err: any) {
        console.error('Error fetching purchases:', err);
        setError(err.message || 'Failed to load your purchases.');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();

  }, []);

  if (!isLoggedIn && !loading) {
    return null; // The redirect is handling this
  }

  return (
    <div className="min-h-screen bg-neutral-bg text-neutral-text font-sans antialiased selection:bg-primary-main/30 relative flex flex-col">
      <div className="film-grain animate-noise"></div>
      <div className="vignette"></div>
      
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-24 md:py-32 relative z-10 w-full">
        <div className="max-w-6xl mx-auto">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-primary-main hover:text-white transition-colors mb-8 focus-visible:ring-2 focus-visible:ring-primary-main rounded outline-none"
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </a>

          <div className="flex items-end justify-between mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-widest text-white mb-2">
                My Purchases
              </h1>
              <p className="text-neutral-textSecondary">
                Your cinematic library. All unlocked T.O.N.Y. episodes and special features are here.
              </p>
            </div>
            <Film size={48} className="text-neutral-border hidden md:block" />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-12 h-12 text-primary-main animate-spin mx-auto mb-4" />
              <p className="text-neutral-textSecondary uppercase tracking-widest font-bold">Accessing Vault...</p>
            </div>
          ) : error ? (
            <div className="bg-neutral-surface border border-neutral-border rounded p-8 text-center max-w-2xl mx-auto">
              <p className="text-red-400 mb-6">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : purchases.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-surface border border-neutral-border rounded-xl p-12 text-center max-w-3xl mx-auto"
            >
              <Film className="w-16 h-16 text-neutral-border mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Your vault is empty</h3>
              <p className="text-neutral-textSecondary mb-8 text-lg">
                You haven't unlocked any content yet. Ready to enter the Bronx?
              </p>
              <Button variant="primary" onClick={() => window.location.href = '/watch/episode-one'}>
                Watch Episode 1 (Free)
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {purchases.map((purchase, i) => (
                <motion.a
                  key={purchase.entitlementId}
                  href={`/watch/${purchase.film.slug}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group block relative overflow-hidden rounded-xl bg-neutral-surface border border-neutral-border hover:border-primary-main transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary-main outline-none"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video w-full bg-black relative overflow-hidden">
                    <img 
                      src={`https://image.mux.com/${purchase.film.muxPlaybackId}/thumbnail.jpg?width=640&height=360&time=180`} 
                      alt={purchase.film.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <PlayCircle className="w-16 h-16 text-primary-main drop-shadow-2xl" />
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-main transition-colors line-clamp-1">
                      {purchase.film.title}
                    </h3>
                    <p className="text-xs text-neutral-textSecondary uppercase tracking-wider font-bold">
                      Purchased on {new Date(purchase.purchasedAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
