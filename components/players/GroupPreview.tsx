import React from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Heart, Home, Building, Church } from 'lucide-react';
import { CastGroup, CastGroupInfo } from '../../types';

interface GroupPreviewProps {
  group: CastGroupInfo;
  memberCount: number;
  onClick?: () => void;
}

const groupIcons: Record<CastGroup, React.ReactNode> = {
  main: <Users size={24} />,
  'law-enforcement': <Shield size={24} />,
  'beaumont-family': <Heart size={24} />,
  'cortez-family': <Home size={24} />,
  street: <Building size={24} />,
  community: <Church size={24} />,
};

export const GroupPreview: React.FC<GroupPreviewProps> = ({
  group,
  memberCount,
  onClick,
}) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="p-4 bg-neutral-surface border border-neutral-border rounded-lg hover:border-primary-main/50 transition-colors cursor-pointer text-left w-full group"
    >
      <div className="text-primary-main mb-2 group-hover:text-primary-light transition-colors">
        {groupIcons[group.id]}
      </div>
      <h4 className="font-bold text-neutral-text group-hover:text-primary-main transition-colors text-sm">
        {group.label}
      </h4>
      <p className="text-xs text-neutral-textSecondary mt-1">
        {memberCount} {memberCount === 1 ? 'member' : 'members'}
      </p>
    </motion.button>
  );
};
