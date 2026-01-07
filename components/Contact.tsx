import React from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Section } from './ui/Section';
import { Button } from './ui/Button';

export const Contact: React.FC = () => {
  return (
    <Section id="contact" className="relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-main/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-2xl mx-auto text-center mb-12">
        <h2 className="font-display text-4xl font-bold text-white mb-4">Join the Informant List</h2>
        <p className="text-neutral-textSecondary">
          Get exclusive access to behind-the-scenes content and early episode releases.
        </p>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-xl mx-auto bg-neutral-surface border border-neutral-border p-8 rounded-2xl shadow-2xl relative z-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-xs font-bold uppercase text-neutral-textSecondary">Name</label>
            <input 
              type="text" 
              id="name" 
              className="bg-neutral-bg border border-neutral-border rounded p-3 text-white focus:outline-none focus:border-primary-main transition-colors"
              placeholder="John Doe"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-xs font-bold uppercase text-neutral-textSecondary">Email</label>
            <input 
              type="email" 
              id="email" 
              className="bg-neutral-bg border border-neutral-border rounded p-3 text-white focus:outline-none focus:border-primary-main transition-colors"
              placeholder="john@example.com"
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-2 mb-8">
            <label htmlFor="message" className="text-xs font-bold uppercase text-neutral-textSecondary">Message (Optional)</label>
            <textarea 
              id="message" 
              rows={4}
              className="bg-neutral-bg border border-neutral-border rounded p-3 text-white focus:outline-none focus:border-primary-main transition-colors resize-none"
              placeholder="Tell us what you think..."
            />
        </div>

        <Button variant="primary" className="w-full">
          Subscribe <Send size={16} />
        </Button>
      </motion.form>
    </Section>
  );
};
