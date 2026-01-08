import React from 'react';

interface TraitTagProps {
  trait: string;
}

export const TraitTag: React.FC<TraitTagProps> = ({ trait }) => {
  return (
    <span className="px-3 py-1 bg-primary-main/20 border border-primary-main/50 rounded-full text-xs text-primary-light font-medium">
      {trait}
    </span>
  );
};
