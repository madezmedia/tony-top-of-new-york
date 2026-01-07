import React from 'react';
import { motion } from 'framer-motion';
import { PressAssetCategory } from '../../types';

type CategoryFilter = 'all' | PressAssetCategory;

interface CategoryTabsProps {
  activeCategory: CategoryFilter;
  onCategoryChange: (category: CategoryFilter) => void;
}

const categories: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'photo', label: 'Photos' },
  { value: 'video', label: 'Videos' },
  { value: 'logo', label: 'Logos' },
  { value: 'document', label: 'Documents' },
];

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-10">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onCategoryChange(cat.value)}
          className={`relative px-5 py-2.5 rounded-md font-bold text-sm tracking-wider uppercase transition-colors ${
            activeCategory === cat.value
              ? 'text-neutral-bg'
              : 'text-neutral-textSecondary border border-neutral-border hover:border-primary-main/50 hover:text-primary-main'
          }`}
        >
          {activeCategory === cat.value && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-primary-main rounded-md"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10">{cat.label}</span>
        </button>
      ))}
    </div>
  );
};

export type { CategoryFilter };
