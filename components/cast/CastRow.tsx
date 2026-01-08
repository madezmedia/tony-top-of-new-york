import React from 'react';
import { motion } from 'framer-motion';
import { EnhancedCastMember } from '../../types';

interface CastRowProps {
  member: EnhancedCastMember;
}

export const CastRow: React.FC<CastRowProps> = ({ member }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex justify-between items-center py-3 px-4 border-b border-neutral-border/30 hover:bg-neutral-surface/50 transition-colors group"
    >
      <span className="text-neutral-text font-medium group-hover:text-primary-main transition-colors">
        {member.characterName}
      </span>
      <span className="text-neutral-textSecondary text-right">
        {member.actorName}
      </span>
    </motion.div>
  );
};
