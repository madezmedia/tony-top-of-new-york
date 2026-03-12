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

      {/* Watch Now Preview Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
      >
        {/* Video Preview Column */}
        <div className="lg:col-span-7 relative aspect-video rounded-sm overflow-hidden border border-primary-main/30 shadow-[0_0_50px_rgba(230,16,37,0.2)] bg-black">
          <iframe
            src="https://player.mux.com/I3X2sr1TRI02p01fLABUS01v6BCzsUcbeLmBQm9OMjm6vU?metadata-video-title=Top+of+New+York+-+Preview&video-title=Top+of+New+York+-+Preview"
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
            allowFullScreen
          ></iframe>
        </div>

        {/* CTA Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-block px-3 py-1 bg-primary-main/20 border border-primary-main/40 rounded-sm text-primary-main text-xs font-bold tracking-widest uppercase">
            Special Preview
          </div>
          <h4 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight">
            Witness the beginning of the <span className="text-primary-main">Cortez Legacy</span>.
          </h4>
          <p className="text-neutral-textSecondary text-lg leading-relaxed">
            Own the complete first season uncensored in 4K. Immediate access on all your devices including Roku, Web, and Mobile.
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex flex-col">
              <span className="text-4xl font-bold text-white">{priceDisplay}</span>
              <span className="text-xs text-neutral-muted uppercase tracking-wider">Full Season Pass</span>
            </div>
            <a href="/watch" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto group px-8">
                Buy Now To Watch <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-border/30">
            <div className="flex items-center gap-2 text-xs text-neutral-textSecondary">
              <Play size={14} className="text-primary-main" /> Uncensored 4K
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-textSecondary">
              <Tv size={14} className="text-primary-main" /> Roku App Ready
            </div>
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
              whileHover={{ y: -5, scale: 1.02 }}
              className="group cursor-pointer"
            >
              <div className="relative aspect-video rounded-sm overflow-hidden mb-4 border border-primary-main/20 group-hover:border-primary-main/60 group-hover:shadow-[0_0_20px_rgba(230,16,37,0.3)] transition-all duration-300">
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
