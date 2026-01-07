import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Calendar, Clock } from 'lucide-react';
import { Section } from './ui/Section';
import { EPISODES } from '../constants';
import { ANIMATION_PRESETS } from '../utils/animations';

export const Episodes: React.FC = () => {
  return (
    <Section id="episodes">
      <motion.div
        variants={ANIMATION_PRESETS.slideUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true }}
        className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4"
      >
        <div>
          <h2 className="text-primary-main font-bold tracking-widest uppercase mb-2">Watch Now</h2>
          <h3 className="font-display text-4xl md:text-5xl font-bold text-white">Season 1</h3>
        </div>
        <button className="text-white hover:text-primary-main underline underline-offset-4 transition-colors">
          View All Seasons
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {EPISODES.map((ep, index) => (
          <motion.div
            key={ep.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="group cursor-pointer"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden mb-4 border border-neutral-border group-hover:border-primary-main/50 transition-colors">
              <img 
                src={ep.thumbnailUrl} 
                alt={ep.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <PlayCircle size={48} className="text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
              </div>
              <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-mono text-white">
                {ep.duration}
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-neutral-textSecondary mb-2">
              <span className="font-bold text-primary-main">EP {ep.number}</span>
              <span className="flex items-center gap-1"><Calendar size={12} /> {ep.airDate}</span>
            </div>
            
            <h4 className="text-xl font-bold text-white mb-2 group-hover:text-primary-main transition-colors">
              {ep.title}
            </h4>
            <p className="text-neutral-textSecondary text-sm line-clamp-2">
              {ep.description}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};
