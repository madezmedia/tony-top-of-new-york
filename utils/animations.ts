import { Variants } from 'framer-motion';

export const ANIMATION_PRESETS = {
  fadeIn: {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  slideUp: {
    initial: { y: 50, opacity: 0 },
    whileInView: { y: 0, opacity: 1 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: 'easeOut' },
  },
  containerVariants: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  },
  itemVariants: {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  },
  hoverScale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
  glowPulse: {
    animate: {
      textShadow: [
        '0 0 20px rgba(255, 23, 68, 0.3)',
        '0 0 30px rgba(255, 23, 68, 0.6)',
        '0 0 20px rgba(255, 23, 68, 0.3)',
      ],
    },
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
  // Bento grid animations for Core Themes section
  bentoCardVariants: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, ease: 'easeOut' },
    },
  },
  glowingOrbPulse: {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.2, 0.4, 0.2],
    },
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
  accentLineReveal: {
    initial: { width: 0 },
    whileInView: { width: '100%' },
    viewport: { once: true },
    transition: { duration: 1, delay: 0.5, ease: 'easeOut' },
  },
};
