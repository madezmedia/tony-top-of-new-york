import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Play, ChevronRight } from 'lucide-react';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { StatBadge } from './about/StatBadge';
import { ThemeCard } from './about/ThemeCard';
import { ANIMATION_PRESETS } from '../utils/animations';
import { buildImageUrl } from '../lib/media';

const STATS = [
  { icon: '🏆', label: 'Award Nominations', value: '12+' },
  { icon: '⭐', label: 'IMDb Rating', value: '8.7' },
  { icon: '👁️', label: 'Pilot Views', value: '2.5M+' },
  { icon: '🎬', label: 'Episodes', value: '10' },
];

const THEMES = [
  {
    icon: '🔱',
    title: 'Corruption',
    description: 'In a city where power flows through badge and gun, the line between protector and predator blurs with every sunrise.',
  },
  {
    icon: '🩸',
    title: 'Family',
    description: 'Blood ties bind tighter than handcuffs. When duty calls and family bleeds, which oath do you honor?',
  },
  {
    icon: '⚖️',
    title: 'Redemption',
    description: 'Every saint has a past, every sinner has a future. In the shadows of the NYPD, second chances come at a deadly price.',
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
            Where Justice Meets Its Shadow
          </h2>
          <p className="text-neutral-textSecondary text-lg max-w-2xl mx-auto">
            A gritty crime drama that explores the dark underbelly of New York's finest
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20"
        >
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            >
              <StatBadge {...stat} />
            </motion.div>
          ))}
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
                Detective Tony Rossi has spent 20 years climbing the ranks of the NYPD,
                building a reputation as an incorruptible force in a department riddled with
                shadows. But when his partner is murdered and the evidence points to the
                highest levels of the department, Tony must choose between the brotherhood
                he's sworn to protect and the truth that could destroy everything.
              </p>
              <p>
                Set against the backdrop of modern-day New York City, T.O.N.Y. weaves together
                the personal and the political, the intimate and the explosive, creating a
                portrait of a city where the line between hero and villain is drawn in shades
                of gray.
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
                  "In this city, the badge is just the beginning of the story."
                  <cite className="block text-primary-main text-sm mt-2 not-italic font-bold">
                    — Det. Tony Rossi
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
          className="mb-20"
        >
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
        </motion.div>

        {/* Creator's Vision */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="bg-neutral-surface/40 backdrop-blur border border-neutral-border rounded-2xl p-8 md:p-12"
        >
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Creator Image Placeholder */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary-main/30 to-secondary-main/30 flex items-center justify-center shrink-0">
              <span className="text-4xl">🎬</span>
            </div>

            <div>
              <span className="text-primary-main font-bold tracking-widest uppercase text-xs mb-2 block">
                Creator's Vision
              </span>
              <blockquote className="text-neutral-text text-lg md:text-xl italic leading-relaxed mb-4">
                "I wanted to create a show that doesn't shy away from the moral complexity
                of modern policing. T.O.N.Y. isn't about good cops versus bad cops—it's about
                human beings trapped in an impossible system, making choices that define who
                they are and who they'll become."
              </blockquote>
              <cite className="text-neutral-textSecondary not-italic">
                <span className="font-bold text-neutral-text">Michael Steven-Paul</span>
                <span className="mx-2">•</span>
                Creator & Executive Producer
              </cite>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
};
