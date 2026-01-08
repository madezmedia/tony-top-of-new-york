import React from 'react';
import { motion } from 'framer-motion';

const PLATFORMS = [
  { id: 'roku', name: 'Roku', logo: '/images/streaming/roku.svg' },
  { id: 'tubi', name: 'Tubi', logo: '/images/streaming/tubi.svg' },
  { id: 'apple-tv', name: 'Apple TV', logo: '/images/streaming/apple-tv.svg' },
  { id: 'google-tv', name: 'Google TV', logo: '/images/streaming/google-tv.svg' },
];

export const StreamingPlatforms: React.FC = () => {
  // Double the platforms for seamless infinite scroll
  const duplicatedPlatforms = [...PLATFORMS, ...PLATFORMS];

  return (
    <div className="py-12">
      <h3 className="text-center text-primary-main font-bold tracking-[0.2em] uppercase text-sm mb-8">
        Watch Now On
      </h3>

      <div className="relative overflow-hidden bg-gradient-to-r from-neutral-bg via-neutral-surface/40 to-neutral-bg py-10 rounded-xl border border-neutral-border">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-neutral-bg to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-neutral-bg to-transparent z-10" />

        {/* Marquee track */}
        <motion.div
          className="flex gap-16 items-center"
          animate={{
            x: ['0%', '-50%'],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 20,
              ease: 'linear',
            },
          }}
          whileHover={{ animationPlayState: 'paused' }}
        >
          {duplicatedPlatforms.map((platform, index) => (
            <div
              key={`${platform.id}-${index}`}
              className="flex-shrink-0 w-44 h-20 flex items-center justify-center px-6 py-4 bg-white/5 rounded-lg border border-neutral-border/50 grayscale brightness-75 hover:grayscale-0 hover:brightness-100 hover:border-primary-main/50 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
            >
              <img
                src={platform.logo}
                alt={`Watch on ${platform.name}`}
                className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  // Fallback to text if image fails
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `<span class="text-white font-bold text-lg tracking-wide">${platform.name.toUpperCase()}</span>`;
                }}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Static fallback grid for mobile or if marquee doesn't work well */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:hidden">
        {PLATFORMS.map((platform) => (
          <div
            key={platform.id}
            className="flex items-center justify-center p-4 bg-neutral-surface/40 rounded-lg border border-neutral-border hover:border-primary-main/50 transition-colors"
          >
            <span className="text-white font-bold text-sm tracking-wider">
              {platform.name.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
