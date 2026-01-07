import React from 'react';
import { motion } from 'framer-motion';
import { ANIMATION_PRESETS } from '../../utils/animations';

interface ThemeCardProps {
  icon: string;
  title: string;
  description: string;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({ icon, title, description }) => {
  return (
    <motion.div
      variants={ANIMATION_PRESETS.itemVariants}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group bg-neutral-surface/60 backdrop-blur border border-neutral-border rounded-xl p-8 hover:border-primary-main/50 transition-all duration-300"
    >
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h4 className="text-xl font-bold text-neutral-text mb-3 group-hover:text-primary-main transition-colors">
        {title}
      </h4>
      <p className="text-neutral-textSecondary leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};
