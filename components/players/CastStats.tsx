import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Users, Layers, Star, Film } from 'lucide-react';

interface StatItem {
  value: number;
  label: string;
  icon: React.ReactNode;
}

const stats: StatItem[] = [
  { value: 58, label: 'Cast Members', icon: <Users size={20} /> },
  { value: 6, label: 'Character Groups', icon: <Layers size={20} /> },
  { value: 7, label: 'Main Cast', icon: <Star size={20} /> },
  { value: 1, label: 'Creator/Director', icon: <Film size={20} /> },
];

function AnimatedCounter({ value, inView }: { value: number; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const duration = 1500;
    const increment = value / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, inView]);

  return <span>{count}</span>;
}

export const CastStats: React.FC = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="flex flex-wrap justify-center gap-6 md:gap-12 py-8 border-y border-neutral-border/30"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="text-center min-w-[100px]"
        >
          <div className="flex items-center justify-center gap-2 mb-2 text-primary-main">
            {stat.icon}
            <span className="text-3xl md:text-4xl font-bold">
              <AnimatedCounter value={stat.value} inView={inView} />
            </span>
          </div>
          <p className="text-sm text-neutral-textSecondary">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};
