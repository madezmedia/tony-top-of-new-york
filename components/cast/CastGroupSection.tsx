import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { CastRow } from './CastRow';
import { EnhancedCastMember, CastGroupInfo } from '../../types';

interface CastGroupSectionProps {
  group: CastGroupInfo;
  members: EnhancedCastMember[];
  defaultExpanded?: boolean;
}

export const CastGroupSection: React.FC<CastGroupSectionProps> = ({
  group,
  members,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const sortedMembers = [...members].sort((a, b) => a.order - b.order);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center py-4 px-4 border-b border-neutral-border bg-neutral-surface/30 hover:bg-neutral-surface/50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-3">
          <h3 className="font-display text-xl text-primary-main">{group.label}</h3>
          <span className="text-neutral-textSecondary text-sm">({members.length})</span>
        </div>
        <ChevronDown
          size={20}
          className={`text-neutral-textSecondary transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden bg-neutral-surface/10 rounded-b-lg"
          >
            <div className="divide-y divide-neutral-border/20">
              {sortedMembers.map((member) => (
                <CastRow key={member.id} member={member} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
