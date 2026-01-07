import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play, Info } from 'lucide-react';
import { Button } from './ui/Button';
import { TrailerModal } from './TrailerModal';
import { ANIMATION_PRESETS } from '../utils/animations';
import { buildImageUrl } from '../lib/media';

export const Hero: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 400]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* Parallax Background Layer */}
      <motion.div style={{ y }} className="absolute inset-0 z-0">
        {/* Simulating Video Background with High-Res Image for reliability without huge assets */}
        <div className="absolute inset-0 bg-neutral-900">
           <img
            src={buildImageUrl('promotional', 'hero-background', 'hero')}
            alt="T.O.N.Y. Series Background"
            className="w-full h-full object-cover opacity-60"
           />
           {/* In a real scenario, use <video> here:
           <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-60">
             <source src="/hero-bg.mp4" type="video/mp4" />
           </video> 
           */}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-bg via-transparent to-neutral-bg/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-bg/80 via-transparent to-neutral-bg/80" />
      </motion.div>

      {/* Content */}
      <motion.div 
        style={{ opacity }}
        className="relative z-10 container mx-auto px-4 text-center flex flex-col items-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="text-primary-main font-bold tracking-[0.2em] uppercase text-sm md:text-base mb-4 block">
            A Michael Steven-Paul Crime Series
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-6 relative"
        >
          <img
            src={buildImageUrl('brand', 'tony-logo', 'hero')}
            alt="T.O.N.Y."
            className="h-32 md:h-48 w-auto object-contain mx-auto"
            style={{ filter: 'drop-shadow(0 0 40px rgba(50,184,198,0.4))' }}
          />
        </motion.div>

        <motion.p
          variants={ANIMATION_PRESETS.slideUp}
          initial="initial"
          animate="whileInView"
          className="text-neutral-textSecondary text-lg md:text-2xl max-w-2xl mb-10 leading-relaxed font-light"
        >
          In a city that never sleeps, the line between justice and corruption is written in blood.
        </motion.p>

        <motion.div 
          className="flex flex-col md:flex-row gap-4 w-full md:w-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Button
            variant="primary"
            className="w-full md:w-auto"
            onClick={() => setIsTrailerOpen(true)}
          >
            <Play size={18} fill="currentColor" /> Watch Trailer
          </Button>
          <Button variant="outline" className="w-full md:w-auto">
            <Info size={18} /> About Series
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-neutral-textSecondary/50"
      >
        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-primary-main to-transparent" />
      </motion.div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
      />
    </section>
  );
};
