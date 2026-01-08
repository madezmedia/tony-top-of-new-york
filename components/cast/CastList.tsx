import React from 'react';
import { motion } from 'framer-motion';
import { CastGroupSection } from './CastGroupSection';
import { ENHANCED_CAST, CAST_GROUPS } from '../../constants';
import { CastGroup } from '../../types';

export const CastList: React.FC = () => {
  const getMembersByGroup = (groupId: CastGroup) => {
    return ENHANCED_CAST.filter((member) => member.group === groupId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-16"
    >
      <div className="text-center mb-8">
        <h3 className="font-display text-2xl text-neutral-text mb-2">Full Cast</h3>
        <p className="text-neutral-textSecondary text-sm">
          {ENHANCED_CAST.length} cast members across {CAST_GROUPS.length} groups
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {CAST_GROUPS.map((group, index) => (
          <CastGroupSection
            key={group.id}
            group={group}
            members={getMembersByGroup(group.id)}
            defaultExpanded={index === 0}
          />
        ))}
      </div>
    </motion.div>
  );
};
