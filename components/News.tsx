import React from 'react';
import { motion } from 'framer-motion';
import { Section } from './ui/Section';
import { NEWS_ITEMS } from '../constants';
import { Button } from './ui/Button';
import { ArrowRight } from 'lucide-react';

export const News: React.FC = () => {
  return (
    <Section id="news" className="bg-neutral-surface/20">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Header Column */}
        <div className="md:w-1/3">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl font-bold text-white mb-6 sticky top-24"
          >
            Latest <br/> <span className="text-primary-main">Intel</span>
          </motion.h2>
          <p className="text-neutral-textSecondary mb-8">
            Stay up to date with production news, casting announcements, and exclusive events.
          </p>
          <a href="#presskit">
            <Button variant="outline">
              Press Kit
            </Button>
          </a>
        </div>

        {/* News Feed */}
        <div className="md:w-2/3 flex flex-col gap-8">
          {NEWS_ITEMS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col md:flex-row gap-6 bg-neutral-surface border border-neutral-border p-4 rounded-lg hover:border-primary-main/30 transition-colors group"
            >
              <div className="md:w-1/3 aspect-video md:aspect-auto overflow-hidden rounded">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="md:w-2/3 flex flex-col justify-center">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-xs font-bold text-primary-main px-2 py-1 bg-primary-main/10 rounded uppercase tracking-wider">
                     {item.category}
                   </span>
                   <span className="text-xs text-neutral-textSecondary">{item.date}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-light transition-colors">{item.title}</h3>
                <p className="text-neutral-textSecondary text-sm mb-4">{item.summary}</p>
                <a href="#" className="inline-flex items-center text-sm font-bold text-white hover:text-primary-main transition-colors gap-2">
                  Read More <ArrowRight size={16} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
};
