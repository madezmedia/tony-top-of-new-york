import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, ChevronRight, Zap, Heart, Shield, Eye } from 'lucide-react';
import { Button } from './ui/Button';
import { StreamingPlatforms } from './about/StreamingPlatforms';
import { buildImageUrl } from '../lib/media';

interface AboutSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// NYC Skyline SVG Component
const NYCSkyline = () => (
  <svg className="absolute bottom-0 w-full h-48" viewBox="0 0 1200 200" preserveAspectRatio="none">
    <defs>
      <linearGradient id="modalSkylineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="rgb(255, 23, 68)" stopOpacity="0.6" />
        <stop offset="100%" stopColor="rgb(0, 0, 0)" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M0,200 L0,100 L50,100 L50,70 L80,70 L80,50 L120,50 L120,80 L150,80 L150,40 L200,40 L200,90 L250,90 L250,60 L290,60 L290,30 L340,30 L340,70 L380,70 L380,45 L430,45 L430,85 L480,85 L480,25 L530,25 L530,65 L580,65 L580,50 L630,50 L630,100 L680,100 L680,40 L730,40 L730,80 L780,80 L780,55 L830,55 L830,95 L880,95 L880,45 L930,45 L930,85 L980,85 L980,35 L1030,35 L1030,75 L1080,75 L1080,100 L1200,100 L1200,200 Z"
      fill="url(#modalSkylineGradient)"
    />
  </svg>
);

// Theme data for the modal
const THEMES = [
  {
    icon: Zap,
    title: 'POWER',
    description: 'In the Bronx, power is earned not given. Every move has consequences.',
  },
  {
    icon: Heart,
    title: 'FAMILY',
    description: 'Blood ties versus street loyalty. Where family means everything.',
  },
  {
    icon: Shield,
    title: 'SURVIVAL',
    description: 'When everyone has an agenda, trust is a currency few can afford.',
  },
  {
    icon: Eye,
    title: 'TRUTH',
    description: 'No filters. No compromise. Just raw, unfiltered reality.',
  },
];

export const AboutSeriesModal: React.FC<AboutSeriesModalProps> = ({ isOpen, onClose }) => {
  // Close on escape key and lock body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/98 backdrop-blur-xl"
          />

          {/* Modal Content - Split Screen Layout */}
          <div className="relative h-full w-full grid md:grid-cols-[40%_60%]">
            {/* Left Panel - Visual */}
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative hidden md:block overflow-hidden"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={buildImageUrl('promotional', 'hero-background', 'hero')}
                  alt="T.O.N.Y. Scene"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/50 to-black" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
              </div>

              {/* NYC Skyline */}
              <NYCSkyline />

              {/* Animated Glow Accent */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-main/30 rounded-full blur-[150px]"
              />

              {/* Logo Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.img
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  src={buildImageUrl('brand', 'tony-logo', 'hero')}
                  alt="T.O.N.Y."
                  className="w-48 h-auto object-contain"
                  style={{ filter: 'drop-shadow(0 0 40px rgba(255,23,68,0.6))' }}
                />
              </div>
            </motion.div>

            {/* Right Panel - Content */}
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              className="relative h-full overflow-y-auto"
            >
              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={onClose}
                className="absolute top-6 right-6 z-20 p-3 rounded-full bg-neutral-surface/50 border border-neutral-border text-neutral-text hover:text-primary-main hover:border-primary-main transition-all duration-300"
              >
                <X size={24} />
              </motion.button>

              {/* Scrollable Content */}
              <div className="p-8 md:p-12 lg:p-16 min-h-full">
                {/* Mobile Logo */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="md:hidden mb-8"
                >
                  <img
                    src={buildImageUrl('brand', 'tony-logo', 'hero')}
                    alt="T.O.N.Y."
                    className="h-16 w-auto mx-auto"
                    style={{ filter: 'drop-shadow(0 0 20px rgba(255,23,68,0.5))' }}
                  />
                </motion.div>

                {/* Title Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="mb-12"
                >
                  <span className="text-primary-main font-bold tracking-[0.2em] uppercase text-sm mb-4 block">
                    About the Series
                  </span>
                  <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-black text-neutral-text mb-4">
                    Power Earned.
                    <br />
                    <span className="text-primary-main">Loyalty Tested.</span>
                  </h2>
                  <p className="text-neutral-textSecondary text-lg md:text-xl max-w-xl">
                    A raw, unfiltered crime saga from the streets of the Bronx
                  </p>
                </motion.div>

                {/* The Story */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="mb-12"
                >
                  <h3 className="font-display text-2xl font-bold text-neutral-text mb-4 flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-primary-main" />
                    The Story
                  </h3>
                  <div className="space-y-4 text-neutral-textSecondary leading-relaxed">
                    <p>
                      In the unforgiving streets of the Bronx, Michael "El Bastardo" Cortez navigates
                      the treacherous collision between street life and law enforcement. As a key player
                      caught between the Cortez family legacy and the Beaumont empire, he must protect
                      his own from the demons of his past.
                    </p>
                    <p>
                      T.O.N.Y. exposes the raw power dynamics between street organizations and law
                      enforcement—told from the inside by someone who lived it. Where loyalty is
                      currency, betrayal is inevitable, and survival comes at a cost no one can predict.
                    </p>
                  </div>
                </motion.div>

                {/* Core Themes */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="mb-12"
                >
                  <h3 className="font-display text-2xl font-bold text-neutral-text mb-6 flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-primary-main" />
                    Core Themes
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {THEMES.map((theme, index) => (
                      <motion.div
                        key={theme.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                        className="group bg-neutral-surface/40 backdrop-blur border border-neutral-border rounded-xl p-4 hover:border-primary-main/50 transition-all duration-300"
                      >
                        <theme.icon
                          className="text-primary-main mb-2 group-hover:scale-110 transition-transform duration-300"
                          size={24}
                        />
                        <h4 className="font-display text-sm font-bold text-neutral-text mb-1">
                          {theme.title}
                        </h4>
                        <p className="text-neutral-textSecondary text-xs leading-relaxed">
                          {theme.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Creator's Vision */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="mb-12 bg-neutral-surface/30 backdrop-blur border border-neutral-border rounded-xl p-6"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={buildImageUrl('cast', 'michael-steven-paul', 'cast')}
                      alt="Michael Steven-Paul"
                      className="w-16 h-16 rounded-full object-cover border-2 border-primary-main/50"
                    />
                    <div>
                      <blockquote className="text-neutral-text italic leading-relaxed mb-3">
                        "My connection to T.O.N.Y. is deeply personal. The characters, dialogue, and
                        situations are rooted in my real experiences in the streets."
                      </blockquote>
                      <cite className="text-neutral-textSecondary not-italic text-sm">
                        <span className="font-bold text-neutral-text">Michael Steven-Paul</span>
                        <span className="block">Creator & Executive Producer</span>
                      </cite>
                    </div>
                  </div>
                </motion.div>

                {/* Streaming Platforms */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="mb-12"
                >
                  <h3 className="font-display text-2xl font-bold text-neutral-text mb-6 flex items-center gap-3">
                    <span className="w-8 h-[2px] bg-primary-main" />
                    Stream Now
                  </h3>
                  <StreamingPlatforms />
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Button variant="primary" onClick={onClose}>
                    <Play size={18} fill="currentColor" /> Watch Trailer
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Explore More <ChevronRight size={18} />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
