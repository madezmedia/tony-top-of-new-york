import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Image } from 'lucide-react';
import { PRESS_ASSETS } from '../../constants';
import { ANIMATION_PRESETS } from '../../utils/animations';

const photoAssets = PRESS_ASSETS.filter((a) => a.category === 'photo');

export const PressGallery: React.FC = () => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % photoAssets.length : null
    );
  }, []);

  const goPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null
        ? (prev - 1 + photoAssets.length) % photoAssets.length
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

  const currentAsset =
    lightboxIndex !== null ? photoAssets[lightboxIndex] : null;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <Image size={18} className="text-primary-main" />
        <h3 className="font-display text-xl font-bold text-white">
          Photo Preview
        </h3>
      </div>

      <motion.div
        variants={ANIMATION_PRESETS.containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {photoAssets.map((asset, index) => (
          <motion.div
            key={asset.id}
            variants={ANIMATION_PRESETS.itemVariants}
            className="relative group cursor-pointer overflow-hidden rounded-lg border border-neutral-border hover:border-primary-main/50 transition-colors"
            onClick={() => openLightbox(index)}
          >
            <div className="aspect-video overflow-hidden">
              <img
                src={asset.thumbnailUrl}
                alt={asset.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
              <p className="text-white text-xs font-semibold">{asset.title}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {currentAsset && (
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
            aria-label="Press image preview"
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-10"
              aria-label="Close preview"
            >
              <X size={28} />
            </button>

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

            <motion.div
              key={currentAsset.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="max-w-5xl max-h-[85vh] mx-16 flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={currentAsset.thumbnailUrl}
                alt={currentAsset.title}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
              <div className="text-center mt-4">
                <p className="text-white font-semibold text-lg">
                  {currentAsset.title}
                </p>
                <p className="text-neutral-textSecondary text-sm mt-1">
                  {currentAsset.description}
                </p>
                <p className="text-neutral-textSecondary/50 text-xs mt-2">
                  {lightboxIndex! + 1} / {photoAssets.length}
                </p>
              </div>
            </motion.div>

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
    </div>
  );
};
