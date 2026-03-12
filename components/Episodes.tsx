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


      {/* Cinematic Preview Section */}
      <div className="relative mb-24 overflow-hidden rounded-2xl border border-primary-main/20 bg-neutral-bg/40 backdrop-blur-sm shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col lg:flex-row items-stretch">
          {/* Video Preview Side */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full lg:w-2/3 aspect-video relative group"
          >
            <div className="absolute inset-0 bg-primary-main/5 animate-pulse group-hover:bg-transparent transition-colors z-0" />
            <iframe
              src="https://player.mux.com/I3X2sr1TRI02p01fLABUS01v6BCzsUcbeLmBQm9OMjm6vU?metadata-video-title=Top+of+New+York+-+Preview&video-title=Top+of+New+York+-+Preview"
              style={{ width: '100%', height: '100%', border: 'none', position: 'relative', zIndex: 10 }}
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
              allowFullScreen
              title="T.O.N.Y. Series Preview"
            ></iframe>
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary-main z-20" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary-main z-20" />
          </motion.div>

          {/* CTA / Info Side */}
          <div className="w-full lg:w-1/3 p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary-main/10 rounded-full blur-[80px]" />
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-primary-main animate-pulse" />
                <span className="text-primary-main font-bold tracking-[0.3em] uppercase text-xs">Featured Preview</span>
              </div>
              
              <h4 className="font-display text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                Witness the <span className="text-primary-main">Uncensored</span> Premiere
              </h4>
              
              <p className="text-neutral-textSecondary mb-8 text-lg leading-relaxed">
                Experience the raw power of the Bronx. Stream the first look and unlock the full Season 1 legacy.
              </p>
              
              <div className="flex flex-col gap-4">
                <a href="/watch">
                  <Button size="lg" className="w-full shadow-[0_0_20px_rgba(230,16,37,0.3)] hover:shadow-[0_0_30px_rgba(230,16,37,0.5)] transition-all">
                    <Play size={18} fill="currentColor" className="mr-2" /> Start Watching
                  </Button>
                </a>
                <a href="/watch">
                  <Button variant="outline" size="lg" className="w-full">
                    Buy Season Pass
                  </Button>
                </a>
              </div>

              {/* Technical Specs */}
              <div className="mt-10 flex flex-wrap items-center gap-6 opacity-60">
                <div className="flex items-center gap-1.5 text-[10px] text-white uppercase tracking-widest font-bold">
                  <Tv size={14} className="text-primary-main" /> Roku TV
                </div>
                <div className="w-1 h-1 rounded-full bg-neutral-border" />
                <div className="text-[10px] text-white uppercase tracking-widest font-bold">4K HDR</div>
                <div className="w-1 h-1 rounded-full bg-neutral-border" />
                <div className="text-[10px] text-white uppercase tracking-widest font-bold">5.1 Surround</div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Episode Grid */}
      <motion.div
        variants={ANIMATION_PRESETS.slideUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true }}
        className="mb-12"
      >
        <h3 className="font-display text-2xl font-bold text-white flex items-center gap-3">
          Explore Episodes <div className="h-px flex-1 bg-gradient-to-r from-primary-main/50 to-transparent" />
        </h3>
      </motion.div>

      {EPISODES.length > 0 && (
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

                  {/* Overlay */}
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
                    ) : (ep.status === 'in-production' || ep.status === 'coming-soon') ? (
                      <span className="bg-primary-main text-white text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wide">
                        {ep.status === 'in-production' ? 'In Production' : 'Coming Soon'}
                      </span>
                    ) : (
                      <span className="bg-neutral-bg/90 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded flex items-center gap-1.5">
                        <Lock size={10} /> ${ (FILM_PRICE_CENTS / 100).toFixed(2) } to unlock
                      </span>
                    )}
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-mono text-white">
                    {ep.duration}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-neutral-textSecondary mb-2">
                  <span className="font-bold text-primary-main uppercase tracking-tighter">EP {ep.number}</span>
                  <span className="flex items-center gap-1 opacity-70"><Calendar size={12} /> {ep.airDate}</span>
                </div>

                <h4 className="text-xl font-bold text-white mb-2 group-hover:text-primary-main transition-colors">
                  {ep.title}
                </h4>
                <p className="text-neutral-textSecondary text-sm line-clamp-2 leading-relaxed">
                  {ep.description}
                </p>
              </motion.div>
            );

            if (ep.status === 'in-production' || ep.status === 'coming-soon') {
              return (
                <div key={ep.id} className="opacity-80 cursor-not-allowed">
                  {CardContent}
                </div>
              );
            }

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
      )}
    </Section>
  );
};
