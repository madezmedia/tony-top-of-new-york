import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Instagram, Twitter, Globe } from 'lucide-react';
import { Section } from './ui/Section';
import { ENHANCED_CAST, CAST_GROUPS } from '../constants';
import { ANIMATION_PRESETS } from '../utils/animations';
import { EnhancedCastMember } from '../types';
import { FeaturedPlayer } from './players/FeaturedPlayer';
import { PlayerGrid } from './players/PlayerGrid';
import { CastStats } from './players/CastStats';
import { GroupPreview } from './players/GroupPreview';
import { CastList } from './cast/CastList';

export const Players: React.FC = () => {
  const featuredCast = ENHANCED_CAST.filter((member) => member.isFeatured);
  const [activePlayer, setActivePlayer] = useState<EnhancedCastMember>(
    featuredCast[0]
  );
  const [selectedMember, setSelectedMember] = useState<EnhancedCastMember | null>(null);

  const getMemberCountByGroup = (groupId: string) => {
    return ENHANCED_CAST.filter((member) => member.group === groupId).length;
  };

  const handleViewProfile = () => {
    setSelectedMember(activePlayer);
  };

  return (
    <Section id="cast" className="bg-neutral-surface/30">
      {/* Section Header */}
      <motion.div
        variants={ANIMATION_PRESETS.slideUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
          The Players
        </h2>
        <p className="text-neutral-textSecondary max-w-2xl mx-auto">
          Meet the ensemble cast bringing the streets of New York to life
        </p>
        <div className="w-20 h-1 bg-primary-main mx-auto mt-4" />
      </motion.div>

      {/* Featured Player Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-10"
      >
        <FeaturedPlayer player={activePlayer} onViewProfile={handleViewProfile} />
      </motion.div>

      {/* Player Selection Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-12"
      >
        <h3 className="text-center text-neutral-textSecondary text-sm uppercase tracking-wider mb-4">
          Select a Player
        </h3>
        <PlayerGrid
          players={featuredCast}
          activePlayerId={activePlayer.id}
          onSelectPlayer={setActivePlayer}
        />
      </motion.div>

      {/* Cast Statistics */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-12"
      >
        <CastStats />
      </motion.div>

      {/* Character Groups Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-12"
      >
        <h3 className="text-center text-neutral-textSecondary text-sm uppercase tracking-wider mb-6">
          Character Groups
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {CAST_GROUPS.map((group) => (
            <GroupPreview
              key={group.id}
              group={group}
              memberCount={getMemberCountByGroup(group.id)}
            />
          ))}
        </div>
      </motion.div>

      {/* Full Cast Accordion List */}
      <CastList />

      {/* Creator Credit Block */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-20 text-center"
      >
        <div className="inline-block border-t border-b border-neutral-border py-6 px-12">
          <p className="text-neutral-textSecondary text-sm uppercase tracking-[0.3em] mb-2">
            Written & Directed By
          </p>
          <p className="font-display text-2xl md:text-3xl text-primary-main font-bold">
            A Michael Steven-Paul Film
          </p>
        </div>
      </motion.div>

      {/* Cast Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMember(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="relative w-full max-w-5xl bg-neutral-surface border border-neutral-border rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                type="button"
                aria-label="Close modal"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMember(null);
                }}
                className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-primary-main rounded-full text-white transition-colors"
              >
                <X size={24} />
              </button>

              {/* Image Side */}
              <div className="md:w-5/12 relative h-64 md:h-auto shrink-0">
                <img
                  src={selectedMember.imageUrl}
                  alt={selectedMember.actorName}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-surface to-transparent md:bg-gradient-to-r" />
              </div>

              {/* Text Side */}
              <div className="md:w-7/12 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-neutral-bg bg-primary-main rounded-sm uppercase">
                    {selectedMember.characterName}
                  </span>
                  <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-2">
                    {selectedMember.actorName}
                  </h2>
                  <p className="text-neutral-textSecondary italic">
                    Actor / Producer
                  </p>
                </div>

                <div className="space-y-6 text-neutral-text text-lg leading-relaxed font-light">
                  <p>
                    {selectedMember.bio ||
                      `Bringing a raw intensity to the role of ${selectedMember.characterName}.`}
                  </p>
                  <p>
                    Bringing a raw intensity to the role,{' '}
                    {selectedMember.actorName.split(' ')[0]} captures the
                    essence of a character caught between two worlds. With a
                    background in independent cinema, they bring an authentic,
                    unfiltered approach that defines the tone of T.O.N.Y.
                  </p>
                  <p className="text-neutral-textSecondary text-base">
                    "It's not just about the crime, it's about the cost of
                    survival in a city that demands everything from you."
                  </p>
                </div>

                <div className="mt-10 pt-8 border-t border-neutral-border/50">
                  <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-[0.2em] text-neutral-muted">
                    Follow Cast Member
                  </h4>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      aria-label="Follow on Instagram"
                      className="w-12 h-12 rounded-full bg-neutral-bg border border-neutral-border flex items-center justify-center text-neutral-textSecondary hover:border-primary-main hover:text-primary-main hover:scale-110 transition-all"
                    >
                      <Instagram size={20} />
                    </button>
                    <button
                      type="button"
                      aria-label="Follow on Twitter"
                      className="w-12 h-12 rounded-full bg-neutral-bg border border-neutral-border flex items-center justify-center text-neutral-textSecondary hover:border-primary-main hover:text-primary-main hover:scale-110 transition-all"
                    >
                      <Twitter size={20} />
                    </button>
                    <button
                      type="button"
                      aria-label="Visit website"
                      className="w-12 h-12 rounded-full bg-neutral-bg border border-neutral-border flex items-center justify-center text-neutral-textSecondary hover:border-primary-main hover:text-primary-main hover:scale-110 transition-all"
                    >
                      <Globe size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Section>
  );
};
