import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Play, ChevronRight } from 'lucide-react';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { StreamingPlatforms } from './about/StreamingPlatforms';
import { FullSynopsisModal } from './FullSynopsisModal';
import { ANIMATION_PRESETS } from '../utils/animations';
import { buildImageUrl } from '../lib/media';

// Bento Theme Card Data
const BENTO_THEMES = [
  {
    number: '01',
    title: 'POWER',
    description: 'In the Bronx, power is earned not given. Every move has consequences, and the streets keep score. Control is currency, and respect is written in blood.',
    colSpan: 'md:col-span-7',
    minHeight: 'min-h-[400px]',
    orbPosition: '-top-20 -right-20',
    orbDelay: 0,
    hasGrid: true,
  },
  {
    number: '02',
    title: 'FAMILY',
    description: 'Blood ties versus street loyalty. The Cortez dynasty and Beaumont empire collide where family means everything—and costs even more.',
    colSpan: 'md:col-span-5',
    minHeight: 'min-h-[400px]',
    orbPosition: '-bottom-20 -left-20',
    orbDelay: 1,
    hasGrid: false,
  },
  {
    number: '03',
    title: 'SURVIVAL',
    description: 'When everyone has an agenda, trust is a currency few can afford. In these streets, your silence is your survival.',
    colSpan: 'md:col-span-5',
    minHeight: 'min-h-[400px]',
    orbPosition: 'top-10 -right-20',
    orbDelay: 2,
    hasGrid: false,
  },
  {
    number: '04',
    title: 'TRUTH OVER GLAMOR',
    description: "T.O.N.Y. doesn't romanticize street life—it reveals it. No filters. No compromise. Just raw, unfiltered reality.",
    colSpan: 'md:col-span-7',
    minHeight: 'min-h-[350px]',
    orbPosition: '-bottom-20 -right-20',
    orbDelay: 0.5,
    hasGrid: false,
    hasImage: true,
    indicators: ['Authenticity', 'Raw Storytelling', 'No Compromise'],
  },
];

// NYC Skyline SVG Component
const NYCSkyline = () => (
  <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
    <defs>
      <linearGradient id="skylineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="rgb(255, 23, 68)" stopOpacity="0.4" />
        <stop offset="100%" stopColor="rgb(0, 0, 0)" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M0,300 L0,150 L50,150 L50,100 L80,100 L80,80 L120,80 L120,120 L150,120 L150,60 L200,60 L200,140 L250,140 L250,90 L290,90 L290,50 L340,50 L340,110 L380,110 L380,70 L430,70 L430,130 L480,130 L480,40 L530,40 L530,100 L580,100 L580,80 L630,80 L630,150 L680,150 L680,60 L730,60 L730,120 L780,120 L780,90 L830,90 L830,140 L880,140 L880,70 L930,70 L930,130 L980,130 L980,50 L1030,50 L1030,110 L1080,110 L1080,150 L1200,150 L1200,300 Z"
      fill="url(#skylineGradient)"
    />
  </svg>
);

// Glowing Orb Component
interface GlowingOrbProps {
  position: string;
  delay?: number;
}

const GlowingOrb: React.FC<GlowingOrbProps> = ({ position, delay = 0 }) => (
  <motion.div
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.15, 0.3, 0.15],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
      delay,
    }}
    className={`absolute ${position} w-80 h-80 bg-primary-main rounded-full blur-[120px]`}
  />
);

// Bento Theme Card Component
interface BentoThemeCardProps {
  number: string;
  title: string;
  description: string;
  colSpan: string;
  minHeight: string;
  orbPosition: string;
  orbDelay: number;
  hasGrid?: boolean;
  hasImage?: boolean;
  indicators?: string[];
  delay: number;
  isInView: boolean;
}

const BentoThemeCard: React.FC<BentoThemeCardProps> = ({
  number,
  title,
  description,
  colSpan,
  minHeight,
  orbPosition,
  orbDelay,
  hasGrid,
  hasImage,
  indicators,
  delay,
  isInView,
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={isInView ? { opacity: 1, scale: 1 } : {}}
    transition={{ duration: 0.7, delay }}
    className={`${colSpan} group relative overflow-hidden`}
  >
    <div className={`relative bg-neutral-surface/40 backdrop-blur-xl border border-primary-main/20 rounded-3xl p-8 md:p-12 h-full ${minHeight} hover:border-primary-main/60 transition-all duration-500`}>
      {/* Grid Background Pattern (for Power card) */}
      {hasGrid && (
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 23, 68, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 23, 68, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              transform: 'perspective(500px) rotateX(60deg)',
              transformOrigin: 'center center',
            }}
          />
        </div>
      )}

      {/* Background Image (for Truth Over Glamor card) */}
      {hasImage && (
        <div className="absolute inset-0">
          <img
            src={buildImageUrl('promotional', 'hero-background', 'hero')}
            alt=""
            className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-bg via-neutral-bg/80 to-primary-main/20" />
        </div>
      )}

      {/* Glowing Orb */}
      <GlowingOrb position={orbPosition} delay={orbDelay} />

      <div className="relative z-10 h-full flex flex-col">
        {/* Oversized Number */}
        <div className={`text-primary-main/20 font-black ${title === 'POWER' || title === 'TRUTH OVER GLAMOR' ? 'text-8xl md:text-9xl' : 'text-7xl md:text-8xl'} leading-none mb-4 select-none`}>
          {number}
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className={`font-display ${title === 'POWER' || title === 'TRUTH OVER GLAMOR' ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl'} font-black text-neutral-text mb-6 group-hover:text-primary-main transition-colors duration-300`}>
              {title}
            </h3>

            <p className={`text-neutral-textSecondary ${title === 'POWER' || title === 'TRUTH OVER GLAMOR' ? 'text-lg md:text-xl' : 'text-base md:text-lg'} leading-relaxed max-w-lg`}>
              {description}
            </p>

            {/* Status Indicators (for Truth Over Glamor) */}
            {indicators && (
              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-muted mt-6">
                {indicators.map((indicator, idx) => (
                  <span key={indicator} className="flex items-center gap-2">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
                      className="w-2 h-2 bg-primary-main rounded-full"
                    />
                    {indicator}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Animated Accent Line */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: delay + 0.5 }}
            className="h-1 bg-gradient-to-r from-primary-main to-transparent mt-8 max-w-xs"
          />
        </div>
      </div>
    </div>
  </motion.div>
);

export const AboutSeries: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const themesRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });
  const [isSynopsisOpen, setIsSynopsisOpen] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const { scrollYProgress: themesScrollProgress } = useScroll({
    target: themesRef,
    offset: ['start end', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const themesParallaxY = useTransform(themesScrollProgress, [0, 1], [100, -100]);
  const themesParallaxOpacity = useTransform(themesScrollProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <Section id="overview" className="relative overflow-hidden">
      {/* Parallax Background */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 z-0 opacity-10"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-bg via-transparent to-neutral-bg" />
        <img
          src={buildImageUrl('promotional', 'hero-background', 'hero')}
          alt=""
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div ref={containerRef} className="relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-primary-main font-bold tracking-[0.2em] uppercase text-sm mb-4 block">
            About the Series
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-neutral-text mb-6">
            Power Earned. Loyalty Tested.
          </h2>
          <p className="text-neutral-textSecondary text-lg max-w-2xl mx-auto">
            A raw, unfiltered crime saga from the streets of the Bronx
          </p>
        </motion.div>

        {/* Streaming Platforms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <StreamingPlatforms />
        </motion.div>

        {/* Main Story Section - Two Column */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          {/* Left Column - Text */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h3 className="font-display text-2xl md:text-3xl font-bold text-neutral-text mb-6">
              The Story
            </h3>
            <div className="space-y-4 text-neutral-textSecondary leading-relaxed">
              <p>
                In the unforgiving streets of the Bronx, Michael "El Bastardo" Cortez navigates
                the treacherous collision between street life and law enforcement. As a key player
                caught between the Cortez family legacy and the Beaumont empire, he must protect
                his own from the demons of his past while power struggles threaten to destroy
                everything he's built.
              </p>
              <p>
                T.O.N.Y. exposes the raw power dynamics between street organizations and law
                enforcement—told from the inside by someone who lived it. Where loyalty is
                currency, betrayal is inevitable, and survival comes at a cost no one can
                predict.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button variant="primary">
                <Play size={18} fill="currentColor" /> Watch Trailer
              </Button>
              <Button variant="outline" onClick={() => setIsSynopsisOpen(true)}>
                Full Synopsis <ChevronRight size={18} />
              </Button>
            </div>
          </motion.div>

          {/* Right Column - Cinematic Image with Quote */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative group"
          >
            <div className="relative overflow-hidden rounded-xl border border-neutral-border">
              <img
                src={buildImageUrl('promotional', 'hero-background', 'hero')}
                alt="T.O.N.Y. Scene"
                className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Quote Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-bg via-neutral-bg/50 to-transparent flex items-end p-6">
                <blockquote className="text-neutral-text italic text-lg">
                  "In these streets, your word is your bond and your silence is your survival."
                  <cite className="block text-primary-main text-sm mt-2 not-italic font-bold">
                    — Michael Cortez
                  </cite>
                </blockquote>
              </div>
            </div>
            {/* Decorative border glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-main/20 via-secondary-main/20 to-primary-main/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
          </motion.div>
        </div>

        {/* Cinematic Core Themes Section */}
        <div ref={themesRef} className="relative py-16 md:py-24 mb-20 overflow-hidden">
          {/* Massive Background Text - Parallax */}
          <motion.div
            style={{ y: themesParallaxY, opacity: themesParallaxOpacity }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          >
            <h2 className="text-[15vw] md:text-[20vw] font-black text-transparent bg-clip-text bg-gradient-to-b from-primary-main/30 to-primary-main/5 leading-none">
              THEMES
            </h2>
          </motion.div>

          {/* NYC Skyline Silhouette */}
          <div className="absolute bottom-0 left-0 right-0 h-64 opacity-30 pointer-events-none">
            <NYCSkyline />
          </div>

          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 1 }}
            className="text-center mb-16 relative z-10"
          >
            <h2 className="font-display text-5xl md:text-7xl font-black text-neutral-text mb-4">
              Core <span className="text-primary-main">Themes</span>
            </h2>
            <p className="text-neutral-textSecondary text-lg md:text-xl max-w-2xl mx-auto">
              The pillars that define the world of T.O.N.Y.
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid md:grid-cols-12 gap-6 max-w-7xl mx-auto relative z-10">
            {BENTO_THEMES.map((theme, index) => (
              <BentoThemeCard
                key={theme.title}
                {...theme}
                delay={0.1 * (index + 1)}
                isInView={isInView}
              />
            ))}
          </div>
        </div>

        {/* Creator's Vision */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="bg-neutral-surface/40 backdrop-blur border border-neutral-border rounded-2xl overflow-hidden"
        >
          <div className="grid md:grid-cols-[300px_1fr] gap-0">
            {/* Creator Portrait */}
            <div className="relative h-64 md:h-auto">
              <img
                src={buildImageUrl('cast', 'michael-steven-paul', 'cast')}
                alt="Michael Steven-Paul"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-neutral-surface/80 hidden md:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-surface/80 to-transparent md:hidden" />
            </div>

            {/* Quote Content */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <span className="text-primary-main font-bold tracking-widest uppercase text-xs mb-4 block">
                Creator's Vision
              </span>
              <blockquote className="text-neutral-text text-lg md:text-xl italic leading-relaxed mb-6">
                "My connection to T.O.N.Y. is deeply personal. The characters, dialogue, and
                situations are rooted in my real experiences in the streets. This series
                brings truth to light—without filters, without compromise. A gritty, organic,
                pure New York-based adrenaline rush."
              </blockquote>
              <cite className="text-neutral-textSecondary not-italic">
                <span className="font-bold text-neutral-text text-lg">Michael Steven-Paul</span>
                <span className="block text-sm mt-1">Creator & Executive Producer</span>
              </cite>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Full Synopsis Modal */}
      <FullSynopsisModal
        isOpen={isSynopsisOpen}
        onClose={() => setIsSynopsisOpen(false)}
      />
    </Section>
  );
};
