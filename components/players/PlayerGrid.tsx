import React from 'react';
import { motion } from 'framer-motion';
import { EnhancedCastMember } from '../../types';

interface PlayerGridProps {
  players: EnhancedCastMember[];
  activePlayerId: string;
  onSelectPlayer: (player: EnhancedCastMember) => void;
}

export const PlayerGrid: React.FC<PlayerGridProps> = ({
  players,
  activePlayerId,
  onSelectPlayer,
}) => {
  return (
    <div
      role="listbox"
      aria-label="Select a featured cast member"
      className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4"
    >
      {players.map((player) => {
        const isActive = player.id === activePlayerId;
        return (
          <motion.button
            key={player.id}
            type="button"
            role="option"
            aria-selected={isActive}
            onClick={() => onSelectPlayer(player)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
              isActive
                ? 'ring-2 ring-primary-main ring-offset-2 ring-offset-neutral-bg scale-105'
                : 'opacity-70 hover:opacity-100 grayscale-[30%] hover:grayscale-0'
            }`}
          >
            <img
              src={player.imageUrl}
              alt={player.actorName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <p className="text-white text-xs font-medium truncate">
                {player.alias || player.characterName.split(' ')[0]}
              </p>
            </div>
            {isActive && (
              <motion.div
                layoutId="activePlayerIndicator"
                className="absolute inset-0 border-2 border-primary-main rounded-lg"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};
