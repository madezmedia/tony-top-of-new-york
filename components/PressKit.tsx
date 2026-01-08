import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { AssetCard } from './press/AssetCard';
import { QuickFacts } from './press/QuickFacts';
import { CategoryTabs, CategoryFilter } from './press/CategoryTabs';
import { ContactCard } from './press/ContactCard';
import { PRESS_ASSETS, PRESS_CONTACTS, QUICK_FACTS } from '../constants';
import { ANIMATION_PRESETS } from '../utils/animations';

export const PressKit: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');

  const filteredAssets = useMemo(() => {
    if (activeCategory === 'all') return PRESS_ASSETS;
    return PRESS_ASSETS.filter((asset) => asset.category === activeCategory);
  }, [activeCategory]);

  return (
    <Section id="presskit" className="bg-neutral-surface/20">
      {/* Header */}
      <motion.div
        variants={ANIMATION_PRESETS.slideUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <span className="text-primary-main font-bold tracking-[0.2em] uppercase text-sm mb-4 block">
          For Media
        </span>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
          Press Kit
        </h2>
        <p className="text-neutral-textSecondary text-lg max-w-2xl mx-auto mb-6">
          Everything you need to cover T.O.N.Y. Download high-resolution assets, logos, and official documentation.
        </p>
        <div className="w-20 h-1 bg-primary-main mx-auto" />
      </motion.div>

      {/* Quick Facts */}
      <QuickFacts facts={QUICK_FACTS} />

      {/* Download All CTA */}
      <motion.div
        variants={ANIMATION_PRESETS.fadeIn}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true }}
        className="flex justify-center mb-12"
      >
        <Button variant="primary" className="gap-2">
          <Download size={18} />
          Download All Assets (250 MB)
        </Button>
      </motion.div>

      {/* Category Tabs */}
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Asset Grid */}
      <motion.div
        variants={ANIMATION_PRESETS.containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredAssets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </motion.div>

      {/* Story Pitch */}
      <motion.div
        variants={ANIMATION_PRESETS.slideUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true }}
        className="bg-neutral-surface border border-neutral-border rounded-lg p-8 mt-16"
      >
        <h3 className="font-display text-2xl font-bold text-white mb-4">
          The Story
        </h3>
        <p className="text-neutral-textSecondary text-lg leading-relaxed mb-6">
          In the unforgiving streets of the Bronx, power is earned, loyalty is tested, and survival comes at a cost.
          T.O.N.Y. (Top Of New York) delivers a raw, unfiltered crime saga that exposes the power struggles between
          street organizations and law enforcement—told from the inside by someone who lived it.
        </p>
        <div className="bg-primary-main/10 border-l-4 border-primary-main p-4 rounded-r-lg">
          <p className="font-bold text-white mb-2">Why This Story Now</p>
          <p className="text-neutral-textSecondary">
            T.O.N.Y. fills a void in television—a flagship Bronx crime drama that doesn't romanticize or sanitize
            the streets. Creator Michael Steven-Paul draws from his own experiences to craft characters so authentic
            that audiences will recognize pieces of people they know, or once knew. This is truth without filters,
            without compromise.
          </p>
        </div>
      </motion.div>

      {/* Press Contacts */}
      <ContactCard contacts={PRESS_CONTACTS} />
    </Section>
  );
};
