import React from 'react';
import { motion } from 'framer-motion';

interface StatBadgeProps {
  icon: string;
  label: string;
  value: string;
}

export const StatBadge: React.FC<StatBadgeProps> = ({ icon, label, value }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className="bg-neutral-surface/80 backdrop-blur border border-neutral-border rounded-lg px-6 py-4 hover:border-primary-main/50 transition-all cursor-pointer text-center"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-neutral-textSecondary text-xs uppercase tracking-wider mb-1">{label}</div>
      <div className="text-neutral-text font-bold text-lg">{value}</div>
    </motion.div>
  );
};
