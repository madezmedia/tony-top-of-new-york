import React from 'react';
import { motion } from 'framer-motion';
import { Section } from './ui/Section';
import { ANIMATION_PRESETS } from '../utils/animations';
import { buildImageUrl } from '../lib/media';

export const Overview: React.FC = () => {
  return (
    <Section id="overview" className="bg-neutral-bg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <motion.div
          variants={ANIMATION_PRESETS.slideUp}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
        >
          <h2 className="text-primary-main font-bold tracking-widest uppercase mb-4">The Story</h2>
          <h3 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
            Power. Loyalty. Betrayal.
          </h3>
          <p className="text-neutral-textSecondary text-lg leading-relaxed mb-6">
            "Top of New York" follows Detective Tony Rossi as he uncovers a conspiracy that reaches from the gritty streets of the Bronx to the penthouses of Manhattan.
          </p>
          <p className="text-neutral-textSecondary text-lg leading-relaxed">
            When his partner is found dead under mysterious circumstances, Rossi must decide who to trust in a department riddled with moles. The closer he gets to the truth, the more dangerous the city becomes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-primary-main/20 blur-2xl rounded-full opacity-20" />
          <img
            src={buildImageUrl('promotional', 'story-scene', 'card')}
            alt="Cinematic Scene"
            className="relative rounded-lg shadow-2xl border border-neutral-border grayscale hover:grayscale-0 transition-all duration-700"
          />
        </motion.div>
      </div>
    </Section>
  );
};
