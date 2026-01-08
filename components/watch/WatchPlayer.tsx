import React, { useEffect, useState } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Download, ChevronDown } from 'lucide-react';
import { api } from '../../lib/supabase';
import { Button } from '../ui/Button';

interface WatchPlayerProps {
  slug: string;
  title: string;
}

interface MuxTokens {
  playback: string;
  storyboard: string;
  thumbnail: string;
}

export const WatchPlayer: React.FC<WatchPlayerProps> = ({ slug, title }) => {
  const [playbackId, setPlaybackId] = useState<string | null>(null);
  const [tokens, setTokens] = useState<MuxTokens | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await api.getMuxToken(slug);
        setPlaybackId(data.playbackId);
        setTokens(data.tokens);
      } catch (err: any) {
        console.error('Error fetching Mux token:', err);
        setError(err.message || 'Failed to load video');
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, [slug]);

  const handleDownload = async (quality: string) => {
    try {
      setDownloadLoading(true);
      const data = await api.getDownloadLink(slug, quality);

      // Open download link in new tab
      window.open(data.downloadUrl, '_blank');

      setShowDownloadMenu(false);
    } catch (err: any) {
      console.error('Error getting download link:', err);
      setError(err.message || 'Failed to generate download link');
    } finally {
      setDownloadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative w-full aspect-video bg-neutral-surface rounded-xl flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <Loader2 className="w-12 h-12 text-primary-main" />
        </motion.div>
        <p className="absolute bottom-8 text-neutral-textSecondary">
          Loading secure stream...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full aspect-video bg-neutral-surface rounded-xl flex flex-col items-center justify-center p-8">
        <AlertCircle className="w-12 h-12 text-primary-main mb-4" />
        <h3 className="text-xl font-bold text-neutral-text mb-2">
          Unable to Load Video
        </h3>
        <p className="text-neutral-textSecondary text-center max-w-md">
          {error}
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!playbackId || !tokens) {
    return (
      <div className="relative w-full aspect-video bg-neutral-surface rounded-xl flex items-center justify-center">
        <p className="text-neutral-textSecondary">No video available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Video Player */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-neutral-border">
        <MuxPlayer
          playbackId={playbackId}
          tokens={{
            playback: tokens.playback,
            storyboard: tokens.storyboard,
            thumbnail: tokens.thumbnail,
          }}
          streamType="on-demand"
          metadata={{
            video_title: title,
            viewer_user_id: 'anonymous', // Will be populated with actual user ID
          }}
          primaryColor="#FF1744"
          secondaryColor="#FFFFFF"
          accentColor="#FF1744"
          style={{
            width: '100%',
            height: '100%',
            '--media-object-fit': 'contain',
          } as React.CSSProperties}
        />
      </div>

      {/* Download Section */}
      <div className="mt-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-neutral-text">
            {title}
          </h2>
          <p className="text-neutral-textSecondary text-sm mt-1">
            You own this content. Stream anytime or download to keep.
          </p>
        </div>

        {/* Download Button with Dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowDownloadMenu(!showDownloadMenu)}
            disabled={downloadLoading}
          >
            {downloadLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download size={18} />
            )}
            Download
            <ChevronDown
              size={16}
              className={`transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`}
            />
          </Button>

          {/* Download Menu */}
          {showDownloadMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-neutral-surface border border-neutral-border rounded-lg shadow-xl z-10 overflow-hidden"
            >
              <div className="p-2">
                <p className="text-xs text-neutral-textSecondary px-3 py-2">
                  Select Quality
                </p>
                {[
                  { label: '4K Ultra HD', value: '4k', size: '~8 GB' },
                  { label: '1080p Full HD', value: '1080p', size: '~4 GB' },
                  { label: '720p HD', value: '720p', size: '~2 GB' },
                  { label: '480p SD', value: '480p', size: '~1 GB' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleDownload(option.value)}
                    className="w-full text-left px-3 py-2 hover:bg-neutral-border/50 rounded-md transition-colors"
                  >
                    <span className="text-neutral-text text-sm font-medium">
                      {option.label}
                    </span>
                    <span className="block text-xs text-neutral-textSecondary">
                      {option.size}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
