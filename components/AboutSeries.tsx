import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Play, ChevronRight, Zap, Heart, Shield } from 'lucide-react';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { StreamingPlatforms } from './about/StreamingPlatforms';
import { ThemeCard } from './about/ThemeCard';
import { ANIMATION_PRESETS } from '../utils/animations';
import { buildImageUrl } from '../lib/media';

const THEMES = [
  {
    icon: <Zap size={28} strokeWidth={1.5} />,
    title: 'Power',
    description: 'In the Bronx, power is earned not given. Every move has consequences, and the streets keep score.',
  },
  {
    icon: <Heart size={28} strokeWidth={1.5} />,
    title: 'Family',
    description: 'Blood ties versus street loyalty. The Cortez dynasty and Beaumont empire collide where family means everything—and costs even more.',
  },
  {
    icon: <Shield size={28} strokeWidth={1.5} />,
    title: 'Survival',
    description: 'When everyone has an agenda, trust is a currency few can afford. In these streets, your silence is your survival.',
  },
];

export const AboutSeries: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

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
              <Button variant="outline">
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

        {/* Themes Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-20 relative"
        >
          {/* Background Overlay */}
          <div className="absolute inset-0 -mx-4 md:-mx-8 px-4 md:px-8 py-12 -my-12 bg-gradient-to-b from-primary-main/5 via-primary-main/10 to-primary-main/5 rounded-3xl" />
          <div className="absolute inset-0 -mx-4 md:-mx-8 px-4 md:px-8 py-12 -my-12 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-main/10 via-transparent to-transparent rounded-3xl" />

          <div className="relative z-10">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-neutral-text mb-8 text-center">
              Core Themes
            </h3>
            <motion.div
              variants={ANIMATION_PRESETS.containerVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="grid md:grid-cols-3 gap-6"
            >
              {THEMES.map((theme) => (
                <ThemeCard key={theme.title} {...theme} />
              ))}
            </motion.div>
          </div>
        </motion.div>

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
    </Section>
  );
};
