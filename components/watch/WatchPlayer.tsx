import React, { useEffect, useState } from 'react';
import MuxPlayer from '@mux/mux-player-react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Download, ChevronDown } from 'lucide-react';
import { api } from '../../lib/supabase';
import { Button } from '../ui/Button';

interface WatchPlayerProps {
  slug: string;
  title: string;
  playbackId?: string; // Public playback ID — if provided, skip token fetch
}

interface MuxTokens {
  playback: string;
  storyboard: string;
  thumbnail: string;
}

export const WatchPlayer: React.FC<WatchPlayerProps> = ({ slug, title, playbackId: publicPlaybackId }) => {
  const [playbackId, setPlaybackId] = useState<string | null>(publicPlaybackId || null);
  const [tokens, setTokens] = useState<MuxTokens | null>(null);
  const [loading, setLoading] = useState(!publicPlaybackId); // Skip loading if we already have public ID
  const [error, setError] = useState<string | null>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    // If we have a public playback ID, no need to fetch tokens
    if (publicPlaybackId) {
      setPlaybackId(publicPlaybackId);
      setLoading(false);
      return;
    }

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
  }, [slug, publicPlaybackId]);

  const handleDownload = async (quality: string) => {
    try {
      setDownloadLoading(true);
      const data = await api.getDownloadLink(slug, quality);
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
          Loading stream...
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

  if (!playbackId) {
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
          {...(tokens ? {
            tokens: {
              playback: tokens.playback,
              storyboard: tokens.storyboard,
              thumbnail: tokens.thumbnail,
            }
          } : {})}
          streamType="on-demand"
          metadata={{
            video_title: title,
            viewer_user_id: 'anonymous',
          }}
          primaryColor="#FF1744"
          secondaryColor="#FFFFFF"
          accentColor="#FF1744"
          style={{
            width: '100%',
            height: '100%',
            '--media-object-fit': 'contain',
          } as React.CSSProperties & Record<string, string>}
        />
      </div>

      {/* Title and Info */}
      <div className="mt-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-neutral-text">
            {title}
          </h2>
          <p className="text-neutral-textSecondary text-sm mt-1">
            Stream anytime. T.O.N.Y. — Top of New York.
          </p>
        </div>
      </div>
    </div>
  );
};
