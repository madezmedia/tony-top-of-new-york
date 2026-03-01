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
    <Section id="episodes">
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

      {/* CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mb-10 bg-gradient-to-r from-primary-main/20 via-primary-main/10 to-transparent border border-primary-main/30 rounded-xl p-6 md:p-8"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex w-12 h-12 rounded-lg bg-primary-main/20 items-center justify-center flex-shrink-0">
              <Tv className="text-primary-main" size={24} />
            </div>
            <div>
              <h4 className="text-xl md:text-2xl font-display font-bold text-white mb-2">
                Episode 1 Available Now • Own the Full Season for {priceDisplay}
              </h4>
              <div className="flex flex-wrap gap-4 text-sm text-neutral-textSecondary">
                <span className="flex items-center gap-1.5">
                  <Play size={14} className="text-primary-main" /> Watch Episode 1 now
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-primary-main" /> Episodes 2 & 3 in production
                </span>
                <span className="flex items-center gap-1.5">
                  <Download size={14} className="text-primary-main" /> Download in 4K
                </span>
                <span className="flex items-center gap-1.5">
                  <Tv size={14} className="text-primary-main" /> Future episodes included
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <div className="text-center md:text-right">
              <span className="text-3xl md:text-4xl font-bold text-primary-main">{priceDisplay}</span>
              <p className="text-xs text-neutral-textSecondary mt-1">One-time purchase</p>
            </div>
            <a href="/watch">
              <Button variant="primary" className="whitespace-nowrap">
                Watch Now <ChevronRight size={18} />
              </Button>
            </a>
          </div>
        </div>
      </motion.div>

      {/* Episode Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {EPISODES.map((ep, index) => {
          const CardContent = (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-video rounded-lg overflow-hidden mb-4 border border-neutral-border group-hover:border-primary-main/50 transition-colors">
                <img
                  src={ep.thumbnailUrl}
                  alt={ep.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Overlay - different for available vs in-production vs locked */}
                {ep.status === 'available' ? (
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <PlayCircle size={48} className="text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                  </div>
                ) : ep.status === 'in-production' || ep.status === 'coming-soon' ? (
                  <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                    <div className="text-center px-4">
                      <Calendar size={32} className="text-white/60 mx-auto mb-2" />
                      {ep.releaseDate && (
                        <p className="text-white/90 text-sm font-medium tracking-wide">{ep.releaseDate}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Lock size={28} className="text-white/80" />
                    </div>
                  </div>
                )}

                {/* Badge */}
                <div className="absolute top-3 left-3">
                  {ep.status === 'available' && !ep.isFree ? (
                    <span className="bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wide">
                      Available Now
                    </span>
                  ) : ep.status === 'available' && ep.isFree ? (
                    <span className="bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wide">
                      Available • Free
                    </span>
                  ) : ep.status === 'in-production' ? (
                    <span className="bg-orange-600 text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wide">
                      In Production
                    </span>
                  ) : ep.status === 'coming-soon' ? (
                    <span className="bg-primary-main text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wide">
                      Coming Soon
                    </span>
                  ) : (
                    <span className="bg-neutral-bg/90 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded flex items-center gap-1.5">
                      <Lock size={10} /> ${(FILM_PRICE_CENTS / 100).toFixed(2)} to unlock
                    </span>
                  )}
                </div>

                {/* Duration */}
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-mono text-white">
                  {ep.duration}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-neutral-textSecondary mb-2">
                <span className="font-bold text-primary-main">EP {ep.number}</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> {ep.airDate}</span>
              </div>

              <h4 className="text-xl font-bold text-white mb-2 group-hover:text-primary-main transition-colors">
                {ep.title}
              </h4>
              <p className="text-neutral-textSecondary text-sm line-clamp-2">
                {ep.description}
              </p>

              {/* Hover CTA hint */}
              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-primary-main opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {ep.status === 'available' && ep.isFree ? (
                  <>
                    <Play size={14} fill="currentColor" /> Watch Free
                  </>
                ) : ep.status === 'available' && !ep.isFree ? (
                  <>
                    <Lock size={14} /> Unlock for {priceDisplay}
                  </>
                ) : ep.status === 'in-production' || ep.status === 'coming-soon' ? (
                  <>
                    <Calendar size={14} /> {ep.releaseDate || 'Coming Soon'}
                  </>
                ) : (
                  <>
                    <Lock size={14} /> Unlock Episode
                  </>
                )}
              </div>
            </motion.div>
          );

          // If in production or coming soon, don't make it clickable
          if (ep.status === 'in-production' || ep.status === 'coming-soon') {
            return (
              <div key={ep.id} className="opacity-80 cursor-not-allowed">
                {CardContent}
              </div>
            );
          }

          // Available or locked episodes are clickable
          return (
            <a
              href={ep.isFree ? `/watch/${ep.slug}` : '/watch'}
              key={ep.id}
              className="block"
            >
              {CardContent}
            </a>
          );
        })}
      </div>
    </Section>
  );
};
