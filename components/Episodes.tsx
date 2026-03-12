import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Calendar, Lock, ChevronRight, Play, Download, Tv } from 'lucide-react';
import { Section } from './ui/Section';
import { Button } from './ui/Button';
import { EPISODES } from '../constants';
import { ANIMATION_PRESETS } from '../utils/animations';

const FILM_PRICE_CENTS = 499;

export const Episodes: React.FC = () => {
  const priceDisplay = `$${(FILM_PRICE_CENTS / 100).toFixed(2)}`;

  return (
    <Section id="episodes" className="bg-black/95 relative border-y border-primary-main/10 shadow-[inset_0_0_100px_rgba(0,0,0,1)]">
      {/* Header */}
      <motion.div
        variants={ANIMATION_PRESETS.slideUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true }}
        className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4"
      >
        <div>
          <h2 className="text-primary-main font-bold tracking-widest uppercase mb-2">Watch Now</h2>
          <h3 className="font-display text-4xl md:text-5xl font-bold text-white">Season 1</h3>
        </div>
        <a
          href="/watch"
          className="text-white hover:text-primary-main underline underline-offset-4 transition-colors flex items-center gap-1"
        >
          View All Episodes <ChevronRight size={16} />
        </a>
      </motion.div>


      <div className="flex flex-col lg:flex-row gap-12 items-center">
        {/* Preview Video */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="w-full lg:w-2/3 aspect-video rounded-xl overflow-hidden border border-primary-main/30 shadow-[0_0_50px_rgba(230,16,37,0.1)]"
        >
          <iframe
            src="https://player.mux.com/I3X2sr1TRI02p01fLABUS01v6BCzsUcbeLmBQm9OMjm6vU?metadata-video-title=Top+of+New+York+-+Preview&video-title=Top+of+New+York+-+Preview"
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
          ></iframe>
        </motion.div>

        {/* CTA Column */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="w-full lg:w-1/3 text-center lg:text-left"
        >
          <h4 className="text-2xl font-bold text-white mb-4">Witness the Beginning</h4>
          <p className="text-neutral-textSecondary mb-8 text-lg">
            Stream the uncensored premiere and unlock the full season pass today. Experience the Bronx like never before.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <a href="/watch">
              <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-xl">
                Watch Now
              </Button>
            </a>
            <a href="/watch">
              <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
                Buy Season Pass
              </Button>
            </a>
          </div>
          <div className="mt-8 flex items-center gap-4 justify-center lg:justify-start opacity-70">
            <div className="flex items-center gap-1 text-xs text-white uppercase tracking-widest font-bold">
              <Tv size={14} className="text-primary-main" /> Roku TV
            </div>
            <div className="w-1 h-1 rounded-full bg-neutral-border"></div>
            <div className="text-xs text-white uppercase tracking-widest font-bold">4K Ultra HD</div>
            <div className="w-1 h-1 rounded-full bg-neutral-border"></div>
            <div className="text-xs text-white uppercase tracking-widest font-bold">5.1 Audio</div>
          </div>
        </motion.div>
      </div>

      {/* Episode Grid - Hidden when empty */}
      {EPISODES.length > 0 && (
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* ... existing code ... */}
        </div>
      )}
    </Section>
  );
};
