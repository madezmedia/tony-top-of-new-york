import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { EnhancedCastMember } from '../../types';
import { TraitTag } from './TraitTag';

interface FeaturedPlayerProps {
  player: EnhancedCastMember;
  onViewProfile: () => void;
}

export const FeaturedPlayer: React.FC<FeaturedPlayerProps> = ({
  player,
  onViewProfile,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-stretch">
      {/* Large Player Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={player.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-3 relative aspect-[3/4] lg:aspect-auto lg:h-[500px] rounded-xl overflow-hidden"
        >
          <img
            src={player.imageUrl}
            alt={player.actorName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

          {/* Character Name Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            {player.alias && (
              <span className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-wider text-neutral-bg bg-primary-main rounded-sm uppercase">
                {player.alias}
              </span>
            )}
            <h3 className="font-display text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
              {player.characterName}
            </h3>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Player Info */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`info-${player.id}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-2 flex flex-col justify-center"
          aria-live="polite"
        >
          <div className="space-y-4">
            {/* Actor Name */}
            <div>
              <p className="text-neutral-textSecondary text-sm uppercase tracking-wider mb-1">
                Played by
              </p>
              <h4 className="font-display text-2xl md:text-3xl font-bold text-white">
                {player.actorName}
              </h4>
            </div>

            {/* Traits */}
            {player.traits && player.traits.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {player.traits.map((trait) => (
                  <TraitTag key={trait} trait={trait} />
                ))}
              </div>
            )}

            {/* Bio */}
            <p className="text-neutral-textSecondary text-base leading-relaxed line-clamp-4">
              {player.bio ||
                `Bringing depth and authenticity to the role of ${player.characterName}.`}
            </p>

            {/* View Profile CTA */}
            <button
              type="button"
              onClick={onViewProfile}
              className="inline-flex items-center gap-2 text-primary-main hover:text-primary-light font-bold text-sm uppercase tracking-wider transition-colors group mt-2"
            >
              <span>View Full Profile</span>
              <ChevronRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
