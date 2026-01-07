import React from 'react';
import { motion } from 'framer-motion';
import { QuickFact } from '../../types';
import { ANIMATION_PRESETS } from '../../utils/animations';

interface QuickFactsProps {
  facts: QuickFact[];
}

export const QuickFacts: React.FC<QuickFactsProps> = ({ facts }) => {
  return (
    <motion.div
      variants={ANIMATION_PRESETS.containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12"
    >
      {facts.map((fact, index) => (
        <motion.div
          key={index}
          variants={ANIMATION_PRESETS.itemVariants}
          className="bg-neutral-surface border border-neutral-border rounded-lg p-4 text-center hover:border-primary-main/50 transition-colors"
        >
          <p className="text-neutral-muted text-xs uppercase tracking-wider mb-1">
            {fact.label}
          </p>
          <p className="text-white font-bold text-lg">
            {fact.value}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
};
