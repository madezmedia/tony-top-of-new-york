import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { X, Zap, Heart, Shield, Eye, Target } from 'lucide-react';

interface FullSynopsisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Synopsis content
const SYNOPSIS_CONTENT = {
  logline: "In the unforgiving streets of the Bronx, ambition, loyalty, and survival collide as T.O.N.Y. delivers a raw, unfiltered crime saga that exposes the power struggles between street organizations and law enforcement—told from the inside by someone who lived it.",

  fullStory: [
    {
      number: '01',
      title: 'THE SETUP',
      content: "Michael \"El Bastardo\" Cortez has spent his entire life navigating the brutal realities of the Bronx. A key player in the streets, he's built a reputation on respect, loyalty, and a code that keeps him alive in a world where power is the only currency that matters.",
    },
    {
      number: '02',
      title: 'THE CONFLICT',
      content: "But when his past collides with the present, Michael finds himself caught between the Cortez dynasty he's sworn to protect and the Beaumont empire that threatens to tear everything apart. Detective Sarah Barnes is closing in, the streets are heating up, and Billy Black—his oldest rival—is making moves that could start a war.",
    },
    {
      number: '03',
      title: 'THE STAKES',
      content: "As alliances fracture and betrayals mount, Michael must decide who he can trust in a department riddled with corruption and a neighborhood where silence is survival. The closer he gets to the truth, the more dangerous the city becomes.",
    },
    {
      number: '04',
      title: 'THE VISION',
      content: "What began as a limited series evolved into a seven-season vision, allowing characters and consequences to unfold organically over time. Each season escalates the stakes while staying grounded in the raw realism that defines the Bronx.",
    },
  ],

  themes: [
    {
      icon: Zap,
      title: 'Power & Consequence',
      description: 'In the Bronx, power is earned not given. Every move has consequences, and the streets keep score.',
    },
    {
      icon: Heart,
      title: 'Loyalty vs. Survival',
      description: 'When your brother becomes your enemy, who do you trust in a department full of moles?',
    },
    {
      icon: Shield,
      title: 'Identity & Environment',
      description: "The Bronx isn't just a setting—it's a living, breathing character that shapes destinies.",
    },
    {
      icon: Target,
      title: 'The Cost of Ambition',
      description: "Climbing the ranks demands sacrifices that can't always be undone.",
    },
    {
      icon: Eye,
      title: 'Truth Over Glamor',
      description: "T.O.N.Y. doesn't romanticize street life—it reveals it. No filters. Just truth.",
    },
  ],

  seasonArc: [
    { season: '1', arc: 'Establishes the streets, power players, and rising tension' },
    { season: '2-3', arc: 'Expansion, alliances, and devastating betrayals' },
    { season: '4-5', arc: 'Peak conflict between street and law enforcement' },
    { season: '6', arc: 'Consequences, collapse, and reckoning' },
    { season: '7', arc: 'Legacy, truth, and the final reckoning' },
  ],
};

// 3D Tilt Card Component
interface StoryCard3DProps {
  number: string;
  title: string;
  content: string;
  delay: number;
}

const StoryCard3D: React.FC<StoryCard3DProps> = ({ number, title, content, delay }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setParticles([]);
  };

  const handleMouseEnter = () => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setParticles(newParticles);
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className="group relative"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative bg-neutral-surface/60 backdrop-blur-2xl border border-primary-main/20 rounded-3xl overflow-hidden hover:border-primary-main/60 transition-colors duration-500"
      >
        {/* Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              y: [0, -60],
            }}
            transition={{ duration: 1.5 }}
            style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
            className="absolute w-1 h-1 bg-primary-main rounded-full pointer-events-none"
          />
        ))}

        {/* Content */}
        <div className="p-8 md:p-10" style={{ transform: 'translateZ(50px)' }}>
          {/* Oversized Number Background */}
          <div className="absolute -top-4 -left-4 text-[100px] md:text-[140px] font-black text-primary-main/5 leading-none select-none pointer-events-none">
            {number}
          </div>

          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-black text-primary-main mb-4 md:mb-6">{title}</h3>
            <p className="text-neutral-textSecondary text-base md:text-lg leading-relaxed">{content}</p>
          </div>
        </div>

        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </motion.div>
    </motion.div>
  );
};

// Theme Card Component
interface ThemeCard3DProps {
  theme: {
    icon: React.FC<{ size?: number; className?: string }>;
    title: string;
    description: string;
  };
  delay: number;
}

const ThemeCard3D: React.FC<ThemeCard3DProps> = ({ theme, delay }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const IconComponent = theme.icon;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      style={{ perspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="bg-neutral-surface/40 backdrop-blur-xl border border-neutral-border rounded-xl p-5 h-full hover:border-primary-main/50 transition-all duration-300"
      >
        <div style={{ transform: 'translateZ(30px)' }}>
          <IconComponent
            className="text-primary-main mb-3 group-hover:scale-110 transition-transform duration-300"
            size={28}
          />
          <h4 className="font-display text-base font-bold text-neutral-text mb-2">
            {theme.title}
          </h4>
          <p className="text-neutral-textSecondary text-sm leading-relaxed">
            {theme.description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Logline Card Component
const LoglineCard: React.FC<{ content: string }> = ({ content }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8, delay: 0.2 }}
    className="relative bg-gradient-to-br from-neutral-surface/60 to-neutral-surface/30 backdrop-blur-2xl border border-primary-main/30 rounded-3xl p-8 md:p-12"
  >
    {/* Animated glow */}
    <motion.div
      animate={{
        opacity: [0.3, 0.5, 0.3],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="absolute inset-0 bg-gradient-to-br from-primary-main/10 to-transparent rounded-3xl pointer-events-none"
    />

    <div className="relative z-10">
      <div className="text-primary-main text-4xl mb-4">"</div>
      <p className="text-neutral-text text-lg md:text-xl leading-relaxed italic">
        {content}
      </p>
      <div className="text-primary-main text-4xl text-right mt-4">"</div>
    </div>
  </motion.div>
);

// Season Timeline Component
const SeasonTimeline: React.FC<{ seasons: typeof SYNOPSIS_CONTENT.seasonArc }> = ({ seasons }) => (
  <div className="relative">
    {/* Timeline line */}
    <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary-main via-primary-main/50 to-transparent" />

    <div className="space-y-8">
      {seasons.map((item, index) => (
        <motion.div
          key={item.season}
          initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          className={`relative flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
        >
          {/* Marker */}
          <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-primary-main rounded-full transform -translate-x-1/2 z-10 shadow-lg shadow-primary-main/50" />

          {/* Content */}
          <div className={`ml-12 md:ml-0 ${index % 2 === 0 ? 'md:pr-12 md:text-right md:w-1/2' : 'md:pl-12 md:text-left md:w-1/2 md:ml-auto'}`}>
            <div className="bg-neutral-surface/40 backdrop-blur border border-neutral-border rounded-xl p-4 md:p-6">
              <span className="text-primary-main font-display font-bold text-lg md:text-xl">
                Season {item.season}
              </span>
              <p className="text-neutral-textSecondary text-sm md:text-base mt-2">
                {item.arc}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export const FullSynopsisModal: React.FC<FullSynopsisModalProps> = ({ isOpen, onClose }) => {
  // Close on escape key and lock body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Close Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ delay: 0.2 }}
            onClick={onClose}
            className="fixed top-6 right-6 z-50 w-12 h-12 md:w-14 md:h-14 bg-primary-main/20 backdrop-blur-xl border border-primary-main/50 rounded-full flex items-center justify-center hover:bg-primary-main hover:rotate-90 transition-all duration-300"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </motion.button>

          {/* Scrollable Content */}
          <div className="relative w-full h-full overflow-y-auto overflow-x-hidden">
            <div className="container mx-auto px-4 md:px-6 lg:px-12 py-16 md:py-20">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-5xl mx-auto mb-12 md:mb-20 text-center"
              >
                <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-neutral-text mb-4 md:mb-6">
                  FULL <span className="text-primary-main">SYNOPSIS</span>
                </h1>
                <div className="w-24 md:w-32 h-1 bg-primary-main mx-auto mb-6 md:mb-8" />
                <p className="text-neutral-textSecondary text-base md:text-lg">
                  The complete story of T.O.N.Y. — Top of New York
                </p>
              </motion.div>

              {/* Logline Card */}
              <div className="max-w-5xl mx-auto mb-12 md:mb-20">
                <LoglineCard content={SYNOPSIS_CONTENT.logline} />
              </div>

              {/* Story Breakdown - 3D Cards */}
              <div className="max-w-6xl mx-auto space-y-6 md:space-y-12 mb-12 md:mb-20">
                {SYNOPSIS_CONTENT.fullStory.map((story, index) => (
                  <StoryCard3D
                    key={story.number}
                    {...story}
                    delay={0.3 + index * 0.1}
                  />
                ))}
              </div>

              {/* Themes Grid */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-6xl mx-auto mb-12 md:mb-20"
              >
                <h2 className="text-4xl md:text-5xl font-black text-neutral-text text-center mb-8 md:mb-12">
                  THEMATIC <span className="text-primary-main">CORE</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {SYNOPSIS_CONTENT.themes.map((theme, i) => (
                    <ThemeCard3D key={theme.title} theme={theme} delay={0.1 + i * 0.1} />
                  ))}
                </div>
              </motion.div>

              {/* Season Arc Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-5xl mx-auto pb-8"
              >
                <h2 className="text-4xl md:text-5xl font-black text-neutral-text text-center mb-8 md:mb-12">
                  7-SEASON <span className="text-primary-main">ARC</span>
                </h2>
                <SeasonTimeline seasons={SYNOPSIS_CONTENT.seasonArc} />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
