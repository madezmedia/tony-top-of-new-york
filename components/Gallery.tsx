import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Section } from './ui/Section';
import { GALLERY_IMAGES } from '../constants';
import { ANIMATION_PRESETS } from '../utils/animations';
import { buildImageUrl } from '../lib/media';

export const Gallery: React.FC = () => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % GALLERY_IMAGES.length : null
    );
  }, []);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null
        ? (prev - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length
        : null
    );
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    },
    [closeLightbox, goNext, goPrev]
  );

  const currentImage =
    lightboxIndex !== null ? GALLERY_IMAGES[lightboxIndex] : null;

  return (
    <Section id="gallery">
      {/* Header */}
      <motion.div
        variants={ANIMATION_PRESETS.slideUp}
        initial="initial"
        whileInView="whileInView"
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <span className="text-primary-main font-bold tracking-[0.2em] uppercase text-sm mb-4 block">
          Behind the Scenes
        </span>
        <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
          Gallery
        </h2>
        <p className="text-neutral-textSecondary text-lg max-w-2xl mx-auto mb-6">
          An exclusive look behind the cameras of T.O.N.Y. — from late-night shoots in the Bronx to the final wrap.
        </p>
        <div className="w-20 h-1 bg-primary-main mx-auto" />
      </motion.div>

      {/* Image Grid */}
      <motion.div
        variants={ANIMATION_PRESETS.containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {GALLERY_IMAGES.map((image, index) => (
          <motion.div
            key={image.id}
            variants={ANIMATION_PRESETS.itemVariants}
            className="relative group cursor-pointer overflow-hidden rounded-lg aspect-[16/9]"
            onClick={() => openLightbox(index)}
          >
            <img
              src={image.imageUrl}
              alt={image.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <div>
                <p className="text-white font-semibold text-sm">{image.title}</p>
                {image.caption && (
                  <p className="text-neutral-textSecondary text-xs mt-1 line-clamp-2">
                    {image.caption}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {currentImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={closeLightbox}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="dialog"
            aria-label="Image lightbox"
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
              aria-label="Close lightbox"
            >
              <X size={28} />
            </button>

            {/* Previous */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-4 md:left-8 text-white/70 hover:text-white transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft size={36} />
            </button>

            {/* Image */}
            <motion.div
              key={currentImage.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="max-w-5xl max-h-[85vh] mx-16 flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={buildImageUrl('gallery', currentImage.id, 'hero')}
                alt={currentImage.title}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
              <div className="text-center mt-4">
                <p className="text-white font-semibold text-lg">
                  {currentImage.title}
                </p>
                {currentImage.caption && (
                  <p className="text-neutral-textSecondary text-sm mt-1">
                    {currentImage.caption}
                  </p>
                )}
                <p className="text-neutral-textSecondary/50 text-xs mt-2">
                  {lightboxIndex! + 1} / {GALLERY_IMAGES.length}
                </p>
              </div>
            </motion.div>

            {/* Next */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-4 md:right-8 text-white/70 hover:text-white transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight size={36} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
};
